import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [countyName, setCountyName] = useState('');
  const [isSuperUser, setIsSuperUser] = useState(false);

  const handleLogin = (county, superUser = false) => {
    setCountyName(county);
    setIsSuperUser(superUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCountyName('');
    setIsSuperUser(false);
  };

  return isAuthenticated ? (
    <DashboardPage countyName={countyName} isSuperUser={isSuperUser} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
