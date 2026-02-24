import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getArtworks, getArtTypes, getMediums, Artwork, ArtType, Medium } from '../services/api';
import { Search, Filter, X } from 'lucide-react';

import { getDeterministicColor } from '../utils/colorUtils';

const ArtworkList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [artworks, setArtworks] = useState<Artwork[]>([]);

    // Initialize state from search parameters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedArtType, setSelectedArtType] = useState<number | ''>(
        searchParams.get('art_type') ? Number(searchParams.get('art_type')) : ''
    );
    const [selectedMedium, setSelectedMedium] = useState<number | ''>(
        searchParams.get('medium') ? Number(searchParams.get('medium')) : ''
    );

    const [loading, setLoading] = useState(true);
    const [artTypes, setArtTypes] = useState<ArtType[]>([]);
    const [mediums, setMediums] = useState<Medium[]>([]);
    const [showFilters, setShowFilters] = useState(selectedArtType !== '' || selectedMedium !== '');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const [typesData, mediumsData] = await Promise.all([getArtTypes(), getMediums()]);
                setArtTypes(typesData.results || []);
                setMediums(mediumsData.results || []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchArtworks = async () => {
            setLoading(true);
            try {
                const params: any = {};
                if (selectedArtType) params.art_type = selectedArtType;
                if (selectedMedium) params.medium = selectedMedium;
                // Note: The backend artwork_list currently doesn't handle 'q' for searching, 
                // but it's good practice to pass it if we want server-side search later.
                // For now, we still do local search on the results.

                const data = await getArtworks(params);
                setArtworks(data.results || []);
            } catch (error) {
                console.error("Failed to fetch artworks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtworks();

        // Update URL params
        const newParams: any = {};
        if (searchTerm) newParams.q = searchTerm;
        if (selectedArtType) newParams.art_type = selectedArtType.toString();
        if (selectedMedium) newParams.medium = selectedMedium.toString();
        setSearchParams(newParams, { replace: true });
    }, [selectedArtType, selectedMedium, searchTerm, setSearchParams]);

    const filteredArtworks = artworks.filter(art =>
        art.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetFilters = () => {
        setSelectedArtType('');
        setSelectedMedium('');
        setSearchTerm('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Collection</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                        {(selectedArtType || selectedMedium) && (
                            <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                                {(selectedArtType ? 1 : 0) + (selectedMedium ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-wrap gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Art Type</label>
                        <select
                            value={selectedArtType}
                            onChange={(e) => {
                                setSelectedArtType(e.target.value ? Number(e.target.value) : '');
                                setSelectedMedium(''); // Reset medium when art type changes to avoid invalid combinations
                            }}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Art Types</option>
                            {artTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Medium</label>
                        <select
                            value={selectedMedium}
                            onChange={(e) => setSelectedMedium(e.target.value ? Number(e.target.value) : '')}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Mediums</option>
                            {mediums
                                .filter(m => !selectedArtType || m.art_type_id === selectedArtType)
                                .map(medium => (
                                    <option key={medium.id} value={medium.id}>{medium.name}</option>
                                ))
                            }
                        </select>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" /> Clear All
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArtworks.map((art) => (
                        <Link key={art.id} to={`/artworks/${art.id}`} className="group">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                    {art.image ? (
                                        <img
                                            src={art.image}
                                            alt={art.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full relative">
                                            <div
                                                className="absolute inset-0 z-10 opacity-30 mix-blend-multiply"
                                                style={{ backgroundColor: getDeterministicColor(art.name) }}
                                            />
                                            <img
                                                src="/assets/placeholder-artwork.png"
                                                alt="No image available"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 truncate">{art.name}</h3>
                                    <div className="mt-1 flex items-center justify-between text-[10px] font-medium">
                                        <span className="text-gray-500">{art.creation_date || 'Unknown Date'}</span>
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                                            {art.event_count || 0} Events
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )
            }
        </div>
    );
};

export default ArtworkList;
