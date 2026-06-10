import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppRouter } from './app/router';
import { QueryProvider } from './app/providers/QueryProvider';
import ScrollToTop from './shared/components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <QueryProvider>
      <Toaster position="top-right" />
      <Router>
        <ScrollToTop />
        <AppRouter />
      </Router>
    </QueryProvider>
  );
};

export default App;
