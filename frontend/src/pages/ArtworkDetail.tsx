import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtworkDetail, Artwork, ProvenanceEvent } from '../services/api';
import {
    ArrowLeft,
    FileText,
    Anchor,
    BookOpen,
    Gavel,
    Building2,
    Image as ImageIcon,
    User as UserIcon,
    ArrowRightLeft,
    Calendar,
    MapPin,
    Info
} from 'lucide-react';

import { getDeterministicColor } from '../utils/colorUtils';

const getEventIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('auction') || t.includes('sale')) return <Gavel className="w-4 h-4" />;
    if (t.includes('exhibition') || t.includes('loan')) return <ImageIcon className="w-4 h-4" />;
    if (t.includes('museum') || t.includes('institution') || t.includes('gallery')) return <Building2 className="w-4 h-4" />;
    if (t.includes('theft') || t.includes('confiscation') || t.includes('looting')) return <Info className="w-4 h-4 text-red-500" />;
    if (t.includes('transfer') || t.includes('inheritance')) return <ArrowRightLeft className="w-4 h-4" />;
    if (t.includes('person') || t.includes('owner') || t.includes('collection')) return <UserIcon className="w-4 h-4" />;
    return <Anchor className="w-4 h-4" />;
};

const ArtworkDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState<Artwork | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getArtworkDetail(parseInt(id)).then(data => {
                setArtwork(data);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>;
    if (!artwork) return <div className="p-8 text-center">Artwork not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-12">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-2 md:mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Collection
            </button>

            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Image */}
                <div className="md:col-span-1">
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden shadow-md">
                        {artwork.image ? (
                            <img src={artwork.image} alt={artwork.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full relative">
                                <div
                                    className="absolute inset-0 z-10 opacity-30 mix-blend-multiply"
                                    style={{ backgroundColor: getDeterministicColor(artwork.name) }}
                                />
                                <img src="/assets/placeholder-artwork.png" alt="No image available" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{artwork.name}</h1>
                        <p className="text-xl text-gray-600 mt-2">{artwork.creation_date}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-gray-500 font-medium">Medium</span>
                            <span className="text-gray-900">{artwork.medium || 'Unknown'}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 font-medium">Dimensions</span>
                            <span className="text-gray-900">{artwork.dimension || 'Unknown'}</span>
                        </div>
                    </div>

                    {artwork.notes && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Notes
                            </h3>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{artwork.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Provenance Timeline */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                    <Anchor className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Provenance History</h2>
                </div>

                <div className="relative">
                    {/* Central Line */}
                    <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-indigo-100"></div>

                    <div className="space-y-10">
                        {artwork.provenance?.map((event: ProvenanceEvent) => (
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
                                                <UserIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Actor / Owner</p>
                                                    <p className="text-gray-900 font-medium">{event.actor}</p>
                                                </div>
                                            </div>
                                            {(event.institution || event.auction || event.exhibition) && (
                                                <div className="flex items-start gap-2.5">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight">Location</p>
                                                        <p className="text-gray-900 italic">
                                                            {event.institution || (event.auction ? `Auction: ${event.auction}` : `Exhibition: ${event.exhibition}`)}
                                                            {(event.auction_institution || event.exhibition_institution) &&
                                                                ` at ${event.auction_institution || event.exhibition_institution}`
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
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

                                    {event.sources && event.sources.length > 0 && (
                                        <div className="pt-4 border-t border-gray-50">
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Primary Sources</p>
                                            <div className="flex flex-wrap gap-2">
                                                {event.sources.map((src, idx) => (
                                                    <div key={idx} className="text-[11px] text-gray-600 flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                                                        <BookOpen className="w-3 h-3 text-indigo-400" />
                                                        <span>{src}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!artwork.provenance || artwork.provenance.length === 0) && (
                            <div className="pl-16 py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No provenance records found for this artwork.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetail;
