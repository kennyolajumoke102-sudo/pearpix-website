import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface FloatingInstallApkButtonProps {
  apkUrl?: string;
}

export const FloatingInstallApkButton: React.FC<FloatingInstallApkButtonProps> = ({
  apkUrl = 'https://play.google.com/store/apps/details?id=com.uganda.movieshub'
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside
      aria-label="Download Android App"
      className="md:hidden fixed bottom-[72px] right-3.5 z-40 flex items-center group animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="relative flex items-center">
        {/* Main Install Button Link */}
        <a
          href={apkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full bg-gradient-to-r from-[#E50914] via-[#DC0813] to-[#B80710] hover:from-[#FF1E27] hover:to-[#C40812] text-white border border-white/25 shadow-[0_8px_25px_rgba(229,9,20,0.55)] active:scale-95 transition-all select-none"
        >
          {/* Pulsing Icon Badge */}
          <div className="relative w-7 h-7 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-white">
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black leading-tight tracking-tight uppercase flex items-center gap-1">
              <span>Install APK</span>
              <Download className="w-3 h-3 text-white/90" />
            </span>
            <span className="text-[9px] text-white/80 font-medium leading-none">
              Play Store / Android
            </span>
          </div>
        </a>

        {/* Small Dismiss Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#181818] border border-white/20 text-gray-400 hover:text-white flex items-center justify-center text-[10px] shadow-md transition-colors cursor-pointer"
          title="Dismiss"
          aria-label="Dismiss app install banner"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
