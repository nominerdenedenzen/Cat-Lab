import * as tf from "@tensorflow/tfjs";

// Every photo is shrunk to 64 x 64 before the model sees it
export const SIZE = 64;

// URL -> <img> element
export const loadImage = async (url: string) => {
  const img = new Image();
  img.crossOrigin = "anonymous"; // without this, TensorFlow is not allowed to read the pixels
  img.src = url;
  await img.decode(); // wait until the image has finished loading
  return img;
};

// <img> -> tensor of shape [64, 64, 3] with values from 0 to 1
export const toNumbers = (img: HTMLImageElement) =>
  tf.tidy(() =>
    tf.browser
      .fromPixels(img) // photo -> numbers from 0 to 255
      .resizeBilinear([SIZE, SIZE]) // shrink to 64 x 64
      .toFloat()
      .div(255), // 0-255 becomes 0-1
  );
