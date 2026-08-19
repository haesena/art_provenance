import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstitutions, Institution } from '../services/api';
import { Landmark, ChevronRight, ChevronDown, ImageIcon, Search, ArrowLeftRight, BookOpen } from 'lucide-react';
import { getDeterministicColor } from '../utils/colorUtils';

const InstitutionReport: React.FC = () => {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTabs, setExpandedTabs] = useState<Record<number, 'artworks' | 'interactions'>>({});

    const getActiveTab = (instId: number, inst: Institution) => {
        return expandedTabs[instId] || (inst.artwork_count > 0 ? 'artworks' : 'interactions');
    };
    
    const setTabForInstitution = (instId: number, tab: 'artworks' | 'interactions') => {
        setExpandedTabs(prev => ({ ...prev, [instId]: tab }));
    };

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
                            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {inst.artwork_count} Artworks
                                </span>
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {inst.interaction_count} Interactions
                                </span>
                                {expandedIds.includes(inst.id) ?
                                    <ChevronDown className="w-5 h-5 text-gray-400" /> :
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                }
                            </div>
                        </button>

                        {expandedIds.includes(inst.id) && (
                            <div className="border-t border-gray-100 bg-gray-50/30 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {/* Tab selector */}
                                <div className="flex gap-4 border-b border-gray-200 pb-2">
                                    <button
                                        onClick={() => setTabForInstitution(inst.id, 'artworks')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(inst.id, inst) === 'artworks'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Artworks ({inst.artwork_count})
                                    </button>
                                    <button
                                        onClick={() => setTabForInstitution(inst.id, 'interactions')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(inst.id, inst) === 'interactions'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <ArrowLeftRight className="w-3.5 h-3.5" />
                                        Interactions ({inst.interaction_count})
                                    </button>
                                </div>

                                {getActiveTab(inst.id, inst) === 'artworks' ? (
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
                                        {inst.artwork_count === 0 && (
                                            <div className="col-span-full py-6 text-center text-sm text-gray-500 italic">
                                                No artworks cataloged for this institution.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(inst.interactions || []).map(interaction => {
                                            const isEntity1Me = interaction.entity1.type === 'institution' && interaction.entity1.id === inst.id;
                                            const otherEntity = isEntity1Me ? interaction.entity2 : interaction.entity1;
                                            
                                            return (
                                                <div key={interaction.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                                                {interaction.interaction_type}
                                                            </span>
                                                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                                                <span>Connected with:</span>
                                                                {otherEntity.type === 'person' ? (
                                                                    <Link to={`/persons/${otherEntity.id}`} className="text-indigo-600 hover:underline">
                                                                        {otherEntity.name}
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-gray-900">{otherEntity.name}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                                                            {interaction.date || 'Unknown Date'}
                                                        </div>
                                                    </div>
                                                    
                                                    {interaction.place && (
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            <strong>Place:</strong> {interaction.place}
                                                        </p>
                                                    )}
                                                    
                                                    {interaction.notes && (
                                                        <p className="text-xs text-gray-600 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                                            "{interaction.notes}"
                                                        </p>
                                                    )}

                                                    {interaction.sources && interaction.sources.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-gray-50">
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Sources</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {interaction.sources.map((s, idx) => (
                                                                    <div key={idx} className="flex flex-col gap-0.5">
                                                                        <div className="text-[10px] text-gray-600 flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">
                                                                            <BookOpen className="w-2.5 h-2.5 text-indigo-400" />
                                                                            <span>{s.source_name}</span>
                                                                        </div>
                                                                        {s.notes && (
                                                                            <span className="pl-3 text-[9px] text-gray-400 italic">
                                                                                {s.notes}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {(inst.interactions || []).length === 0 && (
                                            <div className="py-6 text-center text-sm text-gray-500 italic">
                                                No interactions recorded for this institution.
                                            </div>
                                        )}
                                    </div>
                                )}
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
