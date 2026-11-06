"use client";

import { useRef, useState } from "react";

type UploadBoxProps = {
  onFilesSelected: (files: File[]) => void;
  uploading?: boolean;
};

export const UploadBox = ({
  onFilesSelected,
  uploading = false,
}: UploadBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pickImages = (list: FileList | null) => {
    const files = Array.from(list || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length > 0) onFilesSelected(files);
  };

  return (
    <div
      onClick={() => !uploading && fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        pickImages(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center gap-1 rounded-[16px] border-2 border-dashed px-8 py-10 font-['Nunito'] transition-colors ${
        dragging
          ? "border-[#3b5bdb] bg-[#edf2ff]"
          : "border-[#dfe4ee] bg-[#f8f9fa] hover:border-[#3b5bdb] hover:bg-[#edf2ff]"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          pickImages(e.target.files);
          e.target.value = "";
        }}
        accept="image/*"
        multiple
        className="hidden"
      />
      <span className="text-3xl">📷</span>
      <h2 className="text-[17px] font-bold text-[#212529]">
        {uploading ? "Uploading..." : "Click or drop photos here"}
      </h2>
      <p className="text-[14px] text-[#868e96]">
        You can pick many photos at once
      </p>
    </div>
  );
};

export default UploadBox;
