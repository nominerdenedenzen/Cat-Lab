import { UploadIcon } from "lucide-react";

export const UploadBox = () => {
  return (
    <div className="border-[3px] dashed border-[#dfe4ee] rounded-[16px] bg-[#fafbfc] px-9 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f1f3f5] transition-colors">
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
