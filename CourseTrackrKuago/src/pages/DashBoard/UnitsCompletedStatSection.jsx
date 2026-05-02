export const UnitsCompletedStatsSection = ({ count }) => {
  return (
    <div className="w-full bg-white/60 rounded-3xl border border-black/30 px-6 py-4 flex items-center justify-between shadow-sm min-h-[88px]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#FFCC00] rounded-md flex items-center justify-center shrink-0 shadow-inner">
            <img src="/cautiondark.svg" alt="" className="w-4 h-4" />
          </div>
          <p className="text-black/80 text-xs font-bold font-['Calistoga'] uppercase tracking-wider">
            Units Completed
          </p>
        </div>
        <p className="text-black/60 text-xs font-medium font-['Inter'] pl-8">
          Out of 173 Units
        </p>
      </div>
      <h3 className="text-[#003366] text-5xl font-bold font-['Inter'] leading-none">
        {count}
      </h3>
    </div>
  );
};