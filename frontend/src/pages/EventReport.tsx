import React, { useEffect, useState } from 'react';
import { getEventReport, EventReportRow } from '../services/api';
import { Table, Search, AlertCircle, Download } from 'lucide-react';

const EventReport: React.FC = () => {
    const [events, setEvents] = useState<EventReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEventReport();
                setEvents(data.results || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch event report", err);
                setError("Failed to load the event report. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const searchLower = searchTerm.toLowerCase();
        return (
            event.artwork_name.toLowerCase().includes(searchLower) ||
            event.event_type_name.toLowerCase().includes(searchLower) ||
            (event.person && event.person.toLowerCase().includes(searchLower)) ||
            (event.institution && event.institution.toLowerCase().includes(searchLower)) ||
            (event.auction && event.auction.toLowerCase().includes(searchLower)) ||
            (event.exhibition && event.exhibition.toLowerCase().includes(searchLower))
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-red-600 space-y-2">
                <AlertCircle className="w-8 h-8" />
                <p className="font-medium text-lg">Oops!</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                    <Table className="w-7 h-7 text-indigo-600" />
                    Event Report
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => window.open('/api/events/report/export/', '_blank')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                        title="Download as Excel"
                    >
                        <Download className="w-4 h-4" />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white border text-sm border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="overflow-auto flex-1 h-[calc(100vh-250px)]">
                    <table className="min-w-full divide-y divide-gray-200 border-collapse table-fixed">
                        <thead className="bg-gray-50 uppercase text-[10px] text-gray-500 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-20">Art ID</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-48">Artwork Name</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-16">Seq #</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-16">Type ID</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-32">Event Type</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-32">Date</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-32">Person</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-32">Institution</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-32">Auction</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-32">Exhibition</th>
                                <th scope="col" className="px-3 py-3 font-medium whitespace-nowrap text-left border-x border-gray-200 w-24">Certainty</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-indigo-50/50 transition-colors odd:bg-gray-50/30">
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 border-x border-gray-100 truncate">{event.artwork_id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-medium border-x border-gray-100 truncate" title={event.artwork_name}>{event.artwork_name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 border-x border-gray-100 truncate">{event.sequence_number}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 border-x border-gray-100 truncate">{event.event_type_id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-indigo-600 font-medium border-x border-gray-100 truncate" title={event.event_type_name}>{event.event_type_name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 border-x border-gray-100 truncate" title={event.date || ''}>{event.date || '-'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700 border-x border-gray-100 truncate" title={event.person || ''}>{event.person || '-'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700 border-x border-gray-100 truncate" title={event.institution || ''}>{event.institution || '-'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700 border-x border-gray-100 truncate" title={event.auction || ''}>{event.auction || '-'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-700 border-x border-gray-100 truncate" title={event.exhibition || ''}>{event.exhibition || '-'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 border-x border-gray-100 truncate" title={event.certainty || ''}>{event.certainty || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredEvents.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-t border-gray-200 shrink-0">
                        No events found matching your search.
                    </div>
                )}
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-500 text-right shrink-0">
                    Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </div>
            </div>
        </div>
    );
};

export default EventReport;
