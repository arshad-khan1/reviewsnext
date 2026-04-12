"use client";

export function GoogleStarIcon({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-full bg-emerald-600 flex items-center justify-center ${className}`}
    >
      <div className="text-white text-[12px] font-black italic">★</div>
    </div>
  );
}
