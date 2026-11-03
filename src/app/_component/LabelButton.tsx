import React, { useState } from "react";

interface LabelButtonProps {
  onSelect?: (label: "cat" | "not cat") => void;
}

export const LabelButton = ({ onSelect }: LabelButtonProps) => {
  // Local state to track which button is currently selected
  const [selected, setSelected] = useState<"cat" | "not cat" | null>(null);

  const handleSelect = (label: "cat" | "not cat") => {
    setSelected(label);
    onSelect?.(label); // Optional: passes the selection up if a parent component wants it
  };

  // Styles for the Cat button
  const catStyles =
    selected === "cat"
      ? "bg-[#fff0e6] text-[#e8590c] border border-[#e8590c]"
      : "bg-[#f8f9fa] text-[#868e96] border border-[#dfe4ee]";

  // Styles for the Not cat button
  const notCatStyles =
    selected === "not cat"
      ? "bg-[#e6f6ea] text-[#2b8a3e] border border-[#e6f6ea]"
      : "bg-[#f8f9fa] text-[#868e96] border border-[#dfe4ee]";

  return (
    <div className="flex w-full gap-1.5 items-center justify-center">
      {/* Cat Button */}
      <button
        type="button"
        onClick={() => handleSelect("cat")}
        className={`py-[10px] px-[4px] w-full rounded-[12px] font-['Nunito'] font-bold text-[15px] transition-colors flex items-center justify-center cursor-pointer ${catStyles}`}
      >
        Cat
      </button>

      {/* Not Cat Button */}
      <button
        type="button"
        onClick={() => handleSelect("not cat")}
        className={`py-[10px] px-[4px] w-full rounded-[12px] font-['Nunito'] font-bold text-[15px] transition-colors flex items-center justify-center cursor-pointer ${notCatStyles}`}
      >
        Not cat
      </button>
    </div>
  );
}

