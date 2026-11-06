"use client";

import { useRef } from "react";

type UploadBoxProps = {
  onFilesSelected: (files: File[]) => void;
  uploading?: boolean;
};

export const UploadBox = ({ onFilesSelected, uploading = false }: UploadBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) onFilesSelected(files);
    event.target.value = "";
  };

  return (
    <div
      onClick={handleClick}
      className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-8 py-10 hover:bg-gray-100"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      <span className="text-3xl">📷</span>
      <h2 className="text-base font-semibold text-gray-900">
        {uploading ? "Uploading..." : "Click to choose photos"}
      </h2>
      <p className="text-sm text-gray-500">You can pick many photos at once</p>
    </div>
  );
};

export default UploadBox;
