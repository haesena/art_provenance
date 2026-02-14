import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ArtworkList from './pages/ArtworkList';
import ArtworkDetail from './pages/ArtworkDetail';
import PersonList from './pages/PersonList';
import PersonDetail from './pages/PersonDetail';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ArtworkList />} />
          <Route path="artworks/:id" element={<ArtworkDetail />} />
          <Route path="persons" element={<PersonList />} />
          <Route path="persons/:id" element={<PersonDetail />} />
          <Route path="analysis" element={<div className="p-4 text-slate-600 italic">Analysis Dashboard coming soon...</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
