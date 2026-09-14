# High-Performance Backend & Database Architectural Standards

## Core Engineering Principles

### 1. Space & Time Complexity ($O(1)$ Priority)
- **L1 In-Memory Caching**: Never fetch entire table collections (`repository.findAll()`) inside per-request HTTP handlers.
- **Concurrent In-Memory Caching**: Use `ConcurrentHashMap` or `@Cacheable` for hot lookups (localities, sectors, cities, properties).
- **Index-Backed JPA Queries**: Ensure all SQL query filters are backed by composite B-Tree indexes on PostgreSQL tables.

### 2. Zero-GC RegEx & String Allocation
- **Pre-Compiled RegEx Patterns**: Never call `Pattern.compile(...)` or `String.replaceAll("regex", ...)` inside loops or request methods.
- **Static Pattern Constants**: Declare all regexes as `private static final Pattern PATTERN_NAME = Pattern.compile(...);` at class-loading time.

### 3. Dynamic Database Persistence
- **Zero Hardcoding**: Never hardcode arrays or lists of domain entities (cities, localities, sectors, properties) in Java memory.
- **PostgreSQL Auto-Persistence**: Automatically persist newly parsed or extracted entities into the PostgreSQL database.

### 4. Mandatory Automated Unit Testing
- **100% Test Coverage**: Every parser, service, or business logic component must have a corresponding JUnit 5 test suite (`PropertyParserServiceTest.java`, etc.).
- **Build Cleanliness**: Ensure `mvn test`, `mvn clean compile`, and `npm run build` pass with 0 errors before committing or declaring a task complete.
