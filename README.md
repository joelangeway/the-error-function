# The Error Function

A public resource for higher resolution and more comprehensive samples of The Error Function, `erf(x)`, [the table](output/erf.md).

## Why do we care about The Error Function?

The error function is a sigmoid function closely related to many curves that show up frequently in probability, statistics, partial differential equations, and other technical fields. Perhaps most interestingly, it has a linear relationship to the cumulative normal distribution function:

```
  norm(x) = 0.5 * erf( -x / sqrt(2) )
```

Being able to compute the cumulative normal distribution function and its inverse quickly is essential to many machine learning systems. That's what brought me to this project, but then the challenge of producing correct values at the extremes became great fun.

## Why produce this table?

TL/DR: For fun!

The error function is a non-elementary integral. This makes it impractical to analytically compute particular values in high performance scenarios. For this reason, we'd like instead to make a practical approximation. There are series expansion, continued fraction, and alternating sum methods for this, but they all require complex, iterated computations. There are rational approximations that deliver practical precision. Without a source of truth at the extremes, however, we can't be sure any approximation is accurate enough at extremes, which come up a lot in machine learning systems. 

## How good is this table?

I tested all the values in the table where `x = k/10` for some integer `k` and all match Wolfram Alpha for at least 14 decimal digits, usually 15. Be sure to ask Wolfram Alpha for extra digits.

All the values in Table 7.1 of Handbook of Mathematical Functions¹ that also appear in our table match to the precision given in the book, but those values only go up to `erf(2)=0.9953222650`.

We match all the values in the table on Wikipedia's article about The Error Function.

The "shorter" numbers for `x` toward the end are the shortest rendering of a number for which `erf(x)` is the number in the second column due to numerical precision limits.

## What else is in the repository

In `integration.js` you'll find code for computing numerical integrals with better than naive precision. That was the main thing I needed to compute accurate values of the error function. In `erf.js` we generate a huge lookup table to support a very high resolution approximation of the error function. In `write-tables.js` we format and output tables. You'll find no dependencies nor even a `package.json` file. I don't want the reader to have to go anywhere else to figure out how this code works, except maybe a math book.

Please, feel free to copy whatever you like from this repository.
