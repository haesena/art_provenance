import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getPersonDetail, PersonDetail } from '../services/api';
import {
    ArrowLeft,
    User,
    History,
    ExternalLink,
    Gavel,
    Building2,
    Image as ImageIcon,
    ArrowRightLeft,
    Calendar,
    MapPin,
    Info,
    BookOpen,
    Clock,
    Zap,
    ArrowLeftRight,
    Landmark
} from 'lucide-react';

const getEventIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('auction') || t.includes('sale')) return <Gavel className="w-4 h-4" />;
    if (t.includes('exhibition') || t.includes('loan')) return <ImageIcon className="w-4 h-4" />;
    if (t.includes('museum') || t.includes('institution') || t.includes('gallery')) return <Building2 className="w-4 h-4" />;
    if (t.includes('theft') || t.includes('confiscation') || t.includes('looting')) return <Info className="w-4 h-4 text-red-500" />;
    if (t.includes('transfer') || t.includes('inheritance')) return <ArrowRightLeft className="w-4 h-4" />;
    if (t.includes('person') || t.includes('owner') || t.includes('collection')) return <User className="w-4 h-4" />;
    return <History className="w-4 h-4" />;
};

const PersonDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [person, setPerson] = useState<PersonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'events' | 'interactions' | 'auctions'>('events');

    const fromState = (location.state as { from?: string } | null)?.from;
    const backLabel = fromState === 'auctions'
        ? 'Back to Auctions'
        : fromState === 'institutions'
        ? 'Back to Institutions'
        : 'Back to Persons';

    const handleBack = () => {
        if (fromState === 'auctions') {
            navigate('/analysis/auctions');
        } else if (fromState === 'institutions') {
            navigate('/analysis/institutions');
        } else {
            navigate(-1);
        }
    };

    useEffect(() => {
        if (id) {
            getPersonDetail(parseInt(id))
                .then(data => {
                    setPerson(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>;
    if (!person) return <div className="p-8 text-center">Person not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-12">
            <button
                onClick={handleBack}
                className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> {backLabel}
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100 flex-shrink-0 overflow-hidden">
                        {person.image ? (
                            <img src={person.image} alt={`${person.first_name} ${person.family_name}`} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 md:w-16 md:h-16 text-indigo-600" />
                        )}
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{person.family_name}, {person.first_name}</h1>
                            <p className="text-lg text-indigo-600 font-medium mt-1">
                                {person.birth_date || 'Unknown'} — {person.death_date || 'Unknown'}
                            </p>
                        </div>
                        {person.biography && (
                            <div className="text-gray-600 text-sm leading-relaxed prose prose-slate">
                                {person.biography}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs for switching views */}
            <div className="border-b border-gray-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'events'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <History className="w-4 h-4" />
                        Artwork & Events ({person.events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('interactions')}
                        className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'interactions'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                        Interactions ({(person.interactions || []).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('auctions')}
                        className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === 'auctions'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Gavel className="w-4 h-4" />
                        Auctions ({(person.auctions || []).length})
                    </button>
                </div>
            </div>

            {activeTab === 'events' ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <History className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Provenance Involvement</h2>
                    </div>

                    <div className="relative">
                        {/* Central Line */}
                        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-indigo-100"></div>

                        <div className="space-y-10">
                            {person.events.map((event) => (
                                <div key={event.id} className="relative pl-16 group">
                                    {/* Icon Circle */}
                                    <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center z-10 shadow-sm group-hover:border-indigo-500 transition-colors">
                                        <div className="text-indigo-600">
                                            {getEventIcon(event.type)}
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                                        {event.type}
                                                    </span>
                                                    {event.certainty && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${event.certainty === 'Proven' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                            {event.certainty}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {event.artwork_name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Link
                                                    to={`/artworks/${event.artwork_id}`}
                                                    title={`View ${event.artwork_name}`}
                                                    className="group/img shrink-0"
                                                >
                                                    <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center group-hover/img:border-indigo-500 shadow-sm transition-all">
                                                        {event.artwork_image ? (
                                                            <img src={event.artwork_image} alt={event.artwork_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="w-8 h-8 text-gray-400 group-hover/img:text-indigo-600 transition-colors" />
                                                        )}
                                                    </div>
                                                </Link>
                                                <div className="flex items-center gap-1.5 text-gray-400 font-mono text-sm bg-gray-50 px-3 py-1 rounded-full shrink-0">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {event.date || 'Unknown Date'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-2.5">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Location / Actor</p>
                                                        <p className="text-gray-900 italic font-medium">
                                                            {event.institution || (event.auction ? `Auction: ${event.auction}` : event.exhibition ? `Exhibition: ${event.exhibition}` : event.actor)}
                                                            {(event.auction_institution || event.exhibition_institution) &&
                                                                ` at ${event.auction_institution || event.exhibition_institution}`
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {event.notes && (
                                                    <div className="flex items-start gap-2.5">
                                                        <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Notes</p>
                                                            <p className="text-gray-600 leading-relaxed italic">"{event.notes}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-50 gap-4">
                                            {event.sources && event.sources.length > 0 ? (
                                                <div className="flex-1">
                                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Sources</p>
                                                    <div className="space-y-2">
                                                        {event.sources.map((s, idx) => (
                                                            <div key={idx} className="flex flex-col gap-1 w-fit">
                                                                <div className="text-[11px] text-gray-600 flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                                                                    <BookOpen className="w-3 h-3 text-indigo-400" />
                                                                    <span>{s.source}</span>
                                                                </div>
                                                                {s.notes && (
                                                                    <div className="pl-4 text-[10px] text-gray-400 italic">
                                                                        {s.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : <div className="flex-1" />}

                                            <div className="shrink-0">
                                                <Link
                                                    to={`/artworks/${event.artwork_id}`}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all border border-indigo-100 hover:border-indigo-600 shadow-sm"
                                                >
                                                    View Artwork <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {person.events.length === 0 && (
                                <div className="pl-16 py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No related provenance events found in the archive.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'interactions' ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Interactions</h2>
                    </div>

                    <div className="relative">
                        {/* Central Line */}
                        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-indigo-100"></div>

                        <div className="space-y-10">
                            {(person.interactions || []).map((interaction) => {
                                const isEntity1Me = interaction.entity1.type === 'person' && interaction.entity1.id === person.id;
                                const otherEntity = isEntity1Me ? interaction.entity2 : interaction.entity1;

                                return (
                                    <div key={interaction.id} className="relative pl-16 group">
                                        {/* Icon Circle */}
                                        <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center z-10 shadow-sm group-hover:border-indigo-500 transition-colors">
                                            <div className="text-indigo-600">
                                                {otherEntity.type === 'person' ? (
                                                    <User className="w-4 h-4" />
                                                ) : (
                                                    <Landmark className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Card */}
                                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                                            {interaction.interaction_type === 'long term' ? <Clock className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                                                            {interaction.interaction_type}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {otherEntity.type === 'person' ? 'Person' : 'Institution'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {otherEntity.type === 'person' ? (
                                                            <Link to={`/persons/${otherEntity.id}`} className="hover:text-indigo-600 transition-colors">
                                                                {otherEntity.name}
                                                            </Link>
                                                        ) : (
                                                            <span>{otherEntity.name}</span>
                                                        )}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-400 font-mono text-sm bg-gray-50 px-3 py-1 rounded-full">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {interaction.date || 'Unknown Date'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                                <div className="space-y-3">
                                                    {interaction.place && (
                                                        <div className="flex items-start gap-2.5">
                                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Place</p>
                                                                <p className="text-gray-900 font-medium">{interaction.place}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    {interaction.notes && (
                                                        <div className="flex items-start gap-2.5">
                                                            <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Notes</p>
                                                                <p className="text-gray-600 leading-relaxed italic">"{interaction.notes}"</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {interaction.sources && interaction.sources.length > 0 && (
                                                <div className="pt-4 border-t border-gray-50">
                                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Sources</p>
                                                    <div className="space-y-2">
                                                        {interaction.sources.map((s, idx) => (
                                                            <div key={idx} className="flex flex-col gap-1 w-fit">
                                                                <div className="text-[11px] text-gray-600 flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                                                                    <BookOpen className="w-3 h-3 text-indigo-400" />
                                                                    <span>{s.source_name}</span>
                                                                </div>
                                                                {s.notes && (
                                                                    <div className="pl-4 text-[10px] text-gray-400 italic">
                                                                        {s.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {(person.interactions || []).length === 0 && (
                                <div className="pl-16 py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No interactions found for this person.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <Gavel className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Related Auctions</h2>
                    </div>

                    <div className="relative">
                        {/* Central Line */}
                        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-indigo-100"></div>

                        <div className="space-y-10">
                            {(person.auctions || []).map((auction) => (
                                <div key={auction.id} className="relative pl-16 group">
                                    {/* Icon Circle */}
                                    <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center z-10 shadow-sm group-hover:border-indigo-500 transition-colors">
                                        <div className="text-indigo-600">
                                            <Gavel className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {auction.roles && auction.roles.length > 0 ? (
                                                        auction.roles.map((role, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                                                {role}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                                            Auction Participant
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {auction.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400 font-mono text-sm bg-gray-50 px-3 py-1 rounded-full">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {auction.date || 'Unknown Date'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                            <div className="space-y-3">
                                                {auction.institution && (
                                                    <div className="flex items-start gap-2.5">
                                                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Institution / House</p>
                                                            <p className="text-gray-900 font-medium">{auction.institution}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                {auction.notes && (
                                                    <div className="flex items-start gap-2.5">
                                                        <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Notes</p>
                                                            <p className="text-gray-600 leading-relaxed italic">"{auction.notes}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Related Artworks */}
                                        {auction.artworks && auction.artworks.length > 0 && (
                                            <div className="pt-4 border-t border-gray-50">
                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Associated Artworks</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {auction.artworks.map((art) => (
                                                        <Link
                                                            key={art.id}
                                                            to={`/artworks/${art.id}`}
                                                            className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group/art"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                                {art.image ? (
                                                                    <img src={art.image} alt={art.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-xs font-semibold text-gray-800 truncate group-hover/art:text-indigo-600 block">
                                                                    {art.name}
                                                                </span>
                                                            </div>
                                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover/art:text-indigo-600 mr-1" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sources */}
                                        {auction.sources && auction.sources.length > 0 && (
                                            <div className="pt-4 mt-4 border-t border-gray-50">
                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Sources</p>
                                                <div className="space-y-2">
                                                    {auction.sources.map((s, idx) => (
                                                        <div key={idx} className="flex flex-col gap-1 w-fit">
                                                            <div className="text-[11px] text-gray-600 flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                                                                <BookOpen className="w-3 h-3 text-indigo-400" />
                                                                <span>{s.source}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(person.auctions || []).length === 0 && (
                                <div className="pl-16 py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">No related auctions found for this person.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonDetailPage;
