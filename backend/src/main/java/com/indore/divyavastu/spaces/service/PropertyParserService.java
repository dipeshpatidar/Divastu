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

        // 1. Universal BHK / Layout Extractor (Supports '1.5bhk', '2.5 bhk', '4bhk', '10bhk', 'three bhk', 'studio', 'duplex', etc.)
        String bhk = "2 BHK";

        // Regex for Numeric & Fractional BHKs (e.g. 1.5 bhk, 2.5bhk, 3bhk, 4 bedroom, 5 beds)
        Pattern numBhkPattern = Pattern.compile("\\b(\\d+(?:\\.\\d+)?)\\s*(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms)\\b", Pattern.CASE_INSENSITIVE);
        Matcher numBhkMatcher = numBhkPattern.matcher(input);

        // Word to number mapping (e.g. "three bhk" -> 3 BHK)
        Pattern wordBhkPattern = Pattern.compile("\\b(one|two|three|four|five|six|seven|eight|nine|ten)\\s*(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms)\\b", Pattern.CASE_INSENSITIVE);
        Matcher wordBhkMatcher = wordBhkPattern.matcher(input);

        if (numBhkMatcher.find()) {
            String val = numBhkMatcher.group(1);
            bhk = val.endsWith(".0") ? val.substring(0, val.length() - 2) + " BHK" : val + " BHK";
        } else if (wordBhkMatcher.find()) {
            String w = wordBhkMatcher.group(1).toLowerCase();
            String num = switch (w) {
                case "one" -> "1";
                case "two" -> "2";
                case "three" -> "3";
                case "four" -> "4";
                case "five" -> "5";
                case "six" -> "6";
                case "seven" -> "7";
                case "eight" -> "8";
                case "nine" -> "9";
                case "ten" -> "10";
                default -> "2";
            };
            bhk = num + " BHK";
        } else if (cleanLower.contains("studio") || cleanLower.contains("1rk") || cleanLower.contains("rk")) {
            bhk = "1 RK Studio";
        } else if (cleanLower.contains("triplex")) {
            bhk = "Triplex Villa";
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

        // 4. Sector & City driven by PostgreSQL Database & Dynamic Address NER Scanner
        String sector = "";
        String city = "";

        // Phase A: Query PostgreSQL database for existing localities & sectors
        List<Locality> dbLocalities = localityRepository.findAll();
        for (Locality loc : dbLocalities) {
            if (loc.getSectorName() != null && !loc.getSectorName().isBlank() && cleanLower.contains(loc.getSectorName().toLowerCase())) {
                sector = loc.getSectorName();
                if (loc.getCity() != null && !loc.getCity().isBlank()) {
                    city = loc.getCity();
                }
                break;
            }
        }

        // Phase B: Query PostgreSQL database for distinct registered cities
        List<String> dbCities = localityRepository.findDistinctCities();
        if (city.isBlank()) {
            for (String c : dbCities) {
                if (cleanLower.contains(c.toLowerCase())) {
                    city = c;
                    break;
                }
            }
        }

        // Phase C: Dynamic City NER Scanner (for un-fed cities in text e.g., 'in Bhopal', 'at Pune', 'in Jaipur')
        if (city.isBlank()) {
            Pattern cityPattern = Pattern.compile("\\b(?:in|at|near|around)\\s+([a-zA-Z]{3,20})(?:\\s+city)?\\b", Pattern.CASE_INSENSITIVE);
            Matcher cityMatcher = cityPattern.matcher(input);
            if (cityMatcher.find()) {
                String candidateCity = cityMatcher.group(1).trim();
                // Filter out non-city common prepositions or property words
                if (!candidateCity.equalsIgnoreCase("the") && !candidateCity.equalsIgnoreCase("flat") && !candidateCity.equalsIgnoreCase("house")) {
                    city = capitalizeWords(candidateCity);
                }
            }
        }

        if (city.isBlank()) {
            city = "Indore"; // Baseline fallback
        }

        // Phase D: Dynamic Locality / Sector / Street / Road / Block Scanner
        if (sector.isBlank()) {
            // Suffix Pattern matching all standard Indian & International locality suffixes
            Pattern suffixPattern = Pattern.compile("\\b([A-Za-z0-9\\s]{2,25}\\s+(?:nagar|colony|city|township|road|street|lane|circle|sector|bazar|vihar|enclave|pur|ganj|heights|residency|villa|society|square|chowk|puri|dham|bagh|marg|block|phase|layout|extension|ext|estate|avenue|gali|path|bypass|highway|scheme|drive|park|hills|hill|valley|green|greens|campus))\\b", Pattern.CASE_INSENSITIVE);
            Matcher suffixMatcher = suffixPattern.matcher(input);
            if (suffixMatcher.find()) {
                sector = capitalizeWords(suffixMatcher.group(1).trim());
            }
        }

        // Phase E: Preposition-based Locality NER Extraction (e.g. 'in Nanda Nagar', 'near Rau Circle')
        if (sector.isBlank()) {
            Pattern prepPattern = Pattern.compile("\\b(?:in|at|near|around|sector|road|street|block|phase)\\s+([A-Za-z0-9\\s]{2,30}?)(?=\\s+(?:with|having|facing|for|rent|per|month|\\d|rs|rupees|\\$|$))", Pattern.CASE_INSENSITIVE);
            Matcher prepMatcher = prepPattern.matcher(input);
            if (prepMatcher.find()) {
                String candidate = prepMatcher.group(1).trim();
                if (!candidate.equalsIgnoreCase(city)) {
                    sector = capitalizeWords(candidate);
                }
            }
        }

        if (sector.isBlank()) {
            sector = "Central Locality";
        }

        // 5. Dynamic Colony / Society / Project Name Detection
        String colony = "";
        Pattern colonyPattern = Pattern.compile("\\b([A-Za-z0-9\\s]{2,25}\\s+(?:vatika|apartment|apartments|society|township|gardens|towers|residency|heights|retreat|villas|complex|enclave|palms|greens|vista|view|court|cliffs|paradise|homes|floors|nest|spire))\\b", Pattern.CASE_INSENSITIVE);
        Matcher colonyMatcher = colonyPattern.matcher(input);
        if (colonyMatcher.find()) {
            colony = capitalizeWords(colonyMatcher.group(1).trim());
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

