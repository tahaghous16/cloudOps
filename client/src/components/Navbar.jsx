import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, ChevronDown, LogOut, User, Terminal, Shield } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md">
      {/* Left: Mobile Toggle & Mobile Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 md:hidden cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo shows only on mobile in Navbar */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/10">
            <Terminal className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-md font-bold tracking-tight text-white">
            Cloud<span className="text-sky-400">Ops</span>
          </span>
        </div>
      </div>

      {/* Right: User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1 px-2.5 rounded-lg border border-slate-800 hover:bg-slate-800/50 cursor-pointer"
        >
          {/* Avatar Dot */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold text-xs">
            {getInitials(user?.name)}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-slate-200">
            {user?.name || 'Administrator'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50">
            {/* Header info */}
            <div className="px-4.5 py-3 border-b border-slate-800/80">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Logged in as</p>
              <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
              className="w-full flex items-center gap-2.5 px-4.5 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile Settings</span>
            </button>

            <div className="border-t border-slate-800/80 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
