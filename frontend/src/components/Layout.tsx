import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Database, BarChart2, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-100 mb-4">
                    <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Art Provenance
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${location.pathname === '/' || location.pathname.startsWith('/artworks')
                            ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Database className="w-5 h-5" />
                        Artworks
                    </Link>
                    <Link
                        to="/analysis"
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${location.pathname === '/analysis'
                            ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <BarChart2 className="w-5 h-5" />
                        Analysis
                    </Link>
                </nav>

                {/* User Section at Bottom */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                            <UserIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate uppercase tracking-wider">{user?.username}</p>
                            <p className="text-xs text-slate-500 truncate lowercase">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
