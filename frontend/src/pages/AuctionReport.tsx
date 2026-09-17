import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuctionsReport, AuctionReport } from '../services/api';
import { Gavel, ChevronRight, ChevronDown, ImageIcon, Search, Calendar, User } from 'lucide-react';
import { getDeterministicColor } from '../utils/colorUtils';

const AuctionReportPage: React.FC = () => {
    const [auctions, setAuctions] = useState<AuctionReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'artworks' | 'persons'>('all');
    const [activeTabs, setActiveTabs] = useState<{ [key: number]: 'artworks' | 'persons' }>({});

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const data = await getAuctionsReport();
                setAuctions(data.results || []);
            } catch (error) {
                console.error("Failed to fetch auctions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const setTabForAuction = (auctionId: number, tab: 'artworks' | 'persons') => {
        setActiveTabs(prev => ({ ...prev, [auctionId]: tab }));
    };

    const getActiveTab = (auctionId: number, auction: AuctionReport): 'artworks' | 'persons' => {
        if (activeTabs[auctionId]) return activeTabs[auctionId];
        return auction.artwork_count > 0 ? 'artworks' : 'persons';
    };

    const filteredAuctions = auctions.filter(auc => {
        const matchesSearch = auc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            auc.institution.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        if (categoryFilter === 'artworks') return (auc.artwork_count || 0) > 0;
        if (categoryFilter === 'persons') return (auc.person_count || 0) > 0;

        return true;
    });

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
                    <Gavel className="w-7 h-7 text-indigo-600" />
                    Auctions Report
                </h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search auctions..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter bar for category selection */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-xl shadow-sm">
                <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        categoryFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    All ({auctions.length})
                </button>
                <button
                    onClick={() => setCategoryFilter('artworks')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        categoryFilter === 'artworks'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <ImageIcon className="w-3.5 h-3.5" />
                    With Artworks ({auctions.filter(a => (a.artwork_count || 0) > 0).length})
                </button>
                <button
                    onClick={() => setCategoryFilter('persons')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        categoryFilter === 'persons'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <User className="w-3.5 h-3.5" />
                    With Persons ({auctions.filter(a => (a.person_count || 0) > 0).length})
                </button>
            </div>

            <div className="grid gap-4">
                {filteredAuctions.map((auc) => (
                    <div key={auc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <button 
                            onClick={() => toggleExpand(auc.id)}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Gavel className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{auc.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{auc.date || 'Date unknown'}</span>
                                        </div>
                                        {auc.institution && <span>•</span>}
                                        {auc.institution && <span>{auc.institution}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {auc.artwork_count} Artworks
                                </span>
                                <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {auc.person_count || 0} Persons
                                </span>
                                {expandedIds.includes(auc.id) ? 
                                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                }
                            </div>
                        </button>

                        {expandedIds.includes(auc.id) && (
                            <div className="border-t border-gray-100 bg-gray-50/30 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {/* Tab selector */}
                                <div className="flex gap-4 border-b border-gray-200 pb-2">
                                    <button
                                        onClick={() => setTabForAuction(auc.id, 'artworks')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(auc.id, auc) === 'artworks'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Artworks ({auc.artwork_count})
                                    </button>
                                    <button
                                        onClick={() => setTabForAuction(auc.id, 'persons')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(auc.id, auc) === 'persons'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <User className="w-3.5 h-3.5" />
                                        Persons ({auc.person_count || 0})
                                    </button>
                                </div>

                                {getActiveTab(auc.id, auc) === 'artworks' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {auc.artworks.map(art => (
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
                                        {auc.artworks.length === 0 && (
                                            <div className="col-span-full text-center py-6 text-xs text-gray-500 italic">
                                                No artworks associated with this auction.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(auc.persons || []).map(person => (
                                            <div key={person.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <Link to={`/persons/${person.id}`} state={{ from: 'auctions' }} className="flex items-center gap-3 group">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 overflow-hidden shrink-0 group-hover:border-indigo-300">
                                                            {person.image ? (
                                                                <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-5 h-5 text-indigo-600" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                                {person.name}
                                                            </span>
                                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                                {person.roles && person.roles.length > 0 ? (
                                                                    person.roles.map((role, idx) => (
                                                                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded border border-purple-100 uppercase tracking-tight">
                                                                            {role}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 font-semibold rounded uppercase tracking-tight">
                                                                        Participant
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                                {person.notes && (
                                                    <div className="mt-3 text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 leading-relaxed italic">
                                                        <span className="font-semibold text-gray-500 not-italic block mb-0.5 text-[10px] uppercase tracking-wider">Notes</span>
                                                        "{person.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {(auc.persons || []).length === 0 && (
                                            <div className="text-center py-6 text-xs text-gray-500 italic">
                                                No persons associated with this auction.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredAuctions.length === 0 && (
                <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-2xl text-gray-500 italic">
                    No auctions found with the given search criteria.
                </div>
            )}
        </div>
    );
};

export default AuctionReportPage;
