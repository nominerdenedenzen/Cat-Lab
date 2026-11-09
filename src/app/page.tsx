"use client";

// STEP 1 ONLY: pick photos and preview them in the browser.
// No Prisma / Supabase yet — photos live in React state (lost on refresh).

import { useEffect, useState } from "react";
import UploadBox from "./_component/UploadBox";
import PhotoTile from "./_component/PhotoTile";
import MainButton from "./_component/MainButton";
import { LabelButton } from "./_component/LabelButton";

type LocalPhoto = {
  id: string;
  name: string;
  url: string;
  file: File;
};

type SavedPhoto = {
  id: string;
  url: string;
  label: "DOG" | "NOT_DOG" | null;
};

const STEPS = ["Add photos", "Label", "Train", "Test"];
const MIN_PHOTOS = 4;

const App = () => {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState<SavedPhoto[]>([]);

  // Free the temporary URLs when the page closes
  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesSelected = (files: File[]) => {
    const added = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos((prev) => [...prev, ...added]);
  };
  const goToLabel = async () => {
    for (const p of photos) {
      const fd = new FormData();
      fd.append("file", p.file);
      await fetch("/api/photos", { method: "POST", body: fd });
    }
    const res = await fetch("/api/photos");
    setSaved(await res.json());
    setStep(2);
  };

  const handleLabel = async (id: string, choice: "dog" | "not dog") => {
    const label = choice === "dog" ? "DOG" : "NOT_DOG";
    setSaved((prev) => prev.map((p) => (p.id === id ? { ...p, label } : p)));
    await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
  };

  const handleRemove = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const ready = photos.length >= MIN_PHOTOS;

  return (
    <div className="flex min-h-screen justify-center bg-[#f4f6fb] px-4 py-12 font-['Nunito']">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-['Fredoka'] text-[44px] font-semibold leading-none text-[#212529]">
            Cat Lab
          </h1>
          <p className="text-[17px] text-[#5d6779]">
            Teach a computer to tell dogs from everything else.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-start justify-between gap-2">
          {STEPS.map((label, i) => {
            const active = i === step - 1;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-[15px] font-bold ${
                      active
                        ? "border-[#3b5bdb] bg-[#3b5bdb] text-white"
                        : "border-[#dfe4ee] bg-white text-[#868e96]"
                    }`}>
                    {i + 1}
                  </span>
                  <span
                    className={`text-[15px] ${active ? "font-bold text-[#212529]" : "text-[#868e96]"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mb-7 h-[2px] flex-1 rounded bg-[#dfe4ee]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 card */}
        {step === 1 && (
          <div className="flex flex-col gap-5 rounded-[16px] border border-[#dfe4ee] bg-white p-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[22px] font-bold text-[#212529]">
                Step 1: Add your photos
              </h2>
              <p className="text-[15px] text-[#5d6779]">
                Add at least {MIN_PHOTOS} photos — some with dogs, some without.
              </p>
            </div>

            <UploadBox onFilesSelected={handleFilesSelected} />

            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-[#212529]">
                Your photos
              </h2>
              <span className="rounded-full bg-[#edf2ff] px-[14px] py-[6px] text-[13px] font-bold text-[#3b5bdb]">
                {photos.length} {photos.length === 1 ? "photo" : "photos"}
              </span>
            </div>

            {photos.length === 0 ? (
              <p className="py-6 text-center text-[15px] text-[#868e96]">
                No photos yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative">
                    <PhotoTile url={photo.url} alt={photo.name} />
                    <span
                      onClick={() => handleRemove(photo.id)}
                      title="Remove"
                      className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[15px] font-bold text-[#5d6779] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-[#dfe4ee] pt-5">
              <span className="text-[14px] text-[#868e96]">
                {ready
                  ? "Looks good!"
                  : `${MIN_PHOTOS - photos.length} more to go`}
              </span>
              <MainButton
                label="Next: Label photos"
                disabled={!ready}
                onClick={goToLabel}
              />
            </div>
          </div>
        )}
        {/* Step 2 card */}
        {step === 2 && (
          <div className="flex flex-col gap-5 rounded-[16px] border border-[#dfe4ee] bg-white p-7">
            <h2 className="text-[22px] font-bold text-[#212529]">
              Step 2: Label your photos
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {saved.map((p) => (
                <div key={p.id} className="flex flex-col gap-2">
                  <PhotoTile url={p.url} />
                  <LabelButton
                    value={
                      p.label === "DOG"
                        ? "dog"
                        : p.label === "NOT_DOG"
                          ? "not dog"
                          : null
                    }
                    onSelect={(choice) => handleLabel(p.id, choice)}
                  />
                </div>
              ))}
            </div>
            <MainButton
              label="Next: Train"
              disabled={saved.some((p) => p.label === null)}
              onClick={() => setStep(3)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
