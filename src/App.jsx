import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import { ContactProvider } from './context/ContactContext';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ShareView from './pages/ShareView';
import NewProject from './pages/NewProject';
import Login from './pages/Login';
import Signup from './pages/Signup';
import JoinTeam from './pages/JoinTeam';
import Teams from './pages/Teams';
import Contacts from './pages/Contacts';
import TeamWorkload from './pages/TeamWorkload';
import Notifications from './pages/Notifications';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ContactProvider>
        <ProjectProvider>
          <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/join/:token" element={<JoinTeam />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/project/new" element={<NewProject />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/share/:shareToken" element={<ShareView />} />
              <Route path="/client" element={<ShareView />} />
              <Route path="/team-workload" element={<TeamWorkload />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
        </Router>
      </ProjectProvider>
      </ContactProvider>
    </AuthProvider>
  );
}

export default App;
