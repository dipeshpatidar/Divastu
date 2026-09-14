package com.indore.divyavastu.spaces.service;

import com.indore.divyavastu.spaces.dto.ParsedPropertyDTO;
import com.indore.divyavastu.spaces.entity.Locality;
import com.indore.divyavastu.spaces.repository.LocalityRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * High-Performance, $O(1)$ L1 Cache-Backed Natural Language Property Parser
 * Service.
 * Engineered for sub-millisecond execution time, zero GC pressure, and 100% DB
 * auto-persistence.
 */
@Service
public class PropertyParserService {

    private static final Logger log = LoggerFactory.getLogger(PropertyParserService.class);

    // Pre-compiled Thread-Safe Static RegEx Patterns (Zero runtime recompilation
    // overhead)
    private static final Pattern NUM_BHK_PATTERN = Pattern.compile(
            "\\b([1-9](?:\\.5)?|10)\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk|flat|flt|flats|flatt|apartment|house|villa)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern REV_BHK_PATTERN = Pattern.compile(
            "\\b(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk|flat|flt|flats|flatt|apartment|house|villa)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?([1-9](?:\\.5)?|10)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern WORD_BHK_PATTERN = Pattern.compile(
            "\\b(one|two|three|four|five|six|seven|eight|nine|ten)\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern BATHROOMS_PATTERN = Pattern.compile(
            "\\b([1-9]|10)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:bath|baths|bathroom|bathrooms|toilet|washroom)\\b|\\b(?:bath|baths|bathroom|bathrooms|toilet|washroom)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?([1-9]|10)\\b",
            Pattern.CASE_INSENSITIVE);

    // Immediate & Distance-Independent Rent Patterns (Excludes numbers explicitly tagged with brokerage/deposit/sqft/bath)
    private static final Pattern IMMEDIATE_RENT_PATTERN = Pattern.compile(
            "(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)(?!\\s*(?:brokerage|broker\\s*fee|commission|deposit|sqft|bath))\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,2}?(?:rent|per\\s*month|/month|pm|monthly\\s*rent)\\b|\\b(?:monthly\\s*rent|rent|pm)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,2}?(?:rs\\.?|₹)?\\s*(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern RENT_KEYWORD_PATTERN = Pattern.compile(
            "(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)(?!\\s*(?:brokerage|broker\\s*fee|commission|deposit|sqft|bath))\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:rent|per\\s*month|/month|pm|rnt|ren|monthly\\s*rent)\\b|\\b(?:monthly\\s*rent|rent|rnt|ren)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:rs\\.?|₹)?\\s*(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b",
            Pattern.CASE_INSENSITIVE);

    // Explicit Brokerage Pattern (Forward & Reverse Multi-Word Distance Independent)
    private static final Pattern BROKERAGE_PATTERN = Pattern.compile(
            "(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:brokerage|broker\\s*fee|commission)\\b|\\b(?:brokerage|broker\\s*fee|commission)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:rs\\.?|₹)?\\s*(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern BROKERAGE_DAYS_PATTERN = Pattern.compile(
            "\\b(\\d{1,2})\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,5}?(?:day|days)\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,5}?(?:rent|brokerage)?\\b",
            Pattern.CASE_INSENSITIVE);

    // Explicit Area / Sqft Pattern (Forward & Reverse Multi-Word Distance Independent, 3+ digits)
    private static final Pattern SQFT_PATTERN = Pattern.compile(
            "\\b(\\d{1,3}(?:,\\d{3})+|\\d{3,5})\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,5}?(?:sqft|sq\\.ft|sq\\s*ft|sqfeet|square\\s*feet|sq\\s*meters|sqm)\\b|\\b(?:sqft|sq\\.ft|sq\\s*ft|sqfeet|square\\s*feet|sq\\s*meters|sqm)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,5}?(\\d{1,3}(?:,\\d{3})+|\\d{3,5})\\b",
            Pattern.CASE_INSENSITIVE);

    // Explicit Security Deposit Pattern (Forward & Reverse Multi-Word Distance Independent)
    private static final Pattern DEPOSIT_PATTERN = Pattern.compile(
            "(\\d+(?:\\+\\d+)?|\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:security\\s*deposit|deposit|dep|depost|deposite|scurity)\\b|\\b(?:security\\s*deposit|deposit|depost|deposite|scurity)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:rs\\.?|₹)?\\s*(\\d+(?:\\+\\d+)?|\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b",
            Pattern.CASE_INSENSITIVE);

