import React from "react";

interface RoundCounterProps {
  current?: number;
  total?: number;
}

export const RoundCounter = ({
  current = 6,
  total = 10,
}: RoundCounterProps) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <span className="font-['Nunito'] text-[15px] text-[#5d6779]">Round</span>
      <div className="font-['Fredoka'] font-[600] text-[44px] text-[#212529] leading-none mt-1">
        {current} / {total}
      </div>
    </div>
  );
};

export default RoundCounter;
