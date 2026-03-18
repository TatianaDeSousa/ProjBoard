import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ContactProvider } from './context/ContactContext';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
import Contacts from './pages/Contacts';
import Folders from './pages/Folders'; // OK
import ShareView from './pages/ShareView';
import AuthCallback from './pages/AuthCallback';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-black animate-pulse">
      <div className="w-12 h-12 gradient-primary rounded-2xl shadow-xl rotate-45" />
    </div>
  );
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ContactProvider>
          <Router>
            <div className="min-h-screen bg-[#F8FAFC]">
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/client" element={<ShareView />} />
                <Route path="/client/:shareToken" element={<ShareView />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Dashboard / Protected */}
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/project/new" element={<PrivateRoute><NewProject /></PrivateRoute>} />
                <Route path="/project/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
                <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
                <Route path="/folders" element={<PrivateRoute><Folders /></PrivateRoute>} />

                {/* Redirect */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </ContactProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
