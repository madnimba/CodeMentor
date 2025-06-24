import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
}

const AllTheProviders = ({ children, withRouter = true }: { children: React.ReactNode; withRouter?: boolean }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  // Always wrap with router since AuthProvider needs it
  return <BrowserRouter>{content}</BrowserRouter>;
};

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => {
  const { withRouter = true, ...rest } = options || {};
  return render(ui, {
    wrapper: (props) => <AllTheProviders withRouter={withRouter} {...props} />,
    ...rest,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render }; 