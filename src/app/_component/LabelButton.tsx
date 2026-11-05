import React, { useState } from "react";

// 🟡 CHANGED (cat → dog): buttons now say "Dog" / "Not dog"
interface LabelButtonProps {
  onSelect?: (label: "dog" | "not dog") => void;
  // 🟡 CHANGED: the label already saved in the database, so the right
  // button is highlighted when you come back to Step 2
  value?: "dog" | "not dog" | null;
}

export const LabelButton = ({ onSelect, value = null }: LabelButtonProps) => {
  // Local state to track which button is currently selected
  // 🟡 CHANGED: starts from `value` instead of always `null`
  const [selected, setSelected] = useState<"dog" | "not dog" | null>(value);

  const handleSelect = (label: "dog" | "not dog") => {
    setSelected(label);
    onSelect?.(label); // Optional: passes the selection up if a parent component wants it
  };

  // Styles for the Dog button
  const dogStyles =
    selected === "dog"
      ? "bg-[#fff0e6] text-[#e8590c] border border-[#e8590c]"
      : "bg-[#f8f9fa] text-[#868e96] border border-[#dfe4ee]";

  // Styles for the Not dog button
  const notDogStyles =
    selected === "not dog"
      ? "bg-[#e6f6ea] text-[#2b8a3e] border border-[#e6f6ea]"
      : "bg-[#f8f9fa] text-[#868e96] border border-[#dfe4ee]";

  return (
    <div className="flex w-full gap-1.5 items-center justify-center">
      {/* Dog Button */}
      <button
        type="button"
        onClick={() => handleSelect("dog")}
        className={`py-[10px] px-[4px] w-full rounded-[12px] font-['Nunito'] font-bold text-[15px] transition-colors flex items-center justify-center cursor-pointer ${dogStyles}`}
      >
        Dog
      </button>

      {/* Not Dog Button */}
      <button
        type="button"
        onClick={() => handleSelect("not dog")}
        className={`py-[10px] px-[4px] w-full rounded-[12px] font-['Nunito'] font-bold text-[15px] transition-colors flex items-center justify-center cursor-pointer ${notDogStyles}`}
      >
        Not dog
      </button>
    </div>
  );
}

