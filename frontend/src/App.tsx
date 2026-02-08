import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ArtworkList from './pages/ArtworkList';
import ArtworkDetail from './pages/ArtworkDetail';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ArtworkList />} />
        <Route path="artworks/:id" element={<ArtworkDetail />} />
        {/* We will add Analysis route later */}
        <Route path="analysis" element={<div className="p-4">Analysis Dashboard Placeholder</div>} />
      </Route>
    </Routes>
  );
};

export default App;
