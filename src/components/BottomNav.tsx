import React from 'react';
import { Home, Film, Tv, User, SlidersHorizontal } from 'lucide-react';
import { PearlUser } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  savedCount?: number;
  user?: PearlUser | null;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  user,
  onOpenAuth,
  onOpenProfile
}) => {
  const isProfileActive = activeTab === 'profile' || activeTab === 'auth';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/98 backdrop-blur-lg border-t border-[#262626] shadow-[0_-4px_20px_rgba(0,0,0,0.8)] safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#E50914]' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-semibold tracking-tight mt-1 ${activeTab === 'home' ? 'font-bold text-[#E50914]' : ''}`}>
            Home
          </span>
        </button>

        {/* Movies */}
        <button
          onClick={() => onTabChange('movies')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'movies' ? 'text-[#E50914]' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Film className={`w-5 h-5 ${activeTab === 'movies' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-semibold tracking-tight mt-1 ${activeTab === 'movies' ? 'font-bold text-[#E50914]' : ''}`}>
            Movies
          </span>
        </button>

        {/* Series */}
        <button
          onClick={() => onTabChange('series')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'series' ? 'text-[#E50914]' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Tv className={`w-5 h-5 ${activeTab === 'series' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-semibold tracking-tight mt-1 ${activeTab === 'series' ? 'font-bold text-[#E50914]' : ''}`}>
            Series
          </span>
        </button>

        {/* Filter (Categories) */}
        <button
          onClick={() => onTabChange('categories')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === 'categories' ? 'text-[#E50914]' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <SlidersHorizontal className={`w-5 h-5 ${activeTab === 'categories' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-semibold tracking-tight mt-1 ${activeTab === 'categories' ? 'font-bold text-[#E50914]' : ''}`}>
            Filter
          </span>
        </button>

        {/* Account / Profile */}
        <button
          onClick={() => {
            if (user && onOpenProfile) onOpenProfile();
            else if (!user && onOpenAuth) onOpenAuth();
            else onTabChange(user ? 'profile' : 'auth');
          }}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            isProfileActive ? 'text-[#E50914]' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          {user ? (
            <div className={`w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow ${
              isProfileActive ? 'bg-[#E50914] ring-2 ring-[#E50914]/40' : 'bg-[#2E2E2E]'
            }`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          )}
          <span className={`text-[10px] font-semibold tracking-tight mt-1 ${isProfileActive ? 'font-bold text-[#E50914]' : ''}`}>
            {user ? 'Account' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
};
