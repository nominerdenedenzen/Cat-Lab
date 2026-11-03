import React from "react";

interface ProgressBarProps {
  current?: number;
  total?: number;
}

export const ProgressBar = ({ current = 6, total = 10 }: ProgressBarProps) => {
    
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const clampedProgress = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full h-[14px] rounded-[7px] bg-[#f4f6fb] border border-[#dfe4ee] overflow-hidden">
      <div
        className="h-full bg-[#3b5bdb] transition-all duration-300"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
