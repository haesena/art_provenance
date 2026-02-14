import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPersons, Person } from '../services/api';
import { Search, User } from 'lucide-react';

const PersonList: React.FC = () => {
    const [persons, setPersons] = useState<Person[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPersons = async () => {
            try {
                const data = await getPersons();
                setPersons(data.results || []);
            } catch (error) {
                console.error("Failed to fetch persons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersons();
    }, []);

    const filteredPersons = persons.filter(person => {
        const fullSearch = `${person.first_name} ${person.family_name}`.toLowerCase();
        return fullSearch.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Persons Exploration</h2>
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
            </div>

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
                                    <User className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate group-hover:text-indigo-600">
                                        {person.family_name}, {person.first_name}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {person.birth_date || '?'} — {person.death_date || '?'}
                                    </p>
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
