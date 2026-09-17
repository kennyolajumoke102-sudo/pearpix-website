import React from 'react';
import { Search, Film, Bookmark } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  savedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  savedCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#262626] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'home'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('search')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'search'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => onTabChange('categories')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#1F1F1F] text-[#E50914] shadow'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
          >
            VJs & Genres
          </button>
          <button
            onClick={() => onTabChange('mylist')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
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
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#161616] transition-colors"
            title="Search Movies"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick My List icon on mobile/tablet */}
          <button
            id="header-mylist-btn"
            onClick={() => onTabChange('mylist')}
            className={`relative p-2 rounded-xl transition-colors md:hidden ${
              activeTab === 'mylist'
                ? 'text-[#E50914] bg-[#1F1F1F]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#161616]'
            }`}
            title="My List"
          >
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold bg-[#E50914] text-white rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
