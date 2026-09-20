import React from 'react';
import { Search, Film, Bookmark, MessageSquare, User } from 'lucide-react';
import { PearlUser, PearlSubscription } from '../types';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  savedCount?: number;
  user: PearlUser | null;
  subscription: PearlSubscription;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSubscription?: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  savedCount = 0,
  user,
  subscription: _subscription,
  onOpenAuth,
  onOpenProfile,
  onOpenContact
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#262626] shadow-md">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#161616] border border-[#E50914]/40 shadow-md flex items-center justify-center p-1">
            <img 
              src="/logo.png" 
              alt="PearlPix Logo" 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Film className="w-5 h-5 text-[#E50914] hidden group-has-[img:not([style*='display: none'])]:hidden" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-0.5">
              PEARL<span className="text-[#E50914]">PIX</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] -mt-1">
              Ugandan VJ Translations
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('movies')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'movies'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onTabChange('series')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'series'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            Series
          </button>
          <button
            onClick={() => onTabChange('categories')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            Filter
          </button>
          <button
            onClick={() => onTabChange('mylist')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mylist'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My List</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E50914] text-white">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenContact}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact & Support</span>
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#161616] transition-colors cursor-pointer"
            title="Search Movies"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Account / Profile Button */}
          {user ? (
            <button
              id="header-profile-btn"
              onClick={onOpenProfile}
              className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#E50914]/20 border-[#E50914]'
                  : 'bg-[#161616] hover:bg-[#202020] border-[#262626]'
              }`}
              title="View Profile & Membership"
            >
              <div className="w-7 h-7 rounded-lg bg-[#E50914] text-white text-xs font-black flex items-center justify-center shadow">
                {user.name.charAt(0).toUpperCase() || 'P'}
              </div>
              <span className="hidden md:inline text-xs font-bold text-white max-w-[90px] truncate">
                {user.name}
              </span>
            </button>
          ) : (
            <button
              id="header-signin-btn"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#E50914]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
