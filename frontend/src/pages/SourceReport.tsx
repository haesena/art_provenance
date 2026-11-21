import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSourcesReport, SourceReport } from '../services/api';
import { FileText, ChevronRight, ChevronDown, ImageIcon, Search, ArrowLeftRight, Gavel, BookOpen, Calendar } from 'lucide-react';
import { getDeterministicColor } from '../utils/colorUtils';

type SourceTab = 'artworks' | 'interactions' | 'auctions' | 'exhibitions';

const SourceReportPage: React.FC = () => {
    const [sources, setSources] = useState<SourceReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | SourceTab>('all');
    const [activeTabs, setActiveTabs] = useState<Record<number, SourceTab>>({});

    useEffect(() => {
        const fetchSources = async () => {
            try {
                const data = await getSourcesReport();
                setSources(data.results || []);
            } catch (error) {
                console.error("Failed to fetch sources", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSources();
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getActiveTab = (srcId: number, src: SourceReport): SourceTab => {
        if (activeTabs[srcId]) return activeTabs[srcId];
        if ((src.artwork_count || 0) > 0) return 'artworks';
        if ((src.interaction_count || 0) > 0) return 'interactions';
        if ((src.auction_count || 0) > 0) return 'auctions';
        if ((src.exhibition_count || 0) > 0) return 'exhibitions';
        return 'artworks';
    };

    const setTabForSource = (srcId: number, tab: SourceTab) => {
        setActiveTabs(prev => ({ ...prev, [srcId]: tab }));
    };

    const filteredSources = sources.filter(src => {
        const matchesSearch = src.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (src.type && src.type.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) return false;

        if (categoryFilter === 'artworks') return (src.artwork_count || 0) > 0;
        if (categoryFilter === 'interactions') return (src.interaction_count || 0) > 0;
        if (categoryFilter === 'auctions') return (src.auction_count || 0) > 0;
        if (categoryFilter === 'exhibitions') return (src.exhibition_count || 0) > 0;

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
                    <FileText className="w-7 h-7 text-indigo-600" />
                    Sources Report
                </h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search sources..."
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
                    All ({sources.length})
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
                    With Artworks ({sources.filter(s => (s.artwork_count || 0) > 0).length})
                </button>
                <button
                    onClick={() => setCategoryFilter('interactions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        categoryFilter === 'interactions'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    With Interactions ({sources.filter(s => (s.interaction_count || 0) > 0).length})
                </button>
                <button
                    onClick={() => setCategoryFilter('auctions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        categoryFilter === 'auctions'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <Gavel className="w-3.5 h-3.5" />
                    With Auctions ({sources.filter(s => (s.auction_count || 0) > 0).length})
                </button>
                <button
                    onClick={() => setCategoryFilter('exhibitions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        categoryFilter === 'exhibitions'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    With Exhibitions ({sources.filter(s => (s.exhibition_count || 0) > 0).length})
                </button>
            </div>

            <div className="grid gap-4">
                {filteredSources.map((src) => (
                    <div key={src.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <button 
                            onClick={() => toggleExpand(src.id)}
                            className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors gap-4"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900">{src.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        {src.type && <span>Type: {src.type}</span>}
                                        {src.type && src.link && <span>•</span>}
                                        {src.link && <a href={src.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline" onClick={(e) => e.stopPropagation()}>Link</a>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0 justify-end">
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {src.artwork_count || 0} Artworks
                                </span>
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {src.interaction_count || 0} Interactions
                                </span>
                                <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {src.auction_count || 0} Auctions
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {src.exhibition_count || 0} Exhibitions
                                </span>
                                {expandedIds.includes(src.id) ? 
                                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                }
                            </div>
                        </button>

                        {expandedIds.includes(src.id) && (
                            <div className="border-t border-gray-100 bg-gray-50/30 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                {/* Tab selector */}
                                <div className="flex flex-wrap gap-4 border-b border-gray-200 pb-2">
                                    <button
                                        onClick={() => setTabForSource(src.id, 'artworks')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(src.id, src) === 'artworks'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        Artworks ({src.artwork_count || 0})
                                    </button>
                                    <button
                                        onClick={() => setTabForSource(src.id, 'interactions')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(src.id, src) === 'interactions'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <ArrowLeftRight className="w-3.5 h-3.5" />
                                        Interactions ({src.interaction_count || 0})
                                    </button>
                                    <button
                                        onClick={() => setTabForSource(src.id, 'auctions')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(src.id, src) === 'auctions'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <Gavel className="w-3.5 h-3.5" />
                                        Auctions ({src.auction_count || 0})
                                    </button>
                                    <button
                                        onClick={() => setTabForSource(src.id, 'exhibitions')}
                                        className={`pb-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                                            getActiveTab(src.id, src) === 'exhibitions'
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Exhibitions ({src.exhibition_count || 0})
                                    </button>
                                </div>

                                {getActiveTab(src.id, src) === 'artworks' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {src.artworks.map(art => (
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
                                        {src.artworks.length === 0 && (
                                            <div className="col-span-full text-center py-6 text-xs text-gray-500 italic">
                                                No artworks associated with this source.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {getActiveTab(src.id, src) === 'interactions' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(src.interactions || []).map(interaction => (
                                            <div key={interaction.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded uppercase tracking-wider mb-1 inline-block">
                                                            {interaction.interaction_type}
                                                        </span>
                                                        <div className="text-sm font-semibold text-gray-900 flex flex-wrap items-center gap-1.5">
                                                            {interaction.entity1.type === 'person' ? (
                                                                <Link to={`/persons/${interaction.entity1.id}`} className="text-indigo-600 hover:underline">
                                                                    {interaction.entity1.name}
                                                                </Link>
                                                            ) : (
                                                                <Link to={`/analysis/institutions?id=${interaction.entity1.id}`} className="text-indigo-600 hover:underline">
                                                                    {interaction.entity1.name}
                                                                </Link>
                                                            )}
                                                            <span className="text-gray-400">↔</span>
                                                            {interaction.entity2.type === 'person' ? (
                                                                <Link to={`/persons/${interaction.entity2.id}`} className="text-indigo-600 hover:underline">
                                                                    {interaction.entity2.name}
                                                                </Link>
                                                            ) : (
                                                                <Link to={`/analysis/institutions?id=${interaction.entity2.id}`} className="text-indigo-600 hover:underline">
                                                                    {interaction.entity2.name}
                                                                </Link>
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
                                            </div>
                                        ))}
                                        {(src.interactions || []).length === 0 && (
                                            <div className="col-span-full py-6 text-center text-xs text-gray-500 italic">
                                                No interactions associated with this source.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {getActiveTab(src.id, src) === 'auctions' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(src.auctions || []).map(auc => (
                                            <Link
                                                key={auc.id}
                                                to={`/analysis/auctions?id=${auc.id}`}
                                                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between group"
                                            >
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 text-sm flex items-center gap-2">
                                                        <Gavel className="w-4 h-4 text-indigo-600 shrink-0" />
                                                        {auc.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{auc.date || 'Date unknown'}</span>
                                                        {auc.institution && <span>• {auc.institution}</span>}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {(src.auctions || []).length === 0 && (
                                            <div className="col-span-full py-6 text-center text-xs text-gray-500 italic">
                                                No auctions associated with this source.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {getActiveTab(src.id, src) === 'exhibitions' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(src.exhibitions || []).map(exh => (
                                            <Link
                                                key={exh.id}
                                                to={`/analysis/exhibitions?id=${exh.id}`}
                                                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between group"
                                            >
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 text-sm flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                                                        {exh.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>
                                                            {exh.date_start}
                                                            {exh.date_end ? ` - ${exh.date_end}` : ''}
                                                            {!exh.date_start && !exh.date_end ? 'Dates unknown' : ''}
                                                        </span>
                                                        {exh.institution && <span>• {exh.institution}</span>}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {(src.exhibitions || []).length === 0 && (
                                            <div className="col-span-full py-6 text-center text-xs text-gray-500 italic">
                                                No exhibitions associated with this source.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredSources.length === 0 && (
                <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-2xl text-gray-500 italic">
                    No sources found with the given search criteria.
                </div>
            )}
        </div>
    );
};

export default SourceReportPage;
