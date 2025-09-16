# Integration Tests

This directory contains integration tests for the WhatsApp Professional SaaS application. These tests verify that different parts of the system work together correctly.

## Test Structure

### Setup

- `setup.ts` - Global test setup and cleanup utilities
- Helper functions for creating test data (users, teams, contacts, campaigns)
- Database cleanup between tests

### Test Files

- `campaigns.test.ts` - Tests for campaign API endpoints
- `contacts.test.ts` - Tests for contact management API endpoints
- `teams.test.ts` - Tests for team management API endpoints
- `z-api.test.ts` - Tests for Z-API integration
- `realtime.test.ts` - Tests for realtime functionality

## Running Tests

### All Integration Tests

```bash
npm run test:integration:run
```

### With Coverage

```bash
npm run test:integration:coverage
```

### Watch Mode

```bash
npm run test:integration
```

### All Tests (Unit + Integration)

```bash
npm run test:all
```

## Test Environment

### Prerequisites

- Supabase test database configured
- Z-API test instance (optional, tests will handle missing configuration)
- Environment variables set for test database

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
Z_API_URL=https://api.z-api.io
Z_API_TOKEN=test-token
Z_API_INSTANCE_ID=test-instance
```

## Test Data Management

### Automatic Cleanup

- Test data is automatically cleaned up before and after each test
- Tests use prefixes like "TEST\_" to identify test data
- Cleanup happens in reverse dependency order

### Test Data Creation

- `createTestUser()` - Creates a test user with authentication
- `createTestTeam()` - Creates a test team
- `createTestContact()` - Creates a test contact
- `createTestCampaign()` - Creates a test campaign

## API Testing

### Authentication

- Tests use JWT tokens for authentication
- Test users are created with proper permissions
- Authorization is tested for protected endpoints

### Error Handling

- Tests verify proper error responses (400, 401, 404, 500)
- Validation errors are tested for required fields
- Invalid data formats are tested

### Data Validation

- Request body validation is tested
- Response data structure is verified
- Pagination and filtering are tested

## Z-API Integration

### Mocking Strategy

- Z-API calls are mocked in test environment
- Tests verify proper API request formatting
- Error scenarios are tested (service unavailable, invalid responses)

### Webhook Testing

- Incoming webhooks from Z-API are tested
- Signature validation is tested
- Different event types are tested

## Realtime Testing

### Connection Testing

- Realtime connection establishment is tested
- Connection error handling is tested
- Automatic reconnection is tested

### Data Synchronization

- Real-time data updates are tested
- Cross-client synchronization is tested
- Performance with high-frequency updates is tested

## Best Practices

### Test Isolation

- Each test is independent
- Test data is cleaned up between tests
- No shared state between tests

### Error Scenarios

- Both success and failure cases are tested
- Edge cases and boundary conditions are tested
- Network errors and timeouts are tested

### Performance

- Tests have reasonable timeouts (30 seconds)
- Large data sets are tested
- Concurrent operations are tested

## Debugging

### Test Logs

- Tests include detailed logging for debugging
- Failed tests show request/response data
- Database state is logged for failed tests

### Common Issues

- Database connection issues
- Authentication token expiration
- Z-API service unavailability
- Realtime connection problems

## Future Improvements

### Test Coverage

- Add more edge case tests
- Test concurrent operations
- Add performance benchmarks

### Test Data

- Add more realistic test data
- Test with larger datasets
- Add data migration tests

### Monitoring

- Add test execution metrics
- Monitor test performance
- Track test reliability
