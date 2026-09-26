import React, { useState, useEffect } from 'react';

interface AuraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  // If the user uploads their own image logo, they can provide customLogoSrc
  customLogoSrc?: string;
}

export const AuraLogo: React.FC<AuraLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  customLogoSrc,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFullLogo, setIsFullLogo] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aura_custom_logo_url');
      if (stored) {
        setCustomLogoUrl(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  // Primary source is customLogoSrc or customLogoUrl or the user's /logo.png
  const activeImageSrc = customLogoSrc || customLogoUrl || '/logo.png';

  const iconSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 sm:w-8 sm:h-8 text-sm',
    lg: 'w-9 h-9 sm:w-10 sm:h-10 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  };

  // If the user's logo is a full banner with text
  if (activeImageSrc && !imageError && isFullLogo) {
    return (
      <div className={`flex flex-col ${className}`}>
        <img
          src={activeImageSrc}
          alt="AURA ✦"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth / img.naturalHeight > 1.3) {
              setIsFullLogo(true);
            }
          }}
          onError={() => setImageError(true)}
          className="h-8 sm:h-9 w-auto max-w-[180px] object-contain rounded-lg"
        />
        {showSubtitle && (
          <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block mt-0.5">
            Minha Melhor Versão
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark: /logo.png if square/icon, or SVG icon if not loaded/errored */}
      {activeImageSrc && !imageError ? (
        <img
          src={activeImageSrc}
          alt="AURA ✦"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth / img.naturalHeight > 1.3) {
              setIsFullLogo(true);
            }
          }}
          onError={() => setImageError(true)}
          className={`${iconSizes[size]} object-contain rounded-xl shadow-2xs`}
        />
      ) : (
        /* Vector Aura Icon with Golden ✦ Star */
        <div
          className={`${iconSizes[size]} rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden group-hover:border-amber-500/60 transition-colors`}
        >
          {/* Subtle warm glow behind star */}
          <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent pointer-events-none" />

          {/* Golden 4-point star SVG */}
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-amber-500 text-amber-500 relative z-10 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
          >
            <path d="M12 2 C12 7.5 7.5 12 2 12 C7.5 12 12 16.5 12 22 C12 16.5 16.5 12 22 12 C16.5 12 12 7.5 12 2 Z" />
          </svg>
        </div>
      )}

      {/* Typography: AURA ✦ */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display ${textSizes[size]} font-extrabold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors`}
          >
            AURA
          </span>
          <span className="text-amber-600 font-bold text-sm tracking-normal">✦</span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block mt-0.5">
            Minha Melhor Versão
          </span>
        )}
      </div>
    </div>
  );
};

