import React from 'react';
import { AppNotification } from '../types';
import { X, Bell, CheckCheck, Film, Sparkles } from 'lucide-react';

interface NotificationsModalProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllAsRead
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-[#121212] border border-[#262626] rounded-3xl p-5 sm:p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#1F1F1F] text-[#E50914]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Notifications</h3>
              <p className="text-[11px] text-[#94A3B8]">Recent updates and VJ translation drops</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#1F1F1F] text-[#94A3B8] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-2xl border transition-colors ${
                notif.read
                  ? 'bg-[#181818] border-[#262626]'
                  : 'bg-[#1F1F1F] border-[#E50914]/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#262626] text-[#E50914] flex items-center justify-center flex-none mt-0.5">
                  {notif.type === 'vip' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Film className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#94A3B8] flex-none">
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-[#E50914] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1F1F1F] hover:bg-[#262626] border border-[#333333] text-white text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
