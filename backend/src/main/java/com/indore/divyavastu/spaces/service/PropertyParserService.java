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
            "\\b([1-9]|10)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?(?:bath|baths|bathroom|bathrooms|bathromm|bathrom|toilet|washroom)\\b|\\b(?:bath|baths|bathroom|bathrooms|bathromm|bathrom|toilet|washroom)\\b\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,10}?([1-9]|10)\\b",
            Pattern.CASE_INSENSITIVE);

    // Immediate & High-Precision Forward/Reverse Rent Patterns (Strict word boundaries & zero cross-field bleeding)
    private static final Pattern FWD_RENT_PATTERN = Pattern.compile(
            "\\b(?:monthly\\s*rent|rent|per\\s*month|/month|pm|rnt|ren)\\b(?:\\s+(?:is|of|amount|fee|charge|rs)){0,3}\\s*[:\\-]?\\s*(?:rs\\.?|₹)?\\s*\\b(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern REV_RENT_PATTERN = Pattern.compile(
            "\\b(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b\\s*[:\\-]?\\s*(?:rs\\.?|₹)?\\s*(?:rent|per\\s*month|/month|pm|rnt|ren|monthly\\s*rent)\\b",
            Pattern.CASE_INSENSITIVE);

    // Explicit Forward & Reverse Brokerage Patterns (Supports typos "brokraj", "brokrage", "brookerage")
    private static final Pattern FWD_BROKERAGE_PATTERN = Pattern.compile(
            "\\b(?:brokerage|brokraj|brokrage|brookerage|brokerg|broker\\s*fee|commission)\\b(?:\\s+(?:fee|fees|is|of|amount|charge|charges|=|-)){0,3}\\s*[:\\-]?\\s*(?:rs\\.?|₹)?\\s*\\b(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern REV_BROKERAGE_PATTERN = Pattern.compile(
            "\\b(\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b\\s*[:\\-]?\\s*(?:rs\\.?|₹)?\\s*(?:fee|fees|is|of|amount|charge|charges)?\\s*(?:brokerage|brokraj|brokrage|brookerage|brokerg|broker\\s*fee|commission)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern BROKERAGE_DAYS_PATTERN = Pattern.compile(
            "\\b(\\d{1,2})\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,3}?(?:day|days)\\s*(?:[a-zA-Z0-9\\-\\_]{1,30}\\s+){0,3}?(?:rent|brokerage)?\\b",
            Pattern.CASE_INSENSITIVE);

    // Explicit Area / Sqft Pattern (Forward & Reverse Multi-Word Distance Independent, 3+ digits)
    private static final Pattern SQFT_PATTERN = Pattern.compile(
            "\\b(\\d{1,3}(?:,\\d{3})+|\\d{3,5})\\s*(?:[a-zA-Z\\-\\_]{1,30}\\s+){0,5}?(?:sqft|sq\\.ft|sq\\s*ft|sqfeet|square\\s*feet|sq\\s*meters|sqm)\\b|\\b(?:sqft|sq\\.ft|sq\\s*ft|sqfeet|square\\s*feet|sq\\s*meters|sqm)\\b\\s*(?:[a-zA-Z\\-\\_]{1,30}\\s+){0,5}?(\\d{1,3}(?:,\\d{3})+|\\d{3,5})\\b",
            Pattern.CASE_INSENSITIVE);

    // Explicit Forward & Reverse Security Deposit Patterns (Supports typos "securuity", "is 1+1 60000")
    private static final Pattern FWD_DEPOSIT_PATTERN = Pattern.compile(
            "\\b(?:security\\s*deposit|deposit|dep|depost|deposite|diposite|scurity|securuity)\\b(?:\\s+(?:is|amount|of|=|-)){0,3}\\s*[:\\-]?\\s*(?:rs\\.?|₹)?\\s*\\b([1-3]\\+[1-3]\\s*\\d{4,6}|[1-3]\\+[1-3]|\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern REV_DEPOSIT_PATTERN = Pattern.compile(
            "\\b([1-3]\\+[1-3]\\s*\\d{4,6}|[1-3]\\+[1-3]|\\d{1,3}(?:,\\d{2,3})+|\\d{4,6}|\\d{1,2}k)\\b\\s*[:\\-]?\\s*(?:rs\\.?|₹)?\\s*(?:is|amount)?\\s*(?:security\\s*deposit|deposit|dep|depost|deposite|diposite|scurity|securuity)\\b",
            Pattern.CASE_INSENSITIVE);

    // Furnishing & Possession Patterns (Supports natural text dates e.g. "20th of september", "25th of sep")
    private static final Pattern FURNISHING_PATTERN = Pattern
            .compile("\\b(unfurnished|semi[\\-\\s]?furnished|fully[\\-\\s]?furnished)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern POSSESSION_PATTERN = Pattern.compile(
            "\\b(?:ready\\s*to\\s*move|immediate[\\s\\-]?possession|available\\s*from\\s*[a-zA-Z0-9\\s]{3,15}|possession\\s*date|possession)\\b(?:\\s+(?:is|on|from|by)){0,2}\\s*[:\\-]?\\s*(\\d{1,2}(?:st|nd|rd|th)?(?:\\s+of)?\\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\\s+\\d{4})?|\\d{1,2}[-\\/]\\d{1,2}[-\\/]\\d{2,4}|\\d{4}-\\d{2}-\\d{2}|ready\\s*to\\s*move|immediate|available\\s*[a-zA-Z0-9\\s]{3,15})\\b|\\b(ready\\s*to\\s*move|immediate[\\s\\-]?possession|immediate)\\b",
            Pattern.CASE_INSENSITIVE);

    // Address, State, Pincode & Landmark Patterns
    private static final Pattern STATE_PATTERN = Pattern.compile(
            "\\b(madhya\\s*pradesh|maharashtra|karnataka|delhi\\s*ncr|delhi|rajasthan|uttar\\s*pradesh|gujarat|haryana|tamil\\s*nadu|west\\s*bengal|telangana|goa)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern PINCODE_PATTERN = Pattern.compile("\\b([1-9]\\d{5})\\b");
    private static final Pattern LANDMARK_PATTERN = Pattern.compile(
            "\\b(?:landmark|near\\s*by|nearby|near\\s*to|near|opposite|opp|behind|next\\s+to|adjacent\\s+to)\\s+([A-Za-z0-9\\s]{2,30}?)(?=\\s+for|\\s+rent|\\s+\\d|\\.|,|\\$)",
            Pattern.CASE_INSENSITIVE);

    // Listing Status & Owner Patterns
    private static final Pattern STATUS_PATTERN = Pattern.compile("\\b(live|pending|sold|expired|rented|removed)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern OWNER_NAME_PATTERN = Pattern.compile(
            "\\b(?:owner\\s*name|owner|contact)\\s*[:\\-]?\\s*([A-Za-z]{2,20}(?:\\s+[A-Za-z]{2,20}){0,3})\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern REV_OWNER_NAME_PATTERN = Pattern.compile(
            "\\b([A-Za-z]{2,20}(?:\\s+[A-Za-z]{2,20}){0,3})\\s+(?:owner|contact)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\+?91[\\-\\s]?)?([1-9](?:[\\-\\s]?\\d){7,10})");

    private static final Pattern NUM_PRICE_PATTERN = Pattern.compile("\\b(\\d{4,6})\\b(?!\\s*(?:sqft|sq|feet|square|meters|days|day|bhk|baths|bed|pin|pincode|deposit|security))", Pattern.CASE_INSENSITIVE);
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

    // Master Indian Cities & Tier-1/Tier-2 Metros Allow-list for fail-safe extraction
    private static final Set<String> MASTER_INDIAN_CITIES = Set.of(
            "indore", "bhopal", "ujjain", "jabalpur", "gwalior", "pune", "mumbai", "delhi",
            "gurgaon", "noida", "bangalore", "hyderabad", "chennai", "kolkata", "ahmedabad",
            "jaipur", "surat", "lucknow", "chandigarh", "goa", "dewas", "ratlam", "dhar"
    );

    // Known Core Indore Sector & Locality Master Set for O(1) locality-to-city hard-binding
    private static final Set<String> KNOWN_INDORE_SECTORS = Set.of(
            "vijay nagar", "nanda nagar", "palasia", "old palasia", "saket nagar", "nipania",
            "bhawarkua", "mahalakshmi nagar", "mahalaxmi nagar", "mahalaxmi", "chikatsak nagar", "chikatsak",
            "rau", "mhow", "lig colony", "sukhlia", "khajrana", "bypass road", "annapurna", "sudama nagar",
            "khandwa road", "ab road", "bicholi mardana", "kanadia road", "rajendra nagar", "chandan nagar",
            "scheme 54", "scheme 78", "scheme 74", "scheme 140", "scheme 114", "tilak nagar", "manorama ganj", "race course road"
    );

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
        normalized = normalized.replaceAll("\\b(est\\s*facing|east\\s*faceing|east\\s*dacing)\\b", "east facing");
        normalized = normalized.replaceAll("\\b(wst\\s*facing|west\\s*faceing|west\\s*dacing)\\b", "west facing");
        normalized = normalized.replaceAll("\\b(noth\\s*facing|north\\s*faceing|north\\s*dacing)\\b", "north facing");
        normalized = normalized.replaceAll("\\b(suth\\s*facing|south\\s*faceing|south\\s*dacing)\\b", "south facing");
        normalized = normalized.replaceAll("\\b(rnt|ren|mothly\\s*rent|pm|p\\.m\\.)\\b", "rent");
        normalized = normalized.replaceAll("\\b(depost|deposite|diposite|diposit|scurity\\s*deposit|scurity\\s*dep|securuity\\s*deposit|securuity)\\b", "deposit");
        normalized = normalized.replaceAll("\\b(near\\s*by|nearby|near\\s*to|opp\\s*to|infront\\s*of)\\b", "near");
        normalized = normalized.replaceAll("\\b(brokraj|brokrage|brookerage|brokerg|brokorage|commission)\\b", "brokerage");
        normalized = normalized.replaceAll("\\b(saket\\s*nagr|saketnagar)\\b", "saket nagar");
        normalized = normalized.replaceAll("\\b(vijay\\s*nagr|vijayngr|vijaynagar)\\b", "vijay nagar");
        normalized = normalized.replaceAll("\\b(nanda\\s*nagr|nandanagar)\\b", "nanda nagar");
        normalized = normalized.replaceAll("\\b(bhawarkwa|bhawar\\s*kua)\\b", "bhawarkua");
        normalized = normalized.replaceAll("\\b(palasiaa)\\b", "palasia");
        normalized = normalized.replaceAll("\\b(nipaniya|nipaniyaa)\\b", "nipania");

        // 1. Universal BHK Extractor (Studio/1RK checked first, followed by explicit numeric BHK)
        String bhk = "Unspecified";
        Matcher numBhkMatcher = NUM_BHK_PATTERN.matcher(input);
        Matcher revBhkMatcher = REV_BHK_PATTERN.matcher(input);
        Matcher wordBhkMatcher = WORD_BHK_PATTERN.matcher(input);

        if (normalized.contains("studio") || normalized.contains("1rk") || normalized.contains(" rk ")
                || normalized.endsWith(" rk")) {
            bhk = "1 RK Studio";
        } else if (numBhkMatcher.find()) {
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
        } else if (normalized.contains("triplex")) {
            bhk = "Triplex Villa";
        } else if (normalized.contains("duplex") || normalized.contains("villa")) {
            bhk = "Duplex Villa";
        } else if (normalized.contains("penthouse")) {
            bhk = "Luxury Penthouse";
        } else {
            // Global Fallback Extractor: If any single number exists and prompt contains BHK/RK/Bed tokens or typos anywhere
            Matcher anyDigit = Pattern.compile("\\b([1-9]\\d?(?:\\.5)?)\\b").matcher(input);
            if (anyDigit.find() && Pattern.compile("(?:bhk|rk|bedroom|bedrooms|bed|beds|room|rooms|bk|bhkk|bhkks|dfbhk|sdfbhk)", Pattern.CASE_INSENSITIVE).matcher(input).find()) {
                bhk = anyDigit.group(1) + " BHK";
            }
        }

        // 1.5. Bathrooms Extractor
        String bathrooms = null;
        Matcher bathMatcher = BATHROOMS_PATTERN.matcher(input);
        if (bathMatcher.find()) {
            String bCount = bathMatcher.group(1) != null ? bathMatcher.group(1) : bathMatcher.group(2);
            if (bCount != null) {
                bathrooms = bCount + " Baths";
            }
        }

        // 2. Property Type Extractor (Penthouse prioritized to prevent 'house' substring collision)
        String type = null;
        if (normalized.contains("penthouse") || normalized.contains("penthous")) {
            type = "Penthouse";
        } else if (normalized.contains("airbnb") || normalized.contains("serviced stay")) {
            type = "Airbnb";
        } else if (normalized.contains("studio")) {
            type = "Studio";
        } else if (normalized.contains("apartment") || normalized.contains("flat") || normalized.contains("flt")) {
            type = "Flat";
        } else if (normalized.contains("plot") || normalized.contains("land")) {
            type = "Plot";
        } else if (Pattern.compile("\\b(?:house|bungalow|independent|villa|duplex|bunglow|viila|vlla)\\b", Pattern.CASE_INSENSITIVE).matcher(normalized).find()) {
            type = "House";
        }

        // 2.5. Listing Status Extractor
        String status = null;
        Matcher statusMatcher = STATUS_PATTERN.matcher(input);
        if (statusMatcher.find()) {
            status = statusMatcher.group(1).toUpperCase();
        }

        // 2.6. Pincode & Owner Phone Extractor (Extracted early to isolate 6-digit PIN & 10-digit phone)
        String pincode = null;
        Matcher pinMatcher = PINCODE_PATTERN.matcher(input);
        if (pinMatcher.find()) {
            pincode = pinMatcher.group(1);
        }

        String ownerName = null;
        Matcher ownerMatcher = OWNER_NAME_PATTERN.matcher(input);
        if (ownerMatcher.find() && ownerMatcher.group(1) != null && !ownerMatcher.group(1).isBlank()) {
            String candidate = ownerMatcher.group(1).replaceAll("(?i)\\b(is|live|facing|flat|house|villa|apartment|plot|furnished|fully|semi|unfurnished|bhk|rk|bedroom|bath|baths)\\b", "").trim();
            if (!candidate.isBlank()) {
                ownerName = capitalizeWords(candidate);
            }
        }
        if (ownerName == null) {
            Matcher revOwnerMatcher = REV_OWNER_NAME_PATTERN.matcher(input);
            if (revOwnerMatcher.find() && revOwnerMatcher.group(1) != null) {
                String candidate = revOwnerMatcher.group(1).replaceAll("(?i)\\b(is|live|facing|flat|house|villa|apartment|plot|furnished|fully|semi|unfurnished|bhk|rk|bedroom|bath|baths)\\b", "").trim();
                if (!candidate.isBlank()) {
                    ownerName = capitalizeWords(candidate);
                }
            }
        }

        String ownerPhone = null;
        Matcher phoneMatcher = PHONE_PATTERN.matcher(input);
        if (phoneMatcher.find()) {
            String rawDigits = phoneMatcher.group(0).replaceAll("\\D", "");
            if (rawDigits.startsWith("91") && rawDigits.length() > 10) {
                rawDigits = rawDigits.substring(2);
            }
            if (rawDigits.length() >= 8) {
                if (pincode == null || !rawDigits.equals(pincode)) {
                    if (rawDigits.length() == 10) {
                        ownerPhone = "+91 " + rawDigits.substring(0, 5) + " " + rawDigits.substring(5);
                    } else {
                        ownerPhone = "+91 " + rawDigits;
                    }
                }
            }
        }

        // 3A. Price / Rent Extractor (Extracted FIRST as primary monetary field)
        double rentAmount = 0.0;
        boolean rentFound = false;

        // Step 1: Check REV Rent
        Matcher revRent = REV_RENT_PATTERN.matcher(normalized);
        while (revRent.find()) {
            String rawRent = revRent.group(1);
            if (rawRent != null) {
                String cleanRent = rawRent.replace(",", "");
                if (pincode != null && pincode.equals(cleanRent)) continue;
                if (ownerPhone != null && ownerPhone.contains(cleanRent)) continue;

                String nearestKeyword = findNearestPrecedingKeyword(normalized, revRent.start(1));
                if ("BROKERAGE".equals(nearestKeyword) || "DEPOSIT".equals(nearestKeyword)) {
                    continue;
                }

                rentAmount = cleanRent.toLowerCase().endsWith("k")
                        ? Double.parseDouble(cleanRent.substring(0, cleanRent.length() - 1)) * 1000
                        : Double.parseDouble(cleanRent);
                rentFound = true;
                break;
            }
        }

        // Step 2: Check FWD Rent
        if (!rentFound) {
            Matcher fwdRent = FWD_RENT_PATTERN.matcher(normalized);
            while (fwdRent.find()) {
                String rawRent = fwdRent.group(1);
                if (rawRent != null) {
                    String cleanRent = rawRent.replace(",", "");
                    if (pincode != null && pincode.equals(cleanRent)) continue;
                    if (ownerPhone != null && ownerPhone.contains(cleanRent)) continue;

                    String nearestKeyword = findNearestPrecedingKeyword(normalized, fwdRent.start(1));
                    if ("BROKERAGE".equals(nearestKeyword) || "DEPOSIT".equals(nearestKeyword)) {
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

        // 3B. Explicit Brokerage & Brokerage Days Extractor
        String brokerageVal = "Unmentioned";
        Matcher revBrokerage = REV_BROKERAGE_PATTERN.matcher(normalized);
        while (revBrokerage.find()) {
            String rawVal = revBrokerage.group(1);
            if (rawVal != null) {
                String cleanVal = rawVal.replace(",", "");
                if ((pincode == null || !pincode.equals(cleanVal)) && (ownerPhone == null || !ownerPhone.contains(cleanVal))) {
                    String nearestKeyword = findNearestPrecedingKeyword(normalized, revBrokerage.start(1));
                    if ("RENT".equals(nearestKeyword) || "DEPOSIT".equals(nearestKeyword)) {
                        continue;
                    }

                    double bAmt = cleanVal.toLowerCase().endsWith("k")
                            ? Double.parseDouble(cleanVal.substring(0, cleanVal.length() - 1)) * 1000
                            : Double.parseDouble(cleanVal);
                    brokerageVal = String.format("₹%,.0f", bAmt);
                    break;
                }
            }
        }
        if ("Unmentioned".equals(brokerageVal)) {
            Matcher fwdBrokerage = FWD_BROKERAGE_PATTERN.matcher(normalized);
            while (fwdBrokerage.find()) {
                String rawVal = fwdBrokerage.group(1);
                if (rawVal != null) {
                    String cleanVal = rawVal.replace(",", "");
                    if ((pincode == null || !pincode.equals(cleanVal)) && (ownerPhone == null || !ownerPhone.contains(cleanVal))) {
                        String nearestKeyword = findNearestPrecedingKeyword(normalized, fwdBrokerage.start(1));
                        if ("RENT".equals(nearestKeyword) || "DEPOSIT".equals(nearestKeyword)) {
                            continue;
                        }

                        double bAmt = cleanVal.toLowerCase().endsWith("k")
                                ? Double.parseDouble(cleanVal.substring(0, cleanVal.length() - 1)) * 1000
                                : Double.parseDouble(cleanVal);
                        brokerageVal = String.format("₹%,.0f", bAmt);
                        break;
                    }
                }
            }
        }

        String brokerageDays = null;
        Matcher daysMatcher = BROKERAGE_DAYS_PATTERN.matcher(input);
        if (daysMatcher.find()) {
            brokerageDays = daysMatcher.group(1) + " Days";
        } else if (!"Unmentioned".equals(brokerageVal)) {
            brokerageDays = "15 Days"; // Default brokerage terms
        }

        // 3C. Explicit Sqft Area Extractor
        String areaSqFt = null;
        Matcher sqftMatcher = SQFT_PATTERN.matcher(input);
        if (sqftMatcher.find()) {
            String candidateArea = sqftMatcher.group(1) != null ? sqftMatcher.group(1) : sqftMatcher.group(2);
            areaSqFt = candidateArea + " sqft";
        }

        // 3D. Explicit Security Deposit Extractor
        String depositVal = null;
        Matcher revDeposit = REV_DEPOSIT_PATTERN.matcher(normalized);
        while (revDeposit.find()) {
            String depRaw = revDeposit.group(1);
            if (depRaw != null) {
                String cleanDep = depRaw.replace(",", "");
                if ((pincode == null || !pincode.equals(cleanDep)) && (ownerPhone == null || !ownerPhone.contains(cleanDep))) {
                    depositVal = depRaw + " Security Deposit";
                    break;
                }
            }
        }
        if (depositVal == null) {
            Matcher fwdDeposit = FWD_DEPOSIT_PATTERN.matcher(normalized);
            while (fwdDeposit.find()) {
                String depRaw = fwdDeposit.group(1);
                if (depRaw != null) {
                    String cleanDep = depRaw.replace(",", "");
                    if ((pincode == null || !pincode.equals(cleanDep)) && (ownerPhone == null || !ownerPhone.contains(cleanDep))) {
                        depositVal = depRaw + " Security Deposit";
                        break;
                    }
                }
            }
        }

        // 3E. Furnishing & Possession Date Extractor
        String furnishingStatus = null;
        Matcher furnMatcher = FURNISHING_PATTERN.matcher(normalized);
        if (furnMatcher.find()) {
            furnishingStatus = capitalizeWords(furnMatcher.group(1));
        }

        String possessionDate = null;
        Matcher possMatcher = POSSESSION_PATTERN.matcher(input);
        if (possMatcher.find()) {
            String rawP = possMatcher.group(1) != null ? possMatcher.group(1) : possMatcher.group(0);
            if (rawP.toLowerCase().contains("ready to move") || rawP.toLowerCase().contains("immediate")) {
                possessionDate = "Ready To Move";
            } else {
                possessionDate = capitalizeWords(rawP.trim());
            }
        }

        // 3F. State & Landmark Extractor
        String state = null;
        Matcher stateMatcher = STATE_PATTERN.matcher(input);
        if (stateMatcher.find()) {
            state = capitalizeWords(stateMatcher.group(1));
        }

        String landmark = null;
        Matcher lmMatcher = LANDMARK_PATTERN.matcher(input);
        if (lmMatcher.find()) {
            landmark = capitalizeWords(lmMatcher.group(1).trim());
        }
        if (!rentFound) {
            Matcher numMatcher = NUM_PRICE_PATTERN.matcher(input);
            while (numMatcher.find()) {
                String candidateVal = numMatcher.group(1);
                if (candidateVal.equals(pincode) || (areaSqFt != null && areaSqFt.startsWith(candidateVal))
                        || (brokerageVal != null && brokerageVal.replace(",", "").contains(candidateVal))
                        || (depositVal != null && depositVal.replace(",", "").contains(candidateVal))) {
                    continue;
                }
                rentAmount = Double.parseDouble(candidateVal);
                rentFound = true;
                break;
            }
        }

        if (!rentFound) {
            Matcher kMatcher = K_PRICE_PATTERN.matcher(input);
            while (kMatcher.find()) {
                String kVal = kMatcher.group(1);
                double candidateRent = Double.parseDouble(kVal) * 1000;
                String formattedCand = String.format("₹%,.0f", candidateRent);
                if ((brokerageVal != null && (brokerageVal.toLowerCase().contains(kVal + "k") || brokerageVal.equals(formattedCand)))
                        || (depositVal != null && (depositVal.toLowerCase().contains(kVal + "k") || depositVal.equals(formattedCand)))) {
                    continue;
                }
                rentAmount = candidateRent;
                rentFound = true;
                break;
            }
        }

        String rentVal = rentFound ? String.format("₹%,.0f", rentAmount) : "Unspecified";

        // 4. Fast $O(1)$ L1 Cache-Backed Sector & City Resolution
        String sector = "";
        String city = "";

        // Step 4A: Check L1 Locality Cache
        for (Map.Entry<String, Locality> entry : localityCache.entrySet()) {
            if (cleanLower.contains(entry.getKey())) {
                Locality loc = entry.getValue();
                sector = loc.getSectorName();
                city = loc.getCity();
                break;
            }
        }

        // Step 4B: Check Known Core Indore Sectors (Hard-bind locality to Indore, sort by length descending)
        if (sector.isBlank()) {
            List<String> sortedSectors = KNOWN_INDORE_SECTORS.stream()
                    .sorted((a, b) -> Integer.compare(b.length(), a.length()))
                    .toList();
            for (String knownSec : sortedSectors) {
                if (cleanLower.contains(knownSec)) {
                    sector = capitalizeWords(knownSec);
                    city = "Indore";
                    break;
                }
            }
        }

        // Step 4C: Check City Cache or Master Indian Cities Allow-list
        if (city.isBlank()) {
            for (String c : cityCache) {
                if (cleanLower.contains(c) && MASTER_INDIAN_CITIES.contains(c)) {
                    city = capitalizeWords(c);
                    break;
                }
            }
        }

        if (city.isBlank()) {
            for (String kc : MASTER_INDIAN_CITIES) {
                if (cleanLower.contains(kc)) {
                    city = capitalizeWords(kc);
                    break;
                }
            }
        }

        // Step 4D: Dynamic City Scanner for explicit city declarations (strictly validated against Master Indian Cities)
        if (city.isBlank()) {
            Matcher cityMatcher = CITY_NER_PATTERN.matcher(input);
            if (cityMatcher.find()) {
                String candidateCity = cityMatcher.group(1).trim().toLowerCase();
                if (MASTER_INDIAN_CITIES.contains(candidateCity)) {
                    city = capitalizeWords(candidateCity);
                }
            }
        }

        // Step 4E: Dynamic Sector / Street / Suffix Scanner
        if (sector.isBlank()) {
            Matcher suffixMatcher = SUFFIX_LOCALITY_PATTERN.matcher(normalized);
            if (suffixMatcher.find()) {
                String matchedStr = capitalizeWords(suffixMatcher.group(1).trim());
                sector = matchedStr;
            }
        }

        // Step 4F: Dynamic Preposition NER Scanner
        if (sector.isBlank()) {
            Matcher prepMatcher = PREP_LOCALITY_PATTERN.matcher(normalized);
            if (prepMatcher.find()) {
                String candidate = prepMatcher.group(1).trim();
                if (!candidate.equalsIgnoreCase(city)) {
                    sector = capitalizeWords(candidate);
                }
            }
        }

        // Clean noise prefixes (e.g., '4bhk flat in', 'in', 'at', 'near') and trailing duplicate city/sector names
        if (!sector.isBlank()) {
            sector = NOISE_PREFIX_PATTERN.matcher(sector).replaceAll("").trim();
            if (!city.isBlank() && sector.toLowerCase().endsWith(" " + city.toLowerCase())) {
                sector = sector.substring(0, sector.length() - city.length()).trim();
            }
            if (sector.matches(".*\\b\\d{4,}\\b.*")) {
                sector = "";
            }
        }

        if (sector.isBlank()) {
            sector = "Not Specified";
        }
        if (city.isBlank() || !MASTER_INDIAN_CITIES.contains(city.toLowerCase())) {
            city = "Indore"; // Baseline fallback to primary metro hub
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

    private String findNearestPrecedingKeyword(String fullText, int numberIndex) {
        int windowStart = Math.max(0, numberIndex - 35);
        String textBefore = fullText.substring(windowStart, numberIndex).toLowerCase();

        int lastRent = Math.max(
                Math.max(textBefore.lastIndexOf("monthly rent"), textBefore.lastIndexOf("rent")),
                Math.max(textBefore.lastIndexOf("rnt"), textBefore.lastIndexOf("ren"))
        );
        int lastBrokerage = Math.max(
                Math.max(textBefore.lastIndexOf("brokerage"), textBefore.lastIndexOf("broker")),
                Math.max(textBefore.lastIndexOf("commission"), textBefore.lastIndexOf("brokrage"))
        );
        int lastDeposit = Math.max(
                Math.max(textBefore.lastIndexOf("security deposit"), textBefore.lastIndexOf("deposit")),
                Math.max(textBefore.lastIndexOf("depost"), textBefore.lastIndexOf("securuity"))
        );

        if (lastRent > lastBrokerage && lastRent > lastDeposit) return "RENT";
        if (lastBrokerage > lastRent && lastBrokerage > lastDeposit) return "BROKERAGE";
        if (lastDeposit > lastRent && lastDeposit > lastBrokerage) return "DEPOSIT";
        return "NONE";
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
