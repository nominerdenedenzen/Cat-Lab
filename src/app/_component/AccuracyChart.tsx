// 🟢 NEW (this file was empty): one bar per training round showing accuracy.
interface AccuracyChartProps {
  accuracies: number[]; // e.g. [0.5, 0.65, 0.8] → 50%, 65%, 80%
}

export const AccuracyChart = ({ accuracies }: AccuracyChartProps) => {
  if (accuracies.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="font-['Nunito'] text-[15px] text-[#5d6779]">
        Accuracy per round
      </span>
      <div className="flex items-end gap-2 h-32 border-b border-[#dfe4ee]">
        {accuracies.map((acc, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <span className="text-[11px] text-[#5d6779]">{Math.round(acc * 100)}%</span>
            <div
              className="w-full bg-[#3b5bdb] rounded-t-md transition-all duration-300"
              style={{ height: `${acc * 100}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccuracyChart;
