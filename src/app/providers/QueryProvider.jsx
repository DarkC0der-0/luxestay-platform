import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/queryClient';
import PropTypes from 'prop-types';

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

QueryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
