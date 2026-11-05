"use client";

import React, { useRef, useState } from "react";
import { UploadIcon, Loader2 } from "lucide-react";
import { supabase } from "../_lib/supabase";

export const UploadBox = ({ onPhotoUploaded }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const storagePath = `uploads/${fileName}`;

        // 1. Upload directly from UploadBox to Supabase Storage
        const { data, error } = await supabase.storage
          .from("photos")
          .upload(storagePath, file);

        if (error) {
          throw new Error(error.message);
        }

        // 2. Pass the resulting storage path up to the parent component
        if (onPhotoUploaded && data) {
          onPhotoUploaded(data.path);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading photo to Supabase.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      if (event.target) event.target.value = "";
    }
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
