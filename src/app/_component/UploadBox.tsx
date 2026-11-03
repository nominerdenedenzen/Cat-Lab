import React, { useRef } from "react";
import { UploadIcon } from "lucide-react";

export const UploadBox = ({ onFilesSelected }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="border-[3px] border-dashed border-[#dfe4ee] rounded-[16px] bg-[#fafbfc] px-9 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f1f3f5] transition-colors"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      <div className="w-12 h-12 rounded-full bg-[#e7ecfd] flex items-center justify-center mb-3">
        <UploadIcon className="text-[#3b5bdb] w-6 h-6" />
      </div>
      <h3 className="font-['Nunito'] font-bold text-[15px] text-[#212529]">
        Click to choose photos
      </h3>
      <span className="font-['Nunito'] font-normal text-[13px] text-[#868e96] mt-1">
        You can pick many photos at once
      </span>
    </div>
  );
};

export default UploadBox;
