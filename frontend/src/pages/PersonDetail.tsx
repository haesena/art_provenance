import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    BookOpen
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
    const [person, setPerson] = useState<PersonDetail | null>(null);
    const [loading, setLoading] = useState(true);

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
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Persons
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
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
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
                                        <div className="flex items-center gap-1.5 text-gray-400 font-mono text-sm bg-gray-50 px-3 py-1 rounded-full">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {event.date || 'Unknown Date'}
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
                                                <div className="flex flex-wrap gap-2">
                                                    {event.sources.map((src, idx) => (
                                                        <div key={idx} className="text-[11px] text-gray-600 flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                                                            <BookOpen className="w-3 h-3 text-indigo-400" />
                                                            <span>{src}</span>
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
        </div>
    );
};

export default PersonDetailPage;
