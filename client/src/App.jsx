import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.jsx';
import LandingPage from './pages/LandingPage';
import MyCapsulesPage from './pages/MyCapsulesPage';
import CreateCapsule from './pages/CreateCapsuleSimple';
import CapsuleDetail from './pages/CapsuleDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
// import Explore from './pages/Explore';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <div className="app-container">
              <main className="content">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <MyCapsulesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/create-capsule" 
                    element={
                      <ProtectedRoute>
                        <CreateCapsule />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/capsules/:id" 
                    element={
                      <ProtectedRoute>
                        <CapsuleDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  {/* <Route 
                    path="/explore" 
                    element={
                      <ProtectedRoute>
                        <Explore />
                      </ProtectedRoute>
                    } 
                  /> */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App
