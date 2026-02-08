import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArtworks, Artwork } from '../services/api';
import { Search, Filter } from 'lucide-react';

import { getDeterministicColor } from '../utils/colorUtils';

const ArtworkList: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                const data = await getArtworks();
                setArtworks(data.results || []); // Handle standard generic response wrapper if present, else data
            } catch (error) {
                console.error("Failed to fetch artworks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtworks();
    }, []);

    const filteredArtworks = artworks.filter(art =>
        art.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Collection</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 text-sm w-full sm:w-auto">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

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
                                            alt={art.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full relative">
                                            <div
                                                className="absolute inset-0 z-10 opacity-30 mix-blend-multiply"
                                                style={{ backgroundColor: getDeterministicColor(art.title) }}
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
                                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 truncate">{art.title}</h3>
                                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                                        <span>{art.creation_date || 'Unknown Date'}</span>
                                        <span>{art.medium}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArtworkList;
