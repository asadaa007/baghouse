import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BugProvider } from './context/BugContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BugProvider>
          <AppRouter />
        </BugProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 