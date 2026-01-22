
import React, { useState } from 'react';

interface PaletteDisplayProps {
  colors: string[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colors }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex w-full h-14 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => copyToClipboard(color)}
            className="flex-1 h-full transition-all hover:flex-[1.5] relative group/color"
            style={{ backgroundColor: color }}
          >
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                {copied === color ? 'Copied!' : color}
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[9px] text-white/20 uppercase tracking-[0.2em] text-center font-bold">
        Click a shade to copy hex
      </p>
    </div>
  );
};