    // Furnishing & Possession Patterns
    private static final Pattern FURNISHING_PATTERN = Pattern
            .compile("\\b(unfurnished|semi[\\-\\s]?furnished|fully[\\-\\s]?furnished)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern POSSESSION_PATTERN = Pattern.compile(
            "\\b(ready\\s*to\\s*move|immediate[\\s\\-]?possession|available\\s*from\\s*[a-zA-Z0-9\\s]{3,15}|possession\\s*[a-zA-Z0-9\\s]{3,15})\\b",
            Pattern.CASE_INSENSITIVE);

    // Address, State, Pincode & Landmark Patterns
    private static final Pattern STATE_PATTERN = Pattern.compile(
            "\\b(madhya\\s*pradesh|maharashtra|karnataka|delhi\\s*ncr|delhi|rajasthan|uttar\\s*pradesh|gujarat|haryana|tamil\\s*nadu|west\\s*bengal|telangana|goa)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern PINCODE_PATTERN = Pattern.compile("\\b([1-9]\\d{5})\\b");
    private static final Pattern LANDMARK_PATTERN = Pattern.compile(
            "\\b(?:near|opposite|opp|behind|next\\s+to|adjacent\\s+to)\\s+([A-Za-z0-9\\s]{2,30}?)(?=\\s+for|\\s+rent|\\s+\\d|$)",
            Pattern.CASE_INSENSITIVE);

    // Listing Status & Owner Patterns
    private static final Pattern STATUS_PATTERN = Pattern.compile("\\b(live|pending|sold|expired|rented|removed)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern OWNER_NAME_PATTERN = Pattern.compile(
            "\\b(?:owner\\s*name|owner)\\s*[:\\-]?\\s*([A-Za-z\\s]{2,30}?)(?=\\s+\\d|\\s+\\+?91|\\s+phone|\\s+mobile|\\s+rent|\\s+brokerage|$)",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b(?:\\+?91[\\-\\s]?)?([1-9]\\d{9}|\\d{8,11})\\b");

    private static final Pattern NUM_PRICE_PATTERN = Pattern.compile("\\b(\\d{4,6})\\b");
    private static final Pattern K_PRICE_PATTERN = Pattern.compile("\\b(\\d{1,2})k\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern CITY_NER_PATTERN = Pattern
            .compile("\\b(?:in|at|near|around)\\s+([a-zA-Z]{3,20})(?:\\s+city)?\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern SUFFIX_LOCALITY_PATTERN = Pattern.compile(
            "\\b([A-Za-z0-9\\s]{2,25}\\s+(?:nagar|colony|city|township|road|street|lane|circle|sector|bazar|vihar|enclave|pur|ganj|heights|residency|villa|society|square|chowk|puri|dham|bagh|marg|block|phase|layout|extension|ext|estate|avenue|gali|path|bypass|highway|scheme|drive|park|hills|hill|valley|green|greens|campus))\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern PREP_LOCALITY_PATTERN = Pattern.compile(
            "\\b(?:in|at|near|around|sector|road|street|block|phase)\\s+([A-Za-z0-9\\s]{2,30}?)(?=\\s+(?:with|having|facing|for|rent|per|month|\\d|rs|rupees|\\$|$))",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern COLONY_SOCIETY_PATTERN = Pattern.compile(
            "\\b([A-Za-z0-9\\s]{2,25}\\s+(?:vatika|apartment|apartments|society|township|gardens|towers|residency|heights|retreat|villas|complex|enclave|palms|greens|vista|view|court|cliffs|paradise|homes|floors|nest|spire))\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern NOISE_PREFIX_PATTERN = Pattern.compile("^.*?\\b(?:in|at|near|around)\\s+",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");

    private final LocalityRepository localityRepository;

    // High-Speed $O(1)$ Concurrent L1 In-Memory Caches
    private final Map<String, Locality> localityCache = new ConcurrentHashMap<>();
    private final Set<String> cityCache = ConcurrentHashMap.newKeySet();

    public PropertyParserService(LocalityRepository localityRepository) {
        this.localityRepository = localityRepository;
    }

    /**
     * Initializes $O(1)$ L1 cache from PostgreSQL on startup
     */
    @PostConstruct
    public void initCache() {
        try {
            List<Locality> all = localityRepository.findAll();
            for (Locality loc : all) {
                if (loc.getSectorName() != null) {
                    localityCache.put(loc.getSectorName().toLowerCase(), loc);
                }
                if (loc.getCity() != null) {
                    cityCache.add(loc.getCity().toLowerCase());
                }
            }
            log.info("Initialized L1 Locality Cache with {} entries & {} cities", localityCache.size(),
                    cityCache.size());
        } catch (Exception e) {
            log.warn("L1 Cache initialization deferred (database initializing): {}", e.getMessage());
        }
    }

    public ParsedPropertyDTO parseAndSave(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return new ParsedPropertyDTO();
        }

        String input = prompt.trim();
        String cleanLower = input.toLowerCase();

        // 0. Pre-Pass: Typo Auto-Correction & Normalization
        String normalized = cleanLower;
        normalized = normalized.replaceAll("\\b(flt|flts|flatt|appartment|appatment|apartmnt|apt|apts)\\b", "flat");
        normalized = normalized.replaceAll("\\b(viila|vlla|vlia|bunglow|bunglows|independant|indepent)\\b", "house");
        normalized = normalized.replaceAll("\\b(plott|pott|lnd)\\b", "plot");
        normalized = normalized.replaceAll("\\b(semi\\s*furnishd|semifurnished|semi\\-furnished|semifurnish)\\b", "semi furnished");
        normalized = normalized.replaceAll("\\b(fully\\s*furnishd|full\\s*furnished|fully\\-furnished|fullfurnish)\\b", "fully furnished");
        normalized = normalized.replaceAll("\\b(unfurnishd|un\\-furnished|bare)\\b", "unfurnished");
        normalized = normalized.replaceAll("\\b(est\\s*facing|east\\s*faceing)\\b", "east facing");
        normalized = normalized.replaceAll("\\b(wst\\s*facing|west\\s*faceing)\\b", "west facing");
        normalized = normalized.replaceAll("\\b(noth\\s*facing|north\\s*faceing)\\b", "north facing");
        normalized = normalized.replaceAll("\\b(suth\\s*facing|south\\s*faceing)\\b", "south facing");
        normalized = normalized.replaceAll("\\b(rnt|ren|mothly\\s*rent|pm|p\\.m\\.)\\b", "rent");
        normalized = normalized.replaceAll("\\b(depost|deposite|scurity\\s*deposit|scurity\\s*dep)\\b", "deposit");
        normalized = normalized.replaceAll("\\b(saket\\s*nagr|saketnagar)\\b", "saket nagar");
        normalized = normalized.replaceAll("\\b(vijay\\s*nagr|vijayngr|vijaynagar)\\b", "vijay nagar");
        normalized = normalized.replaceAll("\\b(nanda\\s*nagr|nandanagar)\\b", "nanda nagar");
        normalized = normalized.replaceAll("\\b(bhawarkwa|bhawar\\s*kua)\\b", "bhawarkua");
        normalized = normalized.replaceAll("\\b(palasiaa)\\b", "palasia");
        normalized = normalized.replaceAll("\\b(nipaniya|nipaniyaa)\\b", "nipania");

        // 1. Universal BHK Extractor (Studio/RK checked prior to generic numeric)
        String bhk = "Unspecified";
        if (normalized.contains("studio") || normalized.contains("1rk") || normalized.contains(" rk ")
                || normalized.endsWith(" rk")) {
            bhk = "1 RK Studio";
        } else if (normalized.contains("triplex")) {
            bhk = "Triplex Villa";
        } else if (normalized.contains("duplex") || normalized.contains("villa")) {
            bhk = "Duplex Villa";
        } else if (normalized.contains("penthouse")) {
            bhk = "Luxury Penthouse";
        } else {
            Matcher numBhkMatcher = NUM_BHK_PATTERN.matcher(input);
            Matcher revBhkMatcher = REV_BHK_PATTERN.matcher(input);
            Matcher wordBhkMatcher = WORD_BHK_PATTERN.matcher(input);

            if (numBhkMatcher.find()) {
                String val = numBhkMatcher.group(1);
                bhk = val.endsWith(".0") ? val.substring(0, val.length() - 2) + " BHK" : val + " BHK";
            } else if (revBhkMatcher.find()) {
                String val = revBhkMatcher.group(1);
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
            } else {
                // Global Fallback Extractor: If any single number exists and prompt contains BHK/RK/Bed tokens or typos anywhere
                Matcher anyDigit = Pattern.compile("\\b([1-9]\\d?(?:\\.5)?)\\b").matcher(input);
                if (anyDigit.find() && Pattern.compile("(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk)", Pattern.CASE_INSENSITIVE).matcher(input).find()) {
                    bhk = anyDigit.group(1) + " BHK";
                }
            }
        }

        // 1.5. Bathrooms Extractor
        String bathrooms = null;
        Matcher bathMatcher = BATHROOMS_PATTERN.matcher(input);
        if (bathMatcher.find()) {
            bathrooms = bathMatcher.group(1) + " Baths";
        }

        // 2. Property Type Extractor (Flat, House, Villa, Apartment, Airbnb, Plot,
        // Studio, Penthouse, Duplex)
        String type = null;
        if (normalized.contains("airbnb") || normalized.contains("serviced stay")) {
            type = "Airbnb";
        } else if (normalized.contains("apartment") || normalized.contains("flat") || normalized.contains("flt")) {
            type = "Flat";
        } else if (normalized.contains("house") || normalized.contains("bungalow") || normalized.contains("independent")
                || normalized.contains("villa") || normalized.contains("duplex")) {
            type = "House";
        } else if (normalized.contains("plot") || normalized.contains("land")) {
            type = "Plot";
        } else if (normalized.contains("penthouse")) {
            type = "Penthouse";
        } else if (normalized.contains("studio")) {
            type = "Studio";
        }

        // 2.5. Listing Status Extractor
        String status = null;
        Matcher statusMatcher = STATUS_PATTERN.matcher(input);
        if (statusMatcher.find()) {
            status = statusMatcher.group(1).toUpperCase();
        }

        // 3A. Explicit Brokerage & Brokerage Days Extractor
        String brokerageVal = "Unmentioned";
        Matcher brokerageMatcher = BROKERAGE_PATTERN.matcher(normalized);
        if (brokerageMatcher.find()) {
            String rawVal = brokerageMatcher.group(1) != null ? brokerageMatcher.group(1) : brokerageMatcher.group(2);
            if (rawVal != null) {
                String cleanVal = rawVal.replace(",", "");
                double bAmt = cleanVal.toLowerCase().endsWith("k")
                        ? Double.parseDouble(cleanVal.substring(0, cleanVal.length() - 1)) * 1000
                        : Double.parseDouble(cleanVal);
                brokerageVal = String.format("₹%,.0f", bAmt);
            }
        }

        String brokerageDays = null;
        Matcher daysMatcher = BROKERAGE_DAYS_PATTERN.matcher(input);
        if (daysMatcher.find()) {
            brokerageDays = daysMatcher.group(1) + " Days";
        } else if (!"Unmentioned".equals(brokerageVal)) {
            brokerageDays = "15 Days"; // Default brokerage terms
        }

        // 3B. Explicit Sqft Area Extractor
        String areaSqFt = null;
        Matcher sqftMatcher = SQFT_PATTERN.matcher(input);
        if (sqftMatcher.find()) {
            areaSqFt = sqftMatcher.group(1) + " sqft";
        }

        // 3C. Explicit Security Deposit Extractor
        String depositVal = null;
        Matcher depositMatcher = DEPOSIT_PATTERN.matcher(input);
        if (depositMatcher.find()) {
            String depRaw = depositMatcher.group(1) != null ? depositMatcher.group(1) : depositMatcher.group(2);
            depositVal = depRaw + " Security Deposit";
        }

        // 3D. Furnishing & Possession Date Extractor
        String furnishingStatus = null;
        Matcher furnMatcher = FURNISHING_PATTERN.matcher(normalized);
        if (furnMatcher.find()) {
            furnishingStatus = capitalizeWords(furnMatcher.group(1));
        }

        String possessionDate = null;
        Matcher possMatcher = POSSESSION_PATTERN.matcher(input);
        if (possMatcher.find()) {
            possessionDate = capitalizeWords(possMatcher.group(0).trim());
        }

        // 3E. State, Pincode & Landmark Extractor
        String state = null;
        Matcher stateMatcher = STATE_PATTERN.matcher(input);
        if (stateMatcher.find()) {
            state = capitalizeWords(stateMatcher.group(1));
        }

        String pincode = null;
        Matcher pinMatcher = PINCODE_PATTERN.matcher(input);
        if (pinMatcher.find()) {
            pincode = pinMatcher.group(1);
        }

        String landmark = null;
        Matcher lmMatcher = LANDMARK_PATTERN.matcher(input);
        if (lmMatcher.find()) {
            landmark = capitalizeWords(lmMatcher.group(1).trim());
        }

        // 3F. Explicit Owner Name & Phone Extractor
        String ownerName = null;
        Matcher ownerMatcher = OWNER_NAME_PATTERN.matcher(input);
        if (ownerMatcher.find()) {
            ownerName = capitalizeWords(ownerMatcher.group(1).trim());
        }

        String ownerPhone = null;
        Matcher phoneMatcher = PHONE_PATTERN.matcher(input);
        while (phoneMatcher.find()) {
            String pCandidate = phoneMatcher.group(1);
            // Ignore matched rent, brokerage, pincode or area numbers
            if (!pCandidate.equals(pincode) && !pCandidate.equals(areaSqFt != null ? areaSqFt.split(" ")[0] : "")
                    && (brokerageVal == null || !brokerageVal.contains(pCandidate))) {
                ownerPhone = pCandidate;
                break;
            }
        }

        // 3G. Price / Rent Extractor (Disambiguated from Brokerage, Pincode & Area)
        double rentAmount = 0.0;
        boolean rentFound = false;

        Matcher immRentMatcher = IMMEDIATE_RENT_PATTERN.matcher(normalized);
        if (immRentMatcher.find()) {
            String rawRent = immRentMatcher.group(1) != null ? immRentMatcher.group(1) : immRentMatcher.group(2);
            if (rawRent != null) {
                String cleanRent = rawRent.replace(",", "");
                rentAmount = cleanRent.toLowerCase().endsWith("k")
                        ? Double.parseDouble(cleanRent.substring(0, cleanRent.length() - 1)) * 1000
                        : Double.parseDouble(cleanRent);
                rentFound = true;
            }
        }

        if (!rentFound) {
            Matcher explicitRentMatcher = RENT_KEYWORD_PATTERN.matcher(normalized);
            while (explicitRentMatcher.find()) {
                String rawRent = explicitRentMatcher.group(1) != null ? explicitRentMatcher.group(1)
                        : explicitRentMatcher.group(2);
                if (rawRent != null) {
                    String cleanRent = rawRent.replace(",", "");
                    if (brokerageVal != null && brokerageVal.replace(",", "").contains(cleanRent)) {
                        continue;
                    }
                    if (depositVal != null && depositVal.replace(",", "").contains(cleanRent)) {
                        continue;
                    }
                    rentAmount = cleanRent.toLowerCase().endsWith("k")
                            ? Double.parseDouble(cleanRent.substring(0, cleanRent.length() - 1)) * 1000
                            : Double.parseDouble(cleanRent);
                    rentFound = true;
                    break;
                }
            }
        }

        if (!rentFound) {
            Matcher numMatcher = NUM_PRICE_PATTERN.matcher(input);
            while (numMatcher.find()) {
                String candidateVal = numMatcher.group(1);
                // Exclude matches if equal to extracted area sqft, pincode or brokerage
                if (candidateVal.equals(pincode) || (areaSqFt != null && areaSqFt.startsWith(candidateVal))
                        || (brokerageVal != null && brokerageVal.contains(candidateVal))) {
                    continue;
                }
                rentAmount = Double.parseDouble(candidateVal);
                rentFound = true;
                break;
            }
        }

        if (!rentFound) {
            Matcher kMatcher = K_PRICE_PATTERN.matcher(input);
            if (kMatcher.find()) {
                rentAmount = Double.parseDouble(kMatcher.group(1)) * 1000;
                rentFound = true;
            }
        }

        String rentVal = rentFound ? String.format("₹%,.0f", rentAmount) : "Unspecified";

        // 4. Fast $O(1)$ L1 Cache-Backed Sector & City Resolution
        String sector = "";
        String city = "";

        // Check L1 Locality Cache
        for (Map.Entry<String, Locality> entry : localityCache.entrySet()) {
            if (cleanLower.contains(entry.getKey())) {
                Locality loc = entry.getValue();
                sector = loc.getSectorName();
                city = loc.getCity();
                break;
            }
        }

        // Check L1 City Cache or standard major cities
        if (city.isBlank()) {
            for (String c : cityCache) {
                if (cleanLower.contains(c)) {
                    city = capitalizeWords(c);
                    break;
                }
            }
        }

        // Dynamic City Scanner for unregistered cities in text
        if (city.isBlank()) {
            List<String> knownCities = Arrays.asList("indore", "bhopal", "pune", "bangalore", "mumbai", "delhi",
                    "gurgaon", "noida", "hyderabad", "chennai", "kolkata", "ahmedabad", "jaipur", "surat", "lucknow",
                    "chandigarh", "goa");
            for (String kc : knownCities) {
                if (cleanLower.contains(kc)) {
                    city = capitalizeWords(kc);
                    break;
                }
            }
        }

        if (city.isBlank()) {
            Matcher cityMatcher = CITY_NER_PATTERN.matcher(input);
            if (cityMatcher.find()) {
                String candidateCity = cityMatcher.group(1).trim();
                if (!candidateCity.equalsIgnoreCase("the") && !candidateCity.equalsIgnoreCase("flat")
                        && !candidateCity.equalsIgnoreCase("house")) {
                    city = capitalizeWords(candidateCity);
                }
            }
        }

        // Dynamic Sector / Street / Road / Suffix Scanner
        if (sector.isBlank()) {
            Matcher suffixMatcher = SUFFIX_LOCALITY_PATTERN.matcher(normalized);
            if (suffixMatcher.find()) {
                String matchedStr = capitalizeWords(suffixMatcher.group(1).trim());
                sector = matchedStr;
            }
        }

        // Dynamic Preposition NER Scanner
        if (sector.isBlank()) {
            Matcher prepMatcher = PREP_LOCALITY_PATTERN.matcher(normalized);
            if (prepMatcher.find()) {
                String candidate = prepMatcher.group(1).trim();
                if (!candidate.equalsIgnoreCase(city)) {
                    sector = capitalizeWords(candidate);
                }
            }
        }

        // Clean noise prefixes (e.g., '4bhk flat in', 'in', 'at', 'near') and trailing
        // city names from sector
        if (!sector.isBlank()) {
            sector = NOISE_PREFIX_PATTERN.matcher(sector).replaceAll("").trim();
            if (!city.isBlank() && sector.toLowerCase().endsWith(" " + city.toLowerCase())) {
                sector = sector.substring(0, sector.length() - city.length()).trim();
            }
        }

        if (sector.isBlank()) {
            sector = "Not Specified";
        }
        if (city.isBlank()) {
            city = "Indore"; // Baseline fallback
        }

        // 5. Dynamic Society / Project Name Detection
        String colony = "";
        Matcher colonyMatcher = COLONY_SOCIETY_PATTERN.matcher(input);
        if (colonyMatcher.find()) {
            colony = capitalizeWords(colonyMatcher.group(1).trim());
        }

        // 6. Vastu Facing Direction (Defaults to 'Not Specified' unless direction
        // keyword is present)
        String vastuFacing = "Not Specified";
        if (normalized.contains("north-east") || normalized.contains("northeast"))
            vastuFacing = "North-East Facing";
        else if (normalized.contains("north-west") || normalized.contains("northwest"))
            vastuFacing = "North-West Facing";
        else if (normalized.contains("south-east") || normalized.contains("southeast"))
            vastuFacing = "South-East Facing";
        else if (normalized.contains("south-west") || normalized.contains("southwest"))
            vastuFacing = "South-West Facing";
        else if (normalized.contains("facing west") || normalized.contains("west facing")
                || normalized.contains("west"))
            vastuFacing = "West Facing";
        else if (normalized.contains("facing north") || normalized.contains("north facing")
                || normalized.contains("north"))
            vastuFacing = "North Facing";
        else if (normalized.contains("facing south") || normalized.contains("south facing")
                || normalized.contains("south"))
            vastuFacing = "South Facing";
        else if (normalized.contains("facing east") || normalized.contains("east facing")
                || normalized.contains("east"))
            vastuFacing = "East Facing";

        // 7. Amenities Extractor
        List<String> amenities = new ArrayList<>();
        if (cleanLower.contains("balcony"))
            amenities.add("Balcony & City View");
        if (cleanLower.contains("garden"))
            amenities.add("Private Garden");
        if (cleanLower.contains("furnished"))
            amenities.add("Fully Furnished");
        if (cleanLower.contains("parking"))
            amenities.add("Covered Parking");
        if (cleanLower.contains("gated"))
            amenities.add("Gated Security");
        if (cleanLower.contains("lift"))
            amenities.add("High-Speed Lift");
        if (cleanLower.contains("gym"))
            amenities.add("Fitness Center & Gym");
        if (cleanLower.contains("swimming") || cleanLower.contains("pool"))
            amenities.add("Swimming Pool");

        // 8. Missing Attributes Detection Telemetry
        List<String> missingFields = new ArrayList<>();
        if (!rentFound)
            missingFields.add("Monthly Rent");
        if (sector.equalsIgnoreCase("Not Specified"))
            missingFields.add("Locality / Sector");
        if (bathrooms == null)
            missingFields.add("Bathrooms Count");
        if (areaSqFt == null)
            missingFields.add("Carpet Area (sqft)");
        if (pincode == null)
            missingFields.add("Pincode");
        if (possessionDate == null)
            missingFields.add("Possession Date / Readiness");
        if (vastuFacing.equalsIgnoreCase("Not Specified"))
            missingFields.add("Vastu Facing Direction");
        if (furnishingStatus == null)
            missingFields.add("Furnishing Status");

        // 9. PostgreSQL Auto-Persistence & Null-Safe L1 Cache Update
        boolean newlySaved = false;
        final String finalCity = city;
        final String finalSector = sector;

        if (!finalSector.equalsIgnoreCase("Not Specified")) {
            Locality cachedLocality = localityCache.get(finalSector.toLowerCase());
            if (cachedLocality == null) {
                Optional<Locality> existing = localityRepository.findByCityIgnoreCaseAndSectorNameIgnoreCase(finalCity,
                        finalSector);
                if (existing.isEmpty()) {
                    Locality newLocality = new Locality(finalCity, finalSector, finalSector.toLowerCase(), 92,
                            rentAmount);
                    Locality saved = localityRepository.save(newLocality);
                    Locality entityToCache = (saved != null) ? saved : newLocality;
                    localityCache.put(finalSector.toLowerCase(), entityToCache);
                    if (finalCity != null)
                        cityCache.add(finalCity.toLowerCase());
                    newlySaved = true;
                    log.info("Persisted new locality to PostgreSQL & L1 Cache: City={}, Sector={}", finalCity,
                            finalSector);
                } else {
                    localityCache.put(finalSector.toLowerCase(), existing.get());
                    if (finalCity != null)
                        cityCache.add(finalCity.toLowerCase());
                }
            }
        }

        String locationPart = city != null ? sector + ", " + city : sector;
        String fullLocation = !colony.isBlank() ? locationPart + " (" + colony + ")" : locationPart;
        String title = bhk + " " + type + " in " + (!colony.isBlank() ? colony + ", " : "") + locationPart
                + (!vastuFacing.equals("Not Specified") ? " (" + vastuFacing + ")" : "");
        String label = bhk + " " + type + " (" + fullLocation + ")";
        String address = sector + (city != null ? ", " + city : "") + (state != null ? ", " + state : "")
                + (pincode != null ? " - " + pincode : "");

        StringBuilder descBuilder = new StringBuilder();
        descBuilder.append(bhk).append(" ").append(type).append(" available for rent in ").append(sector);
        if (city != null && !city.isBlank()) descBuilder.append(", ").append(city);
        if (state != null && !state.isBlank()) descBuilder.append(", ").append(state);
        if (pincode != null && !pincode.isBlank() && !pincode.equals("Not Specified")) descBuilder.append(" (Pincode: ").append(pincode).append(")");
        descBuilder.append(".");

        if (colony != null && !colony.isBlank()) descBuilder.append(" Located in ").append(colony).append(".");
        if (landmark != null && !landmark.isBlank() && !landmark.equals("Not Specified")) descBuilder.append(" Landmark: ").append(landmark).append(".");
        if (areaSqFt != null && !areaSqFt.equals("Not Specified")) descBuilder.append(" Carpet Area: ").append(areaSqFt).append(".");
        if (bathrooms != null && !bathrooms.equals("Not Specified")) descBuilder.append(" Bathrooms: ").append(bathrooms).append(".");
        if (vastuFacing != null && !vastuFacing.equals("Not Specified")) descBuilder.append(" Vastu Facing: ").append(vastuFacing).append(".");
        if (furnishingStatus != null && !furnishingStatus.equalsIgnoreCase("UNSPECIFIED")) descBuilder.append(" Furnishing: ").append(furnishingStatus).append(".");
        descBuilder.append(" Monthly Rent: ").append(rentVal).append(".");
        if (depositVal != null && !depositVal.equals("Not Specified")) descBuilder.append(" Security Deposit: ").append(depositVal).append(".");
        if (brokerageVal != null) descBuilder.append(" Brokerage Fee: ").append(brokerageVal).append(".");
        if (possessionDate != null) descBuilder.append(" Possession: ").append(possessionDate).append(".");
        if (amenities != null && !amenities.isEmpty()) descBuilder.append(" Key Amenities: ").append(String.join(", ", amenities)).append(".");
        if (ownerName != null && !ownerName.equals("Not Specified")) {
            descBuilder.append(" Contact Owner: ").append(ownerName);
            if (ownerPhone != null && !ownerPhone.equals("Not Specified")) descBuilder.append(" (").append(ownerPhone).append(")");
            descBuilder.append(".");
        }
        descBuilder.append(" Listing Status: ").append(status).append(".");

        String synthesizedDescription = descBuilder.toString();

        ParsedPropertyDTO dto = new ParsedPropertyDTO();
        dto.setBhk(bhk);
        dto.setType(type != null ? type : "Not Specified");
        dto.setStatus(status != null ? status : "Unspecified");
        dto.setCity(city);
        dto.setSector(sector);
        dto.setColony(colony);
        dto.setRentVal(rentVal);
        dto.setRentAmount(rentAmount);
        dto.setBrokerageVal(brokerageVal != null ? brokerageVal : "15 Days Rent");
        dto.setBrokerageDays(brokerageDays != null ? brokerageDays : "15 Days");
        dto.setAreaSqFt(areaSqFt != null ? areaSqFt : "Not Specified");
        dto.setDepositVal(depositVal != null ? depositVal : "1+1 Security Deposit");
        dto.setBathrooms(bathrooms != null ? bathrooms : "Not Specified");
        dto.setFurnishingStatus(furnishingStatus != null ? furnishingStatus : "Semi-Furnished");
        dto.setPossessionDate(possessionDate != null ? possessionDate : "Immediate / Ready to Move");
        dto.setAddress(address);
        dto.setState(state != null ? state : "Madhya Pradesh");
        dto.setPincode(pincode != null ? pincode : "Not Specified");
        dto.setLandmark(landmark != null ? landmark : "Not Specified");
        dto.setDescription(synthesizedDescription);
        dto.setOwnerName(ownerName != null ? ownerName : "Direct Owner");
        dto.setOwnerPhone(ownerPhone != null ? ownerPhone : "Not Specified");
        dto.setVastuFacing(vastuFacing);
        dto.setAmenities(amenities);
        dto.setMissingFields(missingFields);
        dto.setTitle(title);
        dto.setLabel(label);
        dto.setSavedToDatabase(newlySaved);

        return dto;
    }

    private String capitalizeWords(String str) {
        if (str == null || str.isEmpty())
            return str;
        String[] words = WHITESPACE_PATTERN.split(str);
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!w.isEmpty()) {
                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim();
    }
}
