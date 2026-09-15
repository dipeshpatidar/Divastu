# Java Backend & Database Engineering Standards

## 1. Core Java Quality Rules
- Methods: Write small, focused methods limited to a single responsibility and short lengths.
- Null Safety: Handle nulls carefully. Check explicitly, use Optional<T> appropriately, and avoid unnecessary null assignments.
- Resource Management: Always close streams, database connections, and file handles using try-with-resources blocks.
- Naming: Adhere to PascalCase for classes/interfaces, camelCase for methods/variables, and ALL_CAPS for constants.
- OOP Design: Encapsulate data properly, favor composition over inheritance, and program to interfaces rather than implementations.

## 2. Custom High-Performance Architecture
- Complexity: O(1) focus. Use ConcurrentHashMap or @Cacheable for local lookups. Never call repository.findAll() in request handlers.
- Database: Ensure all SQL query filters leverage composite B-Tree indexes on PostgreSQL tables.
- Zero-GC Strings: Declare all regexes as 'private static final Pattern' at class-loading time. No inline Pattern.compile() or String.replaceAll() inside loops or request methods.
- Dynamic Persistence: 0 hardcoded domain entities (cities, localities, sectors). Auto-persist parsed/extracted entities to PostgreSQL.
- Testing & Quality: 100% JUnit 5 test coverage for all parsers and services. 'mvn clean compile test' must pass with 0 errors.
- Exceptions: Global intercept via @RestControllerAdvice mapping to structured ErrorResponseDTO JSON payloads.
