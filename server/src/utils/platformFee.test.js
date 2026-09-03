const { calculatePlatformFee } = require('./platformFee');

describe('calculatePlatformFee', () => {
  test.each([
    [1999, 2000],
    [2000, 2000],
    [50000, 2500],
    [50001, 2500],
    [250000, 13000],
    [250001, 13000],
    [1000000, 54250],
    [1000001, 54250],
    [5000000, 284250],
    [5000001, 284250],
    [10000000, 584250]
  ])('calculates the versioned marginal fee for XAF %i', (gross, expected) => {
    expect(calculatePlatformFee(gross)).toMatchObject({
      grossAmount: gross,
      platformFee: expected,
      borneBy: 'seller',
      version: 'marginal-xaf-v1'
    });
  });
});
