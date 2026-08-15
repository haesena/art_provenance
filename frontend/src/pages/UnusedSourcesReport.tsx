import React, { useEffect, useState } from 'react';
import { getUnusedSources, UnusedSource } from '../services/api';
import { FileX, Search, ExternalLink } from 'lucide-react';

const UnusedSourcesReport: React.FC = () => {
    const [sources, setSources] = useState<UnusedSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getUnusedSources();
                setSources(data.results || []);
            } catch (error) {
                console.error("Failed to fetch unused sources", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredSources = sources.filter(src =>
        src.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (src.type && src.type.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    <FileX className="w-7 h-7 text-orange-600" />
                    Unused Sources
                    <span className="ml-2 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {filteredSources.length} source{filteredSources.length !== 1 ? 's' : ''}
                    </span>
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

            <p className="text-sm text-gray-500 -mt-2">
                Sources that are not linked to any provenance event.
            </p>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Link</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSources.map((src) => (
                            <tr key={src.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-400 font-mono">{src.id}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{src.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{src.type || '—'}</td>
                                <td className="px-4 py-3 text-sm">
                                    {src.link ? (
                                        <a
                                            href={src.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                                        >
                                            Link <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-gray-300">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredSources.length === 0 && (
                <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-2xl text-gray-500 italic">
                    {sources.length === 0
                        ? 'All sources are linked to at least one provenance event.'
                        : 'No sources found with the given search criteria.'}
                </div>
            )}
        </div>
    );
};

export default UnusedSourcesReport;
