import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Layout from './components/Layout';
import ArtworkList from './pages/ArtworkList';
import ArtworkDetail from './pages/ArtworkDetail';
import PersonList from './pages/PersonList';
import PersonDetail from './pages/PersonDetail';
import Login from './pages/Login';
import InstitutionReport from './pages/InstitutionReport';
import AuctionReport from './pages/AuctionReport';
import ExhibitionReport from './pages/ExhibitionReport';
import EventReport from './pages/EventReport';
import { Landmark, Gavel, BookOpen as BookIcon, Table } from 'lucide-react';
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
          <Route path="analysis" element={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/analysis/institutions" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Institutions</h3>
                    <p className="text-sm text-gray-500">Artworks grouped by institution.</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/analysis/auctions" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Gavel className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Auctions</h3>
                    <p className="text-sm text-gray-500">Artworks grouped by auction.</p>
                  </div>
                </div>
              </Link>

              <Link to="/analysis/exhibitions" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <BookIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Exhibitions</h3>
                    <p className="text-sm text-gray-500">Artworks grouped by exhibition.</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/analysis/events" className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Table className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">All Events</h3>
                    <p className="text-sm text-gray-500">Flat tabular report of all events.</p>
                  </div>
                </div>
              </Link>
            </div>
          } />
          <Route path="analysis/institutions" element={<InstitutionReport />} />
          <Route path="analysis/auctions" element={<AuctionReport />} />
          <Route path="analysis/exhibitions" element={<ExhibitionReport />} />
          <Route path="analysis/events" element={<EventReport />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
