const { roundS } = require("./utils");


module.exports = {
  sampleIntegral,
  sampleLargeIntegral,
};

/**
 * Compute `x` coordinates at which to sample a function for the purpose of
 * integration. The `x` samples will be spaced by intervals of `stepSize` on
 * average with low variance. The `x` values are rounded to require a minimum
 * of significant bits.
 */
function computeGoodXSamples(x0, x1, stepSize) {
  stepSize = Math.abs(stepSize);
  const maxEpsilon = 2 ** Math.floor(Math.log2(stepSize))
  const minEpsilon = maxEpsilon / 1024;
  let reversed = false;
  if (x0 === x1) {
    // There's nothing practical to do for an empty interval :/
    return [x0];
  }
  if (x0 > x1) {
    reversed = true;
    const t = x0;
    x0 = x1;
    x1 = t;
  }
  let lastFront = roundS(minEpsilon, x0 + stepSize),
    lastBack = roundS(minEpsilon, x1 - stepSize),
    es = minEpsilon;
  const front = [x0, lastFront];
  const back = [x1, lastBack];

  while (lastFront < lastBack) {
    es = Math.min(maxEpsilon, 2 * es);
    lastFront = roundS(es, lastFront + stepSize);
    lastBack = roundS(es, lastBack - stepSize);
    front.push(lastFront);
    back.push(lastBack);
  }

  while (lastFront >= lastBack) {
    back.pop();
    lastBack = back[back.length - 1];
    if (lastFront < lastBack) break;
    front.pop();
    lastFront = front[front.length - 1]
  }
  const xs = front.concat(back.reverse());
  return reversed ? xs.reverse() : xs;
}

/**
 * Integrate the function `f` over [`x0`, `x1`], with constant `y0`, using
 * the trapezoidal approximation. All sampled points are returned.
 */
function sampleIntegral(f, x0, y0, x1, stepSize = null) {
  const span = Math.abs(x1 - x0);
  if (span === 0) {
    return [{ x: x0, y: y0 }];
  }
  stepSize = stepSize ?? (2 ** -11);
  while (11 * stepSize > span) {
    stepSize *= 0.5;
  }
  const xs = computeGoodXSamples(x0, x1, stepSize);
  const n = xs.length;
  const samples = [{ x: x0, y: y0 }];
  let ya = y0, dya = f(xs[0]);
  for (let j = 1; j < n; j++) {
    const dyb = f(xs[j]);
    const da = 0.5 * (dya + dyb) * (xs[j] - xs[j - 1]);
    dya = dyb;
    ya += da;
    samples.push({ x: xs[j], y: ya });
  }
  return samples;
}

/**
 * Integrate the function `f` over `batchSize` sized slices of the x axis.
 * By working in batches, we increase precision, by keep values closer to zero
 * until the final summation. All sampled points are returned.
 */
function sampleLargeIntegral(
  f, x0, y0, x1, stepSize = null, batchSize = null
) {
  batchSize = batchSize ?? 1;
  const span = Math.abs(x1 - x0);
  const nBatches = Math.ceil(span / batchSize);
  const xs = Array.from(
    { length: nBatches + 1 },
    (_, i) => x0 + (x1 - x0) * i / nBatches,
  );
  const sampleBatches = new Array(nBatches);
  for (let j = 1; j <= nBatches; j++) {
    sampleBatches[j - 1] = sampleIntegral(
      f, xs[j - 1], 0, xs[j], stepSize,
    );
  }

  for (let i = nBatches - 1; i >= 0; i--) {
    const iBatch = sampleBatches[i]
    const iBatchN = iBatch.length;
    let yy = y0;
    for (let j = 0; j < i; j++) {
      const jBatch = sampleBatches[j]
      const jBatchN = jBatch.length;
      yy += jBatch[jBatchN - 1].y;
    }
    for (let k = 0; k < iBatchN; k++) {
      iBatch[k].y += yy;
    }
  }
  return [].concat(...sampleBatches).filter(
    (s, i, a) => i === 0 || s.x > a[i - 1].x
  );
}

