import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BugProvider } from './context/BugContext';
import { ProjectProvider } from './context/ProjectContext';
import { TeamProvider } from './context/TeamContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BugProvider>
          <ProjectProvider>
            <TeamProvider>
              <AppRouter />
            </TeamProvider>
          </ProjectProvider>
        </BugProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 