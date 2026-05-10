import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock users: 4 roles
const MOCK_USERS = [
  {
    id: 'admin001',

    username: 'admin',

    password: 'Admin@2026Secure',

    role: 'admin',

    name: 'System Administrator',

    accessLevel: 4,
  },

  {
    id: 'owner001',

    username: 'owner',

    password: 'Owner@2026Secure',

    role: 'data_owner',

    name: 'Healthcare Data Owner',

    accessLevel: 3,
  },

  {
    id: 'analyst001',

    username: 'analyst',

    password: 'Analyst@2026Secure',

    role: 'research_analyst',

    name: 'Research Analyst',

    accessLevel: 2,
  },

  {
    id: 'officer001',

    username: 'privacy',

    password: 'Privacy@2026Secure',

    role: 'privacy_officer',

    name: 'Privacy Officer',

    accessLevel: 1,
  },
];
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');

  const login = (username, password) => {
    const found = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setUser(found);
      setLoginError('');
      return true;
    }
    setLoginError('Invalid credentials. Access denied.');
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, loginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
