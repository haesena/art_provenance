import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ArtworkList from './pages/ArtworkList';
import ArtworkDetail from './pages/ArtworkDetail';
import PersonList from './pages/PersonList';
import PersonDetail from './pages/PersonDetail';
import Login from './pages/Login';
import InstitutionReport from './pages/InstitutionReport';
import AuctionReport from './pages/AuctionReport';
import ExhibitionReport from './pages/ExhibitionReport';
import SourceReport from './pages/SourceReport';
import UnusedSourcesReport from './pages/UnusedSourcesReport';
import EventReport from './pages/EventReport';
import Interactions from './pages/Interactions';
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
          <Route path="analysis" element={<Navigate to="/analysis/institutions" replace />} />
          <Route path="analysis/institutions" element={<InstitutionReport />} />
          <Route path="analysis/auctions" element={<AuctionReport />} />
          <Route path="analysis/exhibitions" element={<ExhibitionReport />} />
          <Route path="analysis/sources" element={<SourceReport />} />
          <Route path="analysis/events" element={<EventReport />} />
          <Route path="analysis/unused-sources" element={<UnusedSourcesReport />} />
          <Route path="analysis/interactions" element={<Interactions />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
