import React from "react";

interface MainButton {
  label?: string;
}

const MainButton = () => {
  return (
    <button className="px-6 py-3.5 rounded-[14px] bg-[#3b5bdb] font-['Nunito'] font-bold text-[17px] text-white flex items-center justify-center border border-transparent">
      Next:Label photos
    </button>
  );
};

export default MainButton;
