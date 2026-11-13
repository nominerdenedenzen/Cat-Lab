"use client";

import * as tf from "@tensorflow/tfjs";
import { loadImage, toNumbers, SIZE } from "./_lib/imageToNumbers";
import RoundCounter from "./_component/RoundCounter";
import ProgressBar from "./_component/ProgressBar";
import AccuracyChart from "./_component/AccuracyChart";

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
  ground: "training" | "testing" | null;
};

const STEPS = ["Add photos", "Label", "Train", "Test"];
const MIN_PHOTOS = 4;

const App = () => {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState<SavedPhoto[]>([]);
  const [rounds, setRounds] = useState(10); // how many rounds the student picks
  const [round, setRound] = useState(0); // current round
  const [accuracies, setAccuracies] = useState<number[]>([]);
  const [status, setStatus] = useState("");
  const [training, setTraining] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);

  // Free the temporary URLs when the page closes
  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== STEP 3: TRAIN =====
  const train = async () => {
    setTraining(true);
    setRound(0);
    setAccuracies([]);

    // 1. Only labeled training photos (testing photos stay hidden → fair test)
    const examples = saved.filter(
      (p) => p.label !== null && (p.ground ?? "training") === "training",
    );

    // 2. Photos → numbers
    setStatus(`Loading ${examples.length} photos...`);
    const images = await Promise.all(examples.map((p) => loadImage(p.url)));

    // 3. Inputs (xs) and right answers (ys)
    const xs = tf.tidy(() => tf.stack(images.map(toNumbers))); // [n, 64, 64, 3]
    const ys = tf.tensor2d(
      examples.map((p) => (p.label === "DOG" ? 1 : 0)), // dog = 1, not dog = 0
      [examples.length, 1],
    );

    // 4. Build the model
    const model = tf.sequential();
    model.add(
      tf.layers.conv2d({
        inputShape: [SIZE, SIZE, 3],
        filters: 8, // 8 small pattern-finders
        kernelSize: 3, // each looks at a 3 x 3 patch
        activation: "relu",
      }),
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2 })); // halve the size
    model.add(tf.layers.flatten()); // grid → one long list
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" })); // → 0..1
    model.summary(); // console should say: Total params: 7,913

    // 5. Compile: how the model learns
    model.compile({
      optimizer: tf.train.adam(),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });

    // 6. Train: one epoch = one round = the model sees every photo once
    let lastAcc = 0;
    setStatus("Training...");
    await model.fit(xs, ys, {
      epochs: rounds,
      batchSize: 4,
      shuffle: true,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          lastAcc = logs?.acc ?? 0;
          setRound(epoch + 1);
          setAccuracies((prev) => [...prev, lastAcc]);
          await tf.nextFrame(); // let the screen update
        },
      },
    });

    // 7. Save the model in the browser and free memory
    await model.save("indexeddb://dog-model");
    xs.dispose();
    ys.dispose();

    // 8. Record this run in the database
    await fetch("/api/training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rounds, accuracy: lastAcc }),
    });

    setStatus(`Done! Accuracy ${Math.round(lastAcc * 100)}%`);
    setTraining(false);
  };

  // ===== STEP 4: TEST =====
  const testFile = async (files: File[]) => {
    const model = await tf.loadLayersModel("indexeddb://dog-model");
    const url = URL.createObjectURL(files[0]);
    const img = await loadImage(url);
    // expandDims(0): one photo [64,64,3] → a batch of one [1,64,64,3]
    const out = tf.tidy(
      () => model.predict(toNumbers(img).expandDims(0)) as tf.Tensor,
    );
    const [score] = await out.data();
    out.dispose();
    URL.revokeObjectURL(url);
    setPrediction(score); // > 0.5 means dog
  };

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
    // Upload each photo and remember the id the server gives back
    const newIds: string[] = [];
    for (const p of photos) {
      const fd = new FormData();
      fd.append("file", p.file);
      const res = await fetch("/api/photos", { method: "POST", body: fd });
      if (res.ok) newIds.push((await res.json()).id);
    }
    // The server returns ALL photos ever uploaded → keep only this time's
    const res = await fetch("/api/photos");
    const all: SavedPhoto[] = await res.json();
    setSaved(all.filter((p) => newIds.includes(p.id)));
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
  // Training needs at least one example of each kind
  const hasBoth =
    saved.some((p) => p.label === "DOG") &&
    saved.some((p) => p.label === "NOT_DOG");

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
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-[15px] ${active ? "font-bold text-[#212529]" : "text-[#868e96]"}`}
                  >
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
                      className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[15px] font-bold text-[#5d6779] opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    >
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
        {/* Step 3 card */}
        {step === 3 && (
          <div className="flex flex-col gap-5 rounded-[16px] border border-[#dfe4ee] bg-white p-7">
            <h2 className="text-[22px] font-bold text-[#212529]">
              Step 3: Train
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-[15px] text-[#5d6779]">Rounds:</span>
              <span
                onClick={() => !training && setRounds((r) => Math.max(1, r - 1))}
                className="cursor-pointer rounded-full border border-[#dfe4ee] px-3 py-1 font-bold"
              >
                −
              </span>
              <span className="w-8 text-center font-bold">{rounds}</span>
              <span
                onClick={() => !training && setRounds((r) => Math.min(50, r + 1))}
                className="cursor-pointer rounded-full border border-[#dfe4ee] px-3 py-1 font-bold"
              >
                +
              </span>
            </div>

            <RoundCounter current={round} total={rounds} />
            <ProgressBar current={round} total={rounds} />
            <AccuracyChart accuracies={accuracies} />
            <p className="text-[14px] text-[#868e96]">{status}</p>

            <MainButton
              label={training ? "Training..." : "Start training"}
              disabled={training || !hasBoth}
              onClick={train}
            />
            {round === rounds && !training && (
              <MainButton label="Next: Test" onClick={() => setStep(4)} />
            )}
          </div>
        )}
        {/* Step 4 card */}
        {step === 4 && (
          <div className="flex flex-col gap-5 rounded-[16px] border border-[#dfe4ee] bg-white p-7">
            <h2 className="text-[22px] font-bold text-[#212529]">
              Step 4: Test
            </h2>
            <p className="text-[15px] text-[#5d6779]">
              Pick a photo the model has never seen.
            </p>
            <UploadBox onFilesSelected={testFile} />
            {prediction !== null && (
              <p className="text-center text-[22px] font-bold text-[#212529]">
                {prediction > 0.5 ? "🐶 Dog" : "Not a dog"} (
                {Math.round(prediction * 100)}% dog)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
