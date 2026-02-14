import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPersonDetail, PersonDetail } from '../services/api';
import { ArrowLeft, User, History, ExternalLink } from 'lucide-react';

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
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100 flex-shrink-0">
                        <User className="w-12 h-12 md:w-16 md:h-16 text-indigo-600" />
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

            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">Provenance Involvement</h2>
                </div>

                <div className="grid gap-4">
                    {person.events.map((event) => (
                        <div key={event.id} className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded uppercase tracking-wider">
                                            {event.event_type}
                                        </span>
                                        <span className="text-sm text-gray-400 font-mono">{event.date}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                                        Regarding: <span className="text-indigo-600">{event.artwork_name}</span>
                                    </h3>
                                    {event.notes && (
                                        <p className="text-sm text-gray-500 italic mt-2 border-l-2 border-gray-100 pl-3">
                                            {event.notes}
                                        </p>
                                    )}
                                </div>
                                <Link
                                    to={`/artworks/${event.artwork_id}`}
                                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    View Artwork <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                    {person.events.length === 0 && (
                        <div className="bg-slate-50 py-8 text-center rounded-xl border border-dashed border-slate-200 text-slate-500 font-medium">
                            No related provenance events found in the archive.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonDetailPage;
