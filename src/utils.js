
module.exports = {
  cmp,
  lerp,
  roundS,
  binarySearchMaxLE,
  smoothMonotonicSamples,
  niceNumber,
  niceSingleNumber,
};

function cmp(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

function lerp(x0, y0, x1, y1, x) {
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
}

/**
 * Round the value `x` to the nearest multiple of `s`.
 */
function roundS(s, x) {
  return s * Math.round(x / s);
}

function binarySearchMaxLE(array, cmpElToTarget) {
  const n = array.length
  let i = 0, j = n, c = 0;
  while (i + 1 < j) {
    const k = i + ((j - i) >> 1);
    c = cmpElToTarget(array[k]);
    if (c <= 0) {
      i = k;
    } else {
      j = k;
    }
  }
  return i;
}

function smoothMonotonicSamples(samplesIn) {
  const nIn = samplesIn.length;
  const samplesOut = [];
  for (let i = 0; i < nIn; i++) {
    let j = i + 1;
    while (j < nIn && samplesIn[j].y === samplesIn[i].y) j++;
    if (j > i + 1) {
      const x = +niceSingleNumber(samplesIn[i].x, samplesIn[j - 1].x)
      samplesOut.push({
        x,
        y: samplesIn[i].y,
      });
      i = j - 1;
      continue;
    }
    samplesOut.push(samplesIn[i]);
  }
  return samplesOut;
}

/**
 * Returns the string representation of a number with the fewest digits that
 * parses to the same value, fixing things like `0.3000000000000001` to `0.3`.
 */
function niceNumber(n) {
  const s = `${n}`;
  const m = +s;
  for (let i = 1; i < 16; i++) {
    const t = n.toFixed(i);
    if (+t === m) {
      return t;
    }
  }
  return s;
}

/**
 * Suppose numbers from 4.99 to 5.01 all return the same value from a function,
 * we'd like to simply write `5.0` in a table. This function computes that for
 * us.
 */
function niceSingleNumber(low, high) {
  const x = 0.5 * (low + high);
  for (let d = 0; d < 16; d++) {
    const s = x.toFixed(d);
    const y = +s;
    if (low <= y && y <= high) {
      return s;
    }
  }
  return `${x}`;
}
