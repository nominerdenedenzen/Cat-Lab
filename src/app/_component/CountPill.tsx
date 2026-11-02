interface CountPillProps {
  type: "cat" | "not cat";
  label: string;
}

export const CountPill = ({ type, label }: CountPillProps) => {
  // Select styles based on the type
  const variantStyles =
    type === "cat"
      ? "bg-[#fff0e6] text-[#e8590c]"
      : "bg-[#e6f6ea] text-[#2b8a3e]";

  return (
    <div
      className={`py-[6px] px-[14px] rounded-[999px] font-['Nunito'] font-bold text-[13px] inline-flex items-center ${variantStyles}`}
    >
      {label}
    </div>
  );
};

export default CountPill;
