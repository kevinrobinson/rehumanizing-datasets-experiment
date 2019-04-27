import * as tf from '@tensorflow/tfjs';

export async function createPredictor() {
  // load and warm up
  const model = await tf.loadGraphModel('./gender.json');
  await model.predict(tf.zeros([1, 64, 64, 1]));

  return predictGender.bind(null, model);
}

function predictGender(model, imageEl) {
  const imageTensor = preprocessImageEl(imageEl);
  const r = model.predict(imageTensor);
  const result = r.dataSync();
  const tresult = tf.tensor(result)
  const labelIndex = tf.argMax(tresult).dataSync()[0];
  const labelPercent = result[labelIndex].toFixed(4) * 100;

  return {
    labelIndex,
    labelPercent,
    result
  };
}

function preprocessImageEl(imageEl) {
  const img = tf.browser.fromPixels(imageEl, 1).toFloat()
  const offset = tf.scalar(255);
  const x1 = tf.scalar(0.5);
  const x2 = tf.scalar(2);
  const normalized = img.div(offset).sub(x1).mul(x2);
  const batched = normalized.reshape([1, 64, 64, 1]);

  return batched;
}
