# Frontend Testing Guide

This document outlines the testing setup and guidelines for the CodeMentor frontend application.

## Testing Stack

- **Vitest**: Fast unit test runner
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM environment for testing
- **@testing-library/jest-dom**: Custom matchers for DOM testing

## Test Structure

```
src/
├── test/
│   ├── setup.ts          # Global test setup and mocks
│   └── utils.tsx         # Custom render function with providers
├── __tests__/            # Test files (co-located with source)
├── components/
├── pages/
├── services/
└── lib/
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Files Created

### 1. **App.test.tsx**
- Tests the main App component
- Mocks AuthProvider to avoid nested router issues
- Verifies the app renders without crashing

### 2. **NotFound.test.tsx**
- Tests the 404 page component
- Verifies correct content rendering
- Tests navigation link functionality
- Mocks console.error to avoid test noise

### 3. **auth.test.ts**
- Tests the authentication service
- Mocks axios for HTTP requests
- Tests signUp and signIn functionality
- Verifies correct API endpoints are called

### 4. **utils.test.ts**
- Tests the utility functions
- Tests the `cn` function for class name merging
- Verifies conditional class handling
- Tests edge cases with null/undefined values

## Test Utilities

### Custom Render Function
Located in `src/test/utils.tsx`, this provides:
- QueryClient with disabled retries
- BrowserRouter for routing context
- AuthProvider for authentication context
- All necessary providers for component testing

### Global Mocks
Located in `src/test/setup.ts`, includes:
- IntersectionObserver mock
- ResizeObserver mock
- window.matchMedia mock
- Jest DOM matchers

## Testing Guidelines

### Component Testing
- Use the custom `render` function from `@/test/utils`
- Test user interactions, not implementation details
- Focus on accessibility and user behavior
- Use semantic queries (getByRole, getByLabelText, etc.)

### Service Testing
- Mock external dependencies (axios, localStorage, etc.)
- Test both success and error scenarios
- Verify correct API calls and data handling

### Utility Testing
- Test pure functions thoroughly
- Include edge cases and error conditions
- Test with various input types

## Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(<Component />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

## Common Patterns

### Mocking Dependencies
```typescript
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
```

### Testing Async Operations
```typescript
it('handles async operations', async () => {
  const mockResponse = { data: { result: 'success' } };
  mockedAxios.get.mockResolvedValue(mockResponse);
  
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('success')).toBeInTheDocument();
  });
});
```

### Testing Router-Dependent Components
```typescript
// For components that use useNavigate, useLocation, etc.
render(<Component />); // Uses custom render with router context
```

## Coverage Goals

- **Components**: 80%+ coverage
- **Services**: 90%+ coverage  
- **Utilities**: 95%+ coverage
- **Overall**: 85%+ coverage

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what users see and do
2. **Use Semantic Queries**: Prefer `getByRole` over `getByTestId`
3. **Test Accessibility**: Ensure components are accessible
4. **Mock External Dependencies**: Don't test third-party libraries
5. **Keep Tests Simple**: One assertion per test when possible
6. **Use Descriptive Names**: Test names should describe the scenario

## Troubleshooting

### Common Issues

1. **Router Context Errors**: Use the custom render function
2. **Async Operation Errors**: Use `waitFor` for async operations
3. **Mock Not Working**: Ensure mocks are defined before imports
4. **Provider Errors**: Check that all required providers are included

### Debugging Tests

```bash
# Run specific test file
npm test ComponentName.test.tsx

# Run tests with verbose output
npm test -- --verbose

# Run tests with UI for debugging
npm run test:ui
```

## Future Improvements

1. **Integration Tests**: Add tests for complete user workflows
2. **E2E Tests**: Add Playwright or Cypress for end-to-end testing
3. **Visual Regression Tests**: Add visual testing for UI components
4. **Performance Tests**: Add tests for component performance
5. **Accessibility Tests**: Add automated accessibility testing 