"use client";

// 🟡 CHANGED: removed `useState` and the `supabase` import.
// UploadBox runs in the BROWSER, and the browser must never see your secret
// SUPABASE_SERVICE_ROLE_KEY (it would also be `undefined` here and crash).
// The upload now happens on the server in src/app/api/photos/route.ts.
import React, { useRef } from "react";
import { UploadIcon, Loader2 } from "lucide-react";

// 🟡 CHANGED: the props now match what page.tsx actually passes:
// `onFilesSelected` (before it was `onPhotoUploaded`, which page.tsx never sent).
type UploadBoxProps = {
  onFilesSelected: (files: File[]) => void;
  uploading?: boolean; // page.tsx tells us when it is busy uploading
};

export const UploadBox = ({ onFilesSelected, uploading = false }: UploadBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    // 🟡 CHANGED: don't open the file picker again while an upload is running
    if (!uploading) fileInputRef.current?.click();
  };

  // 🟡 CHANGED: this is now very simple — it just hands the chosen files to page.tsx.
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) onFilesSelected(files);

    // Reset input so the same file can be selected again if needed
    event.target.value = "";
  };

  return (
    <div
      onClick={handleClick}
      className="border-[3px] border-dashed border-[#dfe4ee] rounded-[16px] bg-[#fafbfc] px-9 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f1f3f5] transition-colors">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      <div className="w-12 h-12 rounded-full bg-[#e7ecfd] flex items-center justify-center mb-3">
        {uploading ? (
          <Loader2 className="text-[#3b5bdb] w-6 h-6 animate-spin" />
        ) : (
          <UploadIcon className="text-[#3b5bdb] w-6 h-6" />
        )}
      </div>
      <h3 className="font-['Nunito'] font-bold text-[15px] text-[#212529]">
        {uploading ? "Uploading to Supabase..." : "Click to choose photos"}
      </h3>
      <span className="font-['Nunito'] font-normal text-[13px] text-[#868e96] mt-1">
        You can pick many photos at once
      </span>
    </div>
  );
};

export default UploadBox;
