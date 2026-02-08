import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { BookOpen, Database, BarChart2 } from 'lucide-react';

const Layout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Art Provenance
                    </h1>
                </div>
                <nav className="mt-4 px-4 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 bg-gray-50 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                        <Database className="w-5 h-5" />
                        Artworks
                    </Link>
                    <Link
                        to="/analysis"
                        className="flex items-center gap-3 px-4 py-2 text-gray-600 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                        <BarChart2 className="w-5 h-5" />
                        Analysis
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
