const { sampleLargeIntegral } = require('./integration');
const { cmp, lerp, smoothMonotonicSamples, binarySearchMaxLE } = require('./utils');

module.exports = {
  erf, invErf
};

Math.SQRT_PI = Math.sqrt(Math.PI);

function dErf(x) {
  return 2 * Math.exp(-x * x) / Math.SQRT_PI;
}

function computeErfSamples() {
  const samples = sampleLargeIntegral(
    dErf, 0, 0, 6.25, 2 ** -17, 1 / 32,
  );
  const firstOne = samples.findIndex(({ y }) => y >= 1.0);
  return firstOne > 0 ? samples.slice(0, firstOne + 1) : samples;
}


var _erfSamples = null;
function getErfSamples() {
  if (!_erfSamples) {
    _erfSamples = smoothMonotonicSamples(computeErfSamples());
  }
  return _erfSamples;
}

function erf(x) {
  const samples = getErfSamples();
  const n = samples.length;
  if (x < 0) {
    return -erf(-x);
  }
  if (x >= samples[n - 1].x) {
    return samples[n - 1].y;
  }
  const i = Math.min(n - 2, binarySearchMaxLE(samples, s => cmp(s.x, x)));
  return Math.max(0, Math.min(1, lerp(
    samples[i].x, samples[i].y,
    samples[i + 1].x, samples[i + 1].y,
    x
  )));
}

function invErf(y) {
  const samples = getErfSamples();
  const n = samples.length;
  if (y < 0) {
    return -invErf(-y);
  }
  if (y >= samples[n - 1].y) {
    return samples[n - 1].x;
  }
  let i = 0, j = n;
  while (i + 1 < j) {
    const k = i + ((j - i) >> 1);
    const ky = samples[k].y;
    if (ky <= y) {
      i = k;
    } else {
      j = k;
    }
  }
  if (i >= n - 2) {
    i = n - 2;
  }
  return lerp(
    samples[i].y, samples[i].x,
    samples[i + 1].y, samples[i + 1].x,
    y
  );
}

