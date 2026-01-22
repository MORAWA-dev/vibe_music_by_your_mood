
import React from 'react';

export const LoadingVibe: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin"></div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-serif italic text-white/90">Analyzing the Atmosphere</h3>
        <p className="text-sm text-white/50 animate-pulse">Consulting the aesthetic registers...</p>
      </div>
    </div>
  );
};
