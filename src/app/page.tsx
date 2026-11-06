"use client";

import { useState } from "react";
import type { LayersModel } from "@tensorflow/tfjs";
import StepBar from "./_component/StepBar";
import UploadBox from "./_component/UploadBox";
import { CountPill } from "./_component/CountPill";
import { LabelButton } from "./_component/LabelButton";
import { PhotoTile, ProgressBar, AccuracyChart } from "./_component";
import RoundCounter from "./_component/RoundCounter";
import { trainModel, predictFile } from "./_lib/dogModel";

const steps = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Label" },
  { id: 3, label: "Train" },
  { id: 4, label: "Test" },
];

const TOTAL_ROUNDS = 10;

type Photo = {
  id: string;
  storagePath: string;
  label: "DOG" | "NOT_DOG" | null;
  ground: "training" | "testing" | null;
  url: string;
};

const App = () => {
  // ===== STATE: which step we are on (1, 2, 3 or 4) =====
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  // Step 2 state — the photos loaded from Supabase/Prisma
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Step 3 state — training progress
  const [training, setTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState("");
  const [round, setRound] = useState(0);
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [model, setModel] = useState<LayersModel | null>(null);

  // Step 4 state — the test photo and the model's guess
  const [testPreview, setTestPreview] = useState<string | null>(null);
  const [dogChance, setDogChance] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);

  // ===== HANDLE FILE UPLOAD TO SUPABASE VIA API =====
  const handleFilesSelected = async (files: File[]) => {
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to upload ${file.name}: ${body.error ?? response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("Photo uploaded successfully:", data);
      }
      alert("All photos uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Error uploading photos.");
    } finally {
      setUploading(false);
    }
  };

  // Load all photos from the database
  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const response = await fetch("/api/photos");
      if (!response.ok) throw new Error("Could not load photos");
      const data: Photo[] = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error(error);
      alert("Error loading photos.");
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Save a label when you click "Dog" / "Not dog"
  const handleLabel = async (photo: Photo, choice: "dog" | "not dog") => {
    const label = choice === "dog" ? "DOG" : "NOT_DOG";
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, label } : p)),
    );
    try {
      const response = await fetch(`/api/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!response.ok) throw new Error("Could not save label");
    } catch (error) {
      console.error(error);
      alert("Error saving label.");
      await loadPhotos();
    }
  };

  // Train the model on every labeled photo
  const handleTrain = async () => {
    const examples = photos
      .filter((p) => p.label !== null && p.ground !== "testing")
      .map((p) => ({ url: p.url, label: p.label as "DOG" | "NOT_DOG" }));

    const dogs = examples.filter((e) => e.label === "DOG").length;
    const notDogs = examples.length - dogs;
    if (dogs === 0 || notDogs === 0) {
      alert("Label at least one Dog AND one Not dog photo first (Step 2).");
      return;
    }

    setTraining(true);
    setRound(0);
    setAccuracies([]);
    setModel(null);
    try {
      const trained = await trainModel(
        examples,
        TOTAL_ROUNDS,
        (message) => setTrainStatus(message),
        (roundNumber, accuracy) => {
          setRound(roundNumber);
          setAccuracies((prev) => [...prev, accuracy]);
        },
      );
      setModel(trained);
    } catch (error) {
      console.error(error);
      setTrainStatus("");
      alert("Error while training. Check the console for details.");
    } finally {
      setTraining(false);
    }
  };

  // Ask the trained model about a new photo
  const handleTestFiles = async (files: File[]) => {
    if (!model) return;
    const file = files[0];
    if (testPreview) URL.revokeObjectURL(testPreview);
    setTestPreview(URL.createObjectURL(file));
    setDogChance(null);
    setTesting(true);
    try {
      const chance = await predictFile(model, file);
      setDogChance(chance);
    } catch (error) {
      console.error(error);
      alert("Error testing photo.");
    } finally {
      setTesting(false);
    }
  };

  // GO TO NEXT STEP
  const handleNext = async () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep === 2) await loadPhotos();
    }
  };

  // GO BACK ONE STEP
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const dogCount = photos.filter((p) => p.label === "DOG").length;
  const notDogCount = photos.filter((p) => p.label === "NOT_DOG").length;

  return (
    <div className="bg-[#f8f9fa] min-h-screen w-screen flex items-center justify-center p-8">
      <div className="bg-white max-w-[860px] w-full p-8 border rounded-[16px] border-[#dfe4ee] shadow-sm flex flex-col gap-6">
        {/* ===== STEP BAR (top) ===== */}
        <div className="flex items-center gap-6">
          {steps.map((step) => (
            <StepBar key={step.id} number={step.id} label={step.label} />
          ))}
        </div>

        {/* ===== STEP 1: UPLOAD ===== */}
        {currentStep === 1 && (
          <div className="p-7 border rounded-[16px] border-[#dfe4ee] text-black flex flex-col gap-[20px]">
            <h2 className="font-['Nunito'] font-bold text-[22px]">
              Step 1: Add your photos
            </h2>
            <UploadBox
              onFilesSelected={handleFilesSelected}
              uploading={uploading}
            />
            {uploading && (
              <p className="text-sm text-[#3b5bdb]">
                Uploading photos to Supabase...
              </p>
            )}
          </div>
        )}

        {/* ===== STEP 2: LABEL ===== */}
        {currentStep === 2 && (
          <div className="p-7 border rounded-[16px] border-[#dfe4ee] flex flex-col gap-[20px]">
            <h2 className="font-['Nunito'] font-bold text-black text-[22px]">
              Step 2: Label
            </h2>

            <div className="flex gap-2">
              <CountPill type="dog" label={`${dogCount} dogs`} />
              <CountPill type="not dog" label={`${notDogCount} not dogs`} />
            </div>

            {loadingPhotos && (
              <p className="text-[#868e96]">Loading photos...</p>
            )}
            {!loadingPhotos && photos.length === 0 && (
              <p className="text-[#868e96]">
                No photos yet — go back and upload some.
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="flex flex-col gap-2">
                  <PhotoTile url={photo.url} />
                  <LabelButton
                    value={
                      photo.label === "DOG"
                        ? "dog"
                        : photo.label === "NOT_DOG"
                          ? "not dog"
                          : null
                    }
                    onSelect={(choice) => handleLabel(photo, choice)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== STEP 3: TRAIN ===== */}
        {currentStep === 3 && (
          <div className="p-7 border text-black rounded-[16px] border-[#dfe4ee] flex flex-col gap-[20px]">
            <h2 className="font-['Nunito'] font-bold text-[22px]">
              Step 3: Train
            </h2>
            <p className="text-[#868e96]">
              Train your model on {dogCount + notDogCount} labeled photos.
            </p>
            <RoundCounter current={round} total={TOTAL_ROUNDS} />
            <ProgressBar current={round} total={TOTAL_ROUNDS} />
            {trainStatus && (
              <p className="text-sm text-[#3b5bdb]">{trainStatus}</p>
            )}
            <button
              onClick={handleTrain}
              disabled={training}
              className="self-start px-6 py-3.5 rounded-[14px] bg-[#3b5bdb] font-['Nunito'] font-bold text-[17px] text-white disabled:opacity-40">
              {training
                ? "Training..."
                : model
                  ? "Train again"
                  : "Start training"}
            </button>
            <AccuracyChart accuracies={accuracies} />
          </div>
        )}

        {/* ===== STEP 4: TEST ===== */}
        {currentStep === 4 && (
          <div className="p-7 border text-black rounded-[16px] border-[#dfe4ee] flex flex-col gap-[20px]">
            <h2 className="font-['Nunito'] font-bold text-[22px]">
              Step 4: Test
            </h2>
            <p className="text-[#868e96]">Test your model with a new photo.</p>
            {!model ? (
              <p className="text-[#e8590c]">
                Train your model in Step 3 first.
              </p>
            ) : (
              <>
                <UploadBox
                  onFilesSelected={handleTestFiles}
                  uploading={testing}
                />
                {testPreview && (
                  <div className="flex items-center gap-6">
                    <div className="w-40">
                      <PhotoTile url={testPreview} alt="test photo" />
                    </div>
                    {dogChance !== null && (
                      <div className="font-['Nunito']">
                        <div className="text-[28px] font-bold">
                          {dogChance >= 0.5 ? "🐶 Dog!" : "🚫 Not a dog"}
                        </div>
                        <div className="text-[#868e96]">
                          {Math.round(
                            (dogChance >= 0.5 ? dogChance : 1 - dogChance) *
                              100,
                          )}
                          % sure
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===== BUTTONS (bottom) ===== */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3.5 rounded-[14px] border border-[#dfe4ee] font-['Nunito'] font-bold text-[17px] text-[#495057] disabled:opacity-40">
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="px-6 py-3.5 rounded-[14px] bg-[#3b5bdb] font-['Nunito'] font-bold text-[17px] text-white disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
