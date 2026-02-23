import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPersons, getEventTypes, Person, EventType } from '../services/api';
import { Search, User as UserIcon, Filter, X } from 'lucide-react';

const PersonList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [persons, setPersons] = useState<Person[]>([]);

    // Initialize state from search parameters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedEventType, setSelectedEventType] = useState<string>(searchParams.get('event_type') || '');

    const [loading, setLoading] = useState(true);
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [showFilters, setShowFilters] = useState(selectedEventType !== '');

    useEffect(() => {
        const fetchEventTypes = async () => {
            try {
                const data = await getEventTypes();
                setEventTypes(data.results || []);
            } catch (error) {
                console.error("Failed to fetch event types", error);
            }
        };
        fetchEventTypes();
    }, []);

    useEffect(() => {
        const fetchPersons = async () => {
            setLoading(true);
            try {
                const params: any = {};
                if (selectedEventType) params.event_type = selectedEventType;

                const data = await getPersons(params);
                setPersons(data.results || []);
            } catch (error) {
                console.error("Failed to fetch persons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersons();

        // Update URL params
        const newParams: any = {};
        if (searchTerm) newParams.q = searchTerm;
        if (selectedEventType) newParams.event_type = selectedEventType;
        setSearchParams(newParams, { replace: true });
    }, [selectedEventType, searchTerm, setSearchParams]);

    const filteredPersons = persons.filter(person => {
        const fullSearch = `${person.first_name} ${person.family_name}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase());
    });

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedEventType('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Persons Exploration</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                        {selectedEventType && (
                            <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">1</span>
                        )}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-wrap gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Provenance Event Type</label>
                        <select
                            value={selectedEventType}
                            onChange={(e) => setSelectedEventType(e.target.value)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Event Types</option>
                            {eventTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" /> Clear All
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPersons.map((person) => (
                        <Link key={person.id} to={`/persons/${person.id}`} className="group">
                            <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                                    <UserIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate group-hover:text-indigo-600">
                                        {person.family_name}, {person.first_name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-1">
                                        {person.birth_date || '?'} — {person.death_date || '?'}
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">
                                            {person.artwork_count || 0} {person.artwork_count === 1 ? 'Artwork' : 'Artworks'}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-medium">
                                            {person.event_count || 0} {person.event_count === 1 ? 'Event' : 'Events'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {filteredPersons.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 italic">
                            No persons found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PersonList;
