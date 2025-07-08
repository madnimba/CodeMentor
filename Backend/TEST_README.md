# CodeMentor Backend Tests

This directory contains comprehensive unit tests for the CodeMentor backend application. The tests are written using JUnit 5 and Mockito for mocking dependencies.

## Test Structure

### Test Files Created

1. **Service Layer Tests**
   - `AuthServiceTest.java` - Tests for authentication service (signup, signin, signout)
   - `UserServiceTest.java` - Tests for user CRUD operations
   - `ArticleServiceTest.java` - Tests for article management (create, read, update, delete)
   - `CompanyServiceTest.java` - Tests for company data retrieval

2. **Controller Layer Tests**
   - `AuthControllerTest.java` - Tests for authentication endpoints using MockMvc

3. **Security Tests**
   - `JwtTokenProviderTest.java` - Tests for JWT token generation, validation, and parsing

4. **Exception Handler Tests**
   - `GlobalExceptionHandlerTest.java` - Tests for global exception handling

5. **Integration Tests**
   - `CodeMentorApplicationTests.java` - Basic application context loading test

### Test Configuration

- `application-test.properties` - Test-specific configuration using H2 in-memory database
- Added H2 database dependency to `pom.xml` for testing

## Running Tests

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=AuthServiceTest
```

### Run Tests with Coverage
```bash
mvn test jacoco:report
```

### Run Tests in IDE
- Right-click on test file and select "Run Test"
- Or use the test runner in your IDE

## Test Coverage

### AuthService Tests
- ✅ User registration (signup) with valid data
- ✅ User registration with duplicate email
- ✅ User registration with duplicate username
- ✅ User login (signin) with valid credentials
- ✅ User logout (signout) with valid token
- ✅ Token validation with Bearer prefix handling

### UserService Tests
- ✅ Create new user
- ✅ Get user by ID (exists and not exists)
- ✅ Get user by email (exists and not exists)
- ✅ Get all users
- ✅ Update existing user
- ✅ Update non-existent user (throws exception)
- ✅ Delete user
- ✅ Check if email exists

### ArticleService Tests
- ✅ Create article with all required data
- ✅ Create article with missing track (throws exception)
- ✅ Get article by ID (exists and not exists)
- ✅ Get articles by filters (topic, subtopic, job role)
- ✅ Get all approved articles
- ✅ Update article by authorized user
- ✅ Update article by unauthorized user (throws exception)
- ✅ Delete article by authorized user
- ✅ Delete article by unauthorized user (throws exception)

### CompanyService Tests
- ✅ Get all companies with question counts
- ✅ Get company by ID (exists and not exists)
- ✅ Handle companies with and without questions

### AuthController Tests
- ✅ Test endpoint returns success
- ✅ Signup endpoint with valid request
- ✅ Signup endpoint with invalid request
- ✅ Signin endpoint with valid request
- ✅ Signin endpoint with invalid request
- ✅ Signout endpoint with valid token
- ✅ Signout endpoint without Bearer prefix
- ✅ Signout endpoint without authorization header

### JwtTokenProvider Tests
- ✅ Generate valid JWT token
- ✅ Extract username from valid token
- ✅ Extract username from invalid token (throws exception)
- ✅ Validate valid token
- ✅ Validate invalid token
- ✅ Validate empty token
- ✅ Validate null token
- ✅ Validate expired token

### GlobalExceptionHandler Tests
- ✅ Handle ResourceNotFoundException
- ✅ Handle UnauthorizedException
- ✅ Handle AuthenticationException
- ✅ Handle BadCredentialsException
- ✅ Handle AccessDeniedException
- ✅ Handle validation exceptions
- ✅ Handle constraint violation exceptions
- ✅ Handle generic exceptions
- ✅ Handle NullPointerException

## Test Best Practices

### Naming Convention
- Test methods follow the pattern: `methodName_scenario_expectedResult`
- Example: `signUp_EmailAlreadyExists_ThrowsException`

### Test Structure (AAA Pattern)
- **Arrange**: Set up test data and mock behavior
- **Act**: Execute the method being tested
- **Assert**: Verify the expected results

### Mocking Strategy
- Use `@Mock` for dependencies
- Use `@InjectMocks` for the class under test
- Mock only external dependencies, not the class being tested
- Use `when().thenReturn()` for stubbing
- Use `verify()` to ensure methods are called as expected

### Test Data
- Use constants for test data to avoid magic numbers
- Create test data in `@BeforeEach` setup methods
- Use meaningful test data that represents real scenarios

## Configuration

### Test Database
- Uses H2 in-memory database for fast test execution
- Database is created and destroyed for each test run
- No external database dependencies required

### JWT Configuration
- Uses test-specific JWT secret and expiration
- Separate from production configuration

### Security
- Some tests disable security auto-configuration for easier testing
- Security context is mocked where needed

## Adding New Tests

### For New Services
1. Create test class in `src/test/java/com/codementor/service/`
2. Follow the existing naming convention
3. Mock all dependencies using `@Mock`
4. Use `@InjectMocks` for the service under test
5. Write tests for all public methods
6. Include both success and failure scenarios

### For New Controllers
1. Create test class in `src/test/java/com/codementor/controller/`
2. Use MockMvc for testing HTTP endpoints
3. Test all HTTP methods (GET, POST, PUT, DELETE)
4. Test both valid and invalid requests
5. Verify response status codes and content

### For New Security Components
1. Create test class in `src/test/java/com/codementor/security/`
2. Test token generation, validation, and parsing
3. Test edge cases (null, empty, invalid tokens)
4. Use `ReflectionTestUtils` for setting private fields if needed

## Troubleshooting

### Common Issues
1. **Test fails with database connection error**: Ensure H2 dependency is added to pom.xml
2. **Security context issues**: Mock SecurityContextHolder in tests
3. **JWT token issues**: Use test-specific JWT configuration
4. **Mock verification failures**: Check that mocks are set up correctly

### Debugging Tests
- Use `@Test` annotation with descriptive names
- Add logging to understand test flow
- Use debugger to step through test execution
- Check mock interactions with `verify()` calls

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (under 30 seconds for all tests)
- No external dependencies
- Deterministic results
- Clear failure messages

## Future Improvements

1. **Integration Tests**: Add tests that use real database connections
2. **Performance Tests**: Add tests for performance-critical operations
3. **Security Tests**: Add more comprehensive security testing
4. **API Tests**: Add end-to-end API testing
5. **Coverage Reports**: Integrate with coverage reporting tools 