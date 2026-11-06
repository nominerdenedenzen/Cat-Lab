"use client";

import { useEffect, useState } from "react";
import UploadBox from "./_component/UploadBox";

type Photo = {
  id: string;
  storagePath: string;
  url: string;
};

const App = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Load all photos saved in the database
  const loadPhotos = async () => {
    const response = await fetch("/api/photos");
    if (!response.ok) {
      setMessage("Could not load photos.");
      return;
    }
    setPhotos(await response.json());
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // Send each chosen file to /api/photos (Supabase + Prisma)
  const handleFilesSelected = async (files: File[]) => {
    setUploading(true);
    setMessage("");

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/photos", { method: "POST", body: formData });
      if (!response.ok) {
        setMessage(`Failed to upload ${file.name}.`);
        setUploading(false);
        return;
      }
    }

    await loadPhotos();
    setMessage(`${files.length} photo(s) uploaded!`);
    setUploading(false);
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-8">
      <div className="flex w-full max-w-3xl flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">🐱 Cat Lab</h1>
          <p className="text-gray-500">Upload your photos to get started.</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Step 1: Add your photos</h2>
          <UploadBox onFilesSelected={handleFilesSelected} uploading={uploading} />
          {message && <p className="text-sm text-blue-600">{message}</p>}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your photos</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
              {photos.length}
            </span>
          </div>

          {photos.length === 0 ? (
            <p className="text-gray-500">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-xl border border-gray-200 bg-gray-100 bg-cover bg-center"
                  style={{ backgroundImage: `url(${photo.url})` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
