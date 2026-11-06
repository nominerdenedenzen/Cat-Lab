import type { LayersModel, Tensor } from "@tensorflow/tfjs";
import type { MobileNet } from "@tensorflow-models/mobilenet";

export type TrainingExample = {
  url: string; // public Supabase URL of the photo
  label: "DOG" | "NOT_DOG";
};

let mobileNet: MobileNet | null = null;

async function getTf() {
  const tf = await import("@tensorflow/tfjs");
  await tf.ready();
  return tf;
}

// Load MobileNet (about 15 MB, downloaded the first time only)
async function getMobileNet() {
  if (!mobileNet) {
    await getTf();
    const mobilenet = await import("@tensorflow-models/mobilenet");
    mobileNet = await mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return mobileNet;
}

// Turn a URL into an <img> the model can read
async function loadImage(url: string) {
  const img = new Image();
  img.crossOrigin = "anonymous"; // needed so TensorFlow may read pixels from Supabase
  img.src = url;
  await img.decode(); // waits until the image has finished loading
  return img;
}

// Ask MobileNet for the "features" of one image → tensor of shape [1, 1280]
async function getFeatures(img: HTMLImageElement) {
  const tf = await getTf();
  const net = await getMobileNet();
  return tf.tidy(() => net.infer(img, true)); // true = give features, not a guess
}

// ===== TRAIN =====
// `onStatus` lets the page show text, `onRound` is called after every round
// with the accuracy (0 → 1) so the page can update the counter/bar/chart.
export async function trainModel(
  examples: TrainingExample[],
  totalRounds: number,
  onStatus: (message: string) => void,
  onRound: (round: number, accuracy: number) => void,
): Promise<LayersModel> {
  const tf = await getTf();

  onStatus("Loading MobileNet (first time can take a moment)...");
  await getMobileNet();

  // 1. Turn every photo into features
  const featureList = [];
  const labels: number[] = [];
  for (let i = 0; i < examples.length; i++) {
    onStatus(`Looking at photo ${i + 1} of ${examples.length}...`);
    const img = await loadImage(examples[i].url);
    featureList.push(await getFeatures(img));
    labels.push(examples[i].label === "DOG" ? 1 : 0); // dog = 1, not dog = 0
  }

  const xs = tf.concat(featureList); // all photos stacked: [numPhotos, 1280]
  featureList.forEach((t) => t.dispose()); // free memory
  const ys = tf.tensor2d(labels, [labels.length, 1]); // the right answers

  // 2. Our tiny model: 1280 numbers in → 1 number out (chance it's a dog)
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [xs.shape[1]!],
        units: 64,
        activation: "relu",
      }),
      tf.layers.dense({ units: 1, activation: "sigmoid" }),
    ],
  });
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  // 3. Train! One "epoch" = one round = the model sees every photo once
  onStatus("Training...");
  await model.fit(xs, ys, {
    epochs: totalRounds,
    batchSize: 4,
    shuffle: true,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        onRound(epoch + 1, logs?.acc ?? logs?.accuracy ?? 0);
        await tf.nextFrame(); // let the browser repaint the progress bar
      },
    },
  });

  xs.dispose();
  ys.dispose();
  onStatus("Done!");
  return model;
}

// ===== TEST =====
// Returns a number from 0 to 1: how sure the model is that it's a dog
export async function predictFile(model: LayersModel, file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const features = await getFeatures(img);
    const output = model.predict(features) as Tensor;
    const [dogChance] = await output.data(); // `await` instead of dataSync()
    features.dispose();
    output.dispose();
    return dogChance;
  } finally {
    URL.revokeObjectURL(url);
  }
}
