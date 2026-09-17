import React from 'react';
import { Home, Search, Grid, Bookmark } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  savedCount = 0
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'categories', label: 'VJs & Genres', icon: Grid },
    { 
      id: 'mylist', 
      label: 'My List', 
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/98 backdrop-blur-lg border-t border-[#262626] shadow-[0_-4px_20px_rgba(0,0,0,0.8)] safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive
                  ? 'text-[#E50914]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center text-[9px] font-bold bg-[#E50914] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-tight mt-1 ${isActive ? 'font-bold text-[#E50914]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
