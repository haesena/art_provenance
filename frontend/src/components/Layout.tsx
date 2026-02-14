import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Database, BarChart2, LogOut, User as UserIcon, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // In local dev, admin is on port 8000. In prod, it's on the same host.
    const adminUrl = window.location.port === '5173'
        ? 'http://localhost:8000/admin/'
        : '/admin/';

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navLinks = [
        { to: '/', icon: Database, label: 'Artworks', active: location.pathname === '/' || location.pathname.startsWith('/artworks') },
        { to: '/persons', icon: UserIcon, label: 'Persons', active: location.pathname.startsWith('/persons') },
        { to: '/analysis', icon: BarChart2, label: 'Analysis', active: location.pathname === '/analysis' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-50 px-4 h-16 flex items-center justify-between shadow-sm">
                <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold" onClick={closeMobileMenu}>
                    <BookOpen className="w-6 h-6" />
                    <span className="text-lg">Art Provenance</span>
                </Link>
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-50 transition-transform duration-300 transform
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-100 mb-4 hidden md:block">
                    <h1 className="text-xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                        < BookOpen className="w-6 h-6" />
                        Art Provenance
                    </h1>
                </div>

                {/* Mobile Sidebar Brand (Inside Drawer) */}
                <div className="p-6 border-b border-slate-100 mb-4 md:hidden flex items-center justify-between">
                    <h1 className="text-lg font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                        < BookOpen className="w-6 h-6" />
                        Art Provenance
                    </h1>
                    <button onClick={closeMobileMenu} className="text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={closeMobileMenu}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${link.active
                                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}

                    {user?.is_staff && (
                        <a
                            href={adminUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2.5 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-700 transition-all font-medium"
                        >
                            <Settings className="w-5 h-5" />
                            Admin Panel
                        </a>
                    )}
                </nav>

                {/* User Section at Bottom */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 flex-shrink-0">
                            <UserIcon className="w-5 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate uppercase tracking-wider">{user?.username || 'Guest'}</p>
                            <p className="text-xs text-slate-500 truncate lowercase">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            closeMobileMenu();
                            logout();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
