"use client";

import { useState } from "react";
import StepBar from "./_component/StepBar";
import UploadBox from "./_component/UploadBox"; // Make sure to import your UploadBox component
import { CountPill } from "./_component/CountPill";
import { LabelButton } from "./_component/LabelButton";
import { PhotoTile, ProgressBar } from "./_component";
import RoundCounter from "./_component/RoundCounter";

const steps = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Label" },
  { id: 3, label: "Train" },
  { id: 4, label: "Test" },
];

const App = () => {
  // ===== STATE: which step we are on (1, 2, 3 or 4) =====
  const [currentStep, setCurrentStep] = useState(1);

  // ===== GO TO NEXT STEP =====
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // ===== GO BACK ONE STEP =====
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
            <UploadBox />
          </div>
        )}

        {/* ===== STEP 2: LABEL ===== */}
        {currentStep === 2 && (
          <div className="p-7 border rounded-[16px] border-[#dfe4ee] flex flex-col gap-[20px]">
            <h2 className="font-['Nunito'] font-bold text-black text-[22px]">
              Step 2: Label
            </h2>

            <CountPill />
            <div className="flex flex-col gap-2 max-w-xs">
              <PhotoTile />
              <LabelButton />
            </div>
          </div>
        )}

        {/* ===== STEP 3: TRAIN ===== */}
        {currentStep === 3 && (
          <div className="p-7 border text-black rounded-[16px] border-[#dfe4ee] flex flex-col gap-[20px]">
            <h2 className="font-['Nunito'] font-bold text-[22px]">
              Step 3: Train
            </h2>
            <p className="text-[#868e96]">Train your model.</p>
            <RoundCounter />
            <ProgressBar />
          </div>
        )}

        {/* ===== STEP 4: TEST ===== */}
        {currentStep === 4 && (
          <div className="p-7 border rounded-[16px] border-[#dfe4ee] flex flex-col gap-[20px]">
            <h2 className="font-['Nunito'] font-bold text-[22px]">
              Step 4: Test
            </h2>
            <p className="text-[#868e96]">Test your model with a new photo.</p>
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
