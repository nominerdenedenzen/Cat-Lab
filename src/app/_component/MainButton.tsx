interface MainButtonProps {
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
}

// A <div> styled as a button (project rule: div / h1 / h2 / p / span only)
const MainButton = ({ label = "Next: Label photos", disabled = false, onClick }: MainButtonProps) => {
  return (
    <div
      role="button"
      onClick={() => !disabled && onClick?.()}
      className={`flex items-center justify-center rounded-[14px] px-6 py-3.5 font-['Nunito'] text-[17px] font-bold text-white transition-colors ${
        disabled ? "cursor-not-allowed bg-[#adb5bd]" : "cursor-pointer bg-[#3b5bdb] hover:bg-[#364fc7]"
      }`}
    >
      {label}
    </div>
  );
};

export default MainButton;
