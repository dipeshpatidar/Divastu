package com.indore.divyavastu.spaces.service;

import com.indore.divyavastu.spaces.dto.ParsedPropertyDTO;
import com.indore.divyavastu.spaces.entity.Locality;
import com.indore.divyavastu.spaces.repository.LocalityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PropertyParserService {

    private static final Logger log = LoggerFactory.getLogger(PropertyParserService.class);

    private final LocalityRepository localityRepository;

    public PropertyParserService(LocalityRepository localityRepository) {
        this.localityRepository = localityRepository;
    }

    public ParsedPropertyDTO parseAndSave(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return new ParsedPropertyDTO();
        }

        String input = prompt.trim();
        String cleanLower = input.toLowerCase();

        // 1. Extract BHK / Layout (handles both '4bhk' and '4 bhk' / '4 bedroom')
        Pattern bhkPattern = Pattern.compile("(?:\\b|\\b)([1-9])\\s*(?:bhk|rk|bedroom|room)\\b|\\b([1-9])\\b[\\s\\S]{0,20}?\\b(?:bhk|rk|bedroom|room)\\b", Pattern.CASE_INSENSITIVE);
        Matcher bhkMatcher = bhkPattern.matcher(input);
        String bhk = "2 BHK";
        if (bhkMatcher.find()) {
            String num = bhkMatcher.group(1) != null ? bhkMatcher.group(1) : bhkMatcher.group(2);
            bhk = num + " BHK";
        } else if (cleanLower.contains("studio") || cleanLower.contains("1rk")) {
            bhk = "1 RK Studio";
        } else if (cleanLower.contains("duplex") || cleanLower.contains("villa")) {
            bhk = "Duplex Villa";
        } else if (cleanLower.contains("penthouse")) {
            bhk = "Luxury Penthouse";
        }

        // 2. Extract Property Type
        String type = "Flat";
        if (cleanLower.contains("house") || cleanLower.contains("bungalow") || cleanLower.contains("independent")) {
            type = "House";
        } else if (cleanLower.contains("plot") || cleanLower.contains("land")) {
            type = "Plot";
        } else if (cleanLower.contains("penthouse")) {
            type = "Penthouse";
        }

        // 3. Extract Rent / Price
        double rentAmount = 18000.0;
        Pattern numPattern = Pattern.compile("\\b(\\d{4,6})\\b");
        Matcher numMatcher = numPattern.matcher(input);
        if (numMatcher.find()) {
            rentAmount = Double.parseDouble(numMatcher.group(1));
        } else {
            Pattern kPattern = Pattern.compile("\\b(\\d{1,2})k\\b", Pattern.CASE_INSENSITIVE);
            Matcher kMatcher = kPattern.matcher(input);
            if (kMatcher.find()) {
                rentAmount = Double.parseDouble(kMatcher.group(1)) * 1000;
            }
        }
        String rentVal = String.format("₹%,.0f", rentAmount);

        // 4. Extract Sector & City driven by PostgreSQL Database
        String sector = "";
        String city = "";

        // Query database first for existing localities
        List<Locality> dbLocalities = localityRepository.findAll();
        for (Locality loc : dbLocalities) {
            if (loc.getSectorName() != null && cleanLower.contains(loc.getSectorName().toLowerCase())) {
                sector = loc.getSectorName();
                if (loc.getCity() != null && !loc.getCity().isBlank()) {
                    city = loc.getCity();
                }
                break;
            }
        }

        // Query database for distinct existing cities
        List<String> dbCities = localityRepository.findDistinctCities();
        if (city.isBlank()) {
            for (String c : dbCities) {
                if (cleanLower.contains(c.toLowerCase())) {
                    city = c;
                    break;
                }
            }
        }

        // Dynamic City NER extraction (if city not yet in PostgreSQL DB)
        if (city.isBlank()) {
            Pattern cityPattern = Pattern.compile("\\b(?:in|at|near)\\s+([A-Z][a-z]{2,20})\\b");
            Matcher cityMatcher = cityPattern.matcher(input);
            if (cityMatcher.find()) {
                city = capitalizeWords(cityMatcher.group(1));
            } else {
                city = "Indore"; // Default baseline fallback
            }
        }

        // Dynamic Sector NER extraction (if sector not yet in PostgreSQL DB)
        if (sector.isBlank()) {
            Pattern prepPattern = Pattern.compile("\\b(?:in|at|near|around|sector)\\s+([A-Za-z0-9\\s]{2,30}?)(?=\\s+(?:with|having|facing|for|rent|per|\\d|rs|rupees|\\$|$))", Pattern.CASE_INSENSITIVE);
            Matcher prepMatcher = prepPattern.matcher(input);
            if (prepMatcher.find()) {
                String candidate = prepMatcher.group(1).trim();
                if (!candidate.equalsIgnoreCase(city)) {
                    sector = capitalizeWords(candidate);
                }
            }
        }

        // Suffix Pattern Fallback (Nagar, Colony, Circle, etc.)
        if (sector.isBlank()) {
            Pattern suffixPattern = Pattern.compile("\\b([A-Za-z0-9\\s]{2,20}\\s+(?:nagar|colony|city|township|road|circle|sector|bazar|vihar|enclave|pur|ganj|heights|residency|villa|society|square|chowk|puri|dham|bagh|marg))\\b", Pattern.CASE_INSENSITIVE);
            Matcher suffixMatcher = suffixPattern.matcher(input);
            if (suffixMatcher.find()) {
                sector = capitalizeWords(suffixMatcher.group(1).trim());
            }
        }

        if (sector.isBlank()) {
            sector = "Rau Circle";
        }

        // 6. Colony / Society Detection
        String colony = "";
        if (cleanLower.contains("shiva vatika") || cleanLower.contains("vatika")) {
            colony = "Shiva Vatika";
        } else if (cleanLower.contains("singapore city")) {
            colony = "Singapore City";
        } else if (cleanLower.contains("apollo db city")) {
            colony = "Apollo DB City";
        }

        // 7. Vastu Facing Direction
        String vastuFacing = "East Facing";
        if (cleanLower.contains("north-east") || cleanLower.contains("northeast")) vastuFacing = "North-East Facing";
        else if (cleanLower.contains("north-west") || cleanLower.contains("northwest")) vastuFacing = "North-West Facing";
        else if (cleanLower.contains("south-east") || cleanLower.contains("southeast")) vastuFacing = "South-East Facing";
        else if (cleanLower.contains("south-west") || cleanLower.contains("southwest")) vastuFacing = "South-West Facing";
        else if (cleanLower.contains("west")) vastuFacing = "West Facing";
        else if (cleanLower.contains("north")) vastuFacing = "North Facing";
        else if (cleanLower.contains("south")) vastuFacing = "South Facing";
        else if (cleanLower.contains("east")) vastuFacing = "East Facing";

        // 8. Amenities
        List<String> amenities = new ArrayList<>();
        if (cleanLower.contains("balcony")) amenities.add("Balcony & City View");
        if (cleanLower.contains("garden")) amenities.add("Private Garden");
        if (cleanLower.contains("furnished")) amenities.add("Fully Furnished");
        if (cleanLower.contains("parking")) amenities.add("Covered Parking");
        if (cleanLower.contains("gated")) amenities.add("Gated Security");

        // Save new locality automatically to PostgreSQL database if not present!
        boolean newlySaved = false;
        final String finalCity = city;
        final String finalSector = sector;
        Optional<Locality> existing = localityRepository.findByCityIgnoreCaseAndSectorNameIgnoreCase(finalCity, finalSector);
        if (existing.isEmpty()) {
            Locality newLocality = new Locality(finalCity, finalSector, finalSector.toLowerCase(), 92, rentAmount);
            localityRepository.save(newLocality);
            newlySaved = true;
            log.info("Saved new locality to PostgreSQL database: City={}, Sector={}", finalCity, finalSector);
        }

        String locationPart = city != null ? sector + ", " + city : sector;
        String fullLocation = !colony.isBlank() ? locationPart + " (" + colony + ")" : locationPart;
        String title = bhk + " " + type + " in " + (!colony.isBlank() ? colony + ", " : "") + locationPart + " (" + vastuFacing + ")";
        String label = bhk + " " + type + " (" + fullLocation + ")";

        return new ParsedPropertyDTO(
                bhk,
                type,
                city,
                sector,
                colony,
                rentVal,
                rentAmount,
                vastuFacing,
                amenities,
                title,
                label,
                newlySaved
        );
    }

    private String capitalizeWords(String str) {
        if (str == null || str.isEmpty()) return str;
        String[] words = str.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim();
    }
}

