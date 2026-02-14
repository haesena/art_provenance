import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getArtworkDetail, Artwork, ProvenanceEvent } from '../services/api';
import { ArrowLeft, FileText, Anchor, BookOpen } from 'lucide-react';

import { getDeterministicColor } from '../utils/colorUtils';

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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Provenance History</h2>
                </div>
                <div className="p-6">
                    <div className="relative border-l-2 border-indigo-100 ml-3 space-y-8">
                        {artwork.provenance?.map((event: ProvenanceEvent) => (
                            <div key={event.id} className="relative pl-8">
                                {/* Dot */}
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-50 border-2 border-indigo-500"></div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                                    <h3 className="text-md font-bold text-gray-900">
                                        {event.type} <span className="text-gray-500 font-normal">by</span> {event.actor}
                                    </h3>
                                    <span className="text-sm text-gray-500 font-mono">
                                        {event.date || 'Unknown Date'}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600">
                                    {event.certainty && <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 mb-2 ${event.certainty === 'Proven' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{event.certainty}</span>}
                                </div>

                                {event.sources && event.sources.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {event.sources.map((src, idx) => (
                                            <div key={idx} className="text-xs text-gray-500 flex items-start gap-1.5 bg-gray-50 p-2 rounded">
                                                <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                <span>{src}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {event.notes && (
                                    <p className="mt-2 text-sm text-gray-600 italic">"{event.notes}"</p>
                                )}
                            </div>
                        ))}
                        {(!artwork.provenance || artwork.provenance.length === 0) && (
                            <p className="text-gray-500 text-sm pl-8">No provenance records found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetail;
