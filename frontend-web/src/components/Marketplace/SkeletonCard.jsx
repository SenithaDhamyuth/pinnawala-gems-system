// SRP: Skeleton loading card — Single Responsibility: display only a shimmer placeholder
import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[32px] p-6 border border-slate-100 shadow-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      <div className="bg-slate-100 rounded-2xl h-52 w-full mb-6" />
      <div className="space-y-3">
        <div className="h-5 bg-slate-100 rounded-full w-2/3" />
        <div className="h-3 bg-slate-100 rounded-full w-1/3" />
        <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
          <div className="h-6 bg-slate-100 rounded-lg w-1/3" />
          <div className="h-8 bg-slate-100 rounded-xl w-1/4" />
        </div>
      </div>
    </div>
  );
}
