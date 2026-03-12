import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstitutions, Institution } from '../services/api';
import { Home, Landmark, ChevronRight, ChevronDown, ImageIcon, Search } from 'lucide-react';
import { getDeterministicColor } from '../utils/colorUtils';

const InstitutionReport: React.FC = () => {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const data = await getInstitutions();
                setInstitutions(data.results || []);
            } catch (error) {
                console.error("Failed to fetch institutions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstitutions();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredInstitutions = institutions.filter(inst => 
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.place.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <Landmark className="w-7 h-7 text-indigo-600" />
                    Institutions Report
                </h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search institutions..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredInstitutions.map((inst) => (
                    <div key={inst.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <button 
                            onClick={() => toggleExpand(inst.id)}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Landmark className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{inst.name}</h3>
                                    <p className="text-sm text-gray-500">{inst.place || 'Location unknown'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                    {inst.artwork_count} Artworks
                                </span>
                                {expandedIds.includes(inst.id) ? 
                                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                }
                            </div>
                        </button>

                        {expandedIds.includes(inst.id) && (
                            <div className="border-t border-gray-100 bg-gray-50/30 p-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {inst.artworks.map(art => (
                                        <Link key={art.id} to={`/artworks/${art.id}`} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group">
                                            <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                {art.image ? (
                                                    <img src={art.image} alt={art.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full relative">
                                                        <div
                                                            className="absolute inset-0 z-10 opacity-20 mix-blend-multiply"
                                                            style={{ backgroundColor: getDeterministicColor(art.name) }}
                                                        />
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-gray-300" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-gray-700 truncate group-hover:text-indigo-600 block">{art.name}</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {art.event_types.map((type, idx) => (
                                                        <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded border border-indigo-100 uppercase tracking-tighter font-semibold">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredInstitutions.length === 0 && (
                <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-2xl text-gray-500 italic">
                    No institutions found with the given search criteria.
                </div>
            )}
        </div>
    );
};

export default InstitutionReport;
