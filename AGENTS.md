# AGENTS Guidelines for Divyavastu Spaces

## High-Performance & Database Guidelines

When developing features for Divyavastu Spaces (Backend Spring Boot & Frontend Web/Mobile):

1. **$O(1)$ Space and Time Complexity**:
   - Always prioritize sub-millisecond execution times.
   - Use `ConcurrentHashMap` for L1 in-memory caches to prevent repetitive DB reads in HTTP handlers.
   - Never call `findAll()` in request handlers.

2. **Pre-Compiled RegEx Patterns**:
   - All regular expressions must be declared as `private static final Pattern` constants.
   - Avoid creating `Pattern` instances inside methods or loops.

3. **Database-Driven Entities**:
   - Cities, localities, sectors, properties, and fees must be stored and managed in the PostgreSQL database.
   - Newly extracted entities must auto-persist to PostgreSQL with proper composite database indexes (`@Index`).

4. **Mandatory JUnit 5 Testing**:
   - All parser logic and services must be covered by JUnit 5 tests.
   - Verify changes with `mvn test`, `mvn clean compile`, and `npm run build`.
