import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWeddingBeverages,
  formatShoppingList,
  validateCalculatorInput,
} from '../src/calculator.js';

const validInput = {
  totalGuests: 120,
  adults: 100,
  children: 20,
  nonDrinkers: 20,
  durationHours: 5,
  drinkingLevel: 'average',
  mix: { beer: 40, wine: 35, spirits: 15, champagne: 10 },
  includeWater: true,
  includeSoftDrinks: true,
  waterServingsPerGuest: 1,
  softDrinkServingsPerGuest: 0.5,
  safetyBufferPercent: 10,
  packageYields: { beer: 24, wine: 5, spirits: 16, champagne: 7, water: 24, softDrinks: 8 },
  prices: { beer: 32, wine: 14, spirits: 28, champagne: 18, water: 7, softDrinks: 5 },
};

test('accepts a complete valid configuration', () => {
  assert.deepEqual(validateCalculatorInput(validInput), []);
});

test('returns friendly validation messages for inconsistent guests and drink mix', () => {
  const errors = validateCalculatorInput({
    ...validInput,
    adults: 110,
    children: 20,
    nonDrinkers: 111,
    mix: { beer: 40, wine: 35, spirits: 15, champagne: 5 },
  });

  assert.ok(errors.includes('Adults and children must add up to the total guest count.'));
  assert.ok(errors.includes('Non-drinkers cannot exceed the number of adults.'));
  assert.ok(errors.includes('Beverage mix percentages must total 100%.'));
});

test('calculates average drinking servings using the first-hour rule', () => {
  const result = calculateWeddingBeverages(validInput);
  assert.equal(result.drinkingGuests, 80);
  assert.equal(result.alcoholicServings, 480);
  assert.equal(result.bufferedAlcoholicServings, 528);
});

test('splits buffered servings and rounds package quantities up', () => {
  const result = calculateWeddingBeverages(validInput);
  assert.deepEqual(
    { servings: result.items.beer.servings, packages: result.items.beer.packages, unitLabel: result.items.beer.unitLabel },
    { servings: 212, packages: 9, unitLabel: 'cases of 24' },
  );
  assert.deepEqual(
    { servings: result.items.wine.servings, packages: result.items.wine.packages, unitLabel: result.items.wine.unitLabel },
    { servings: 185, packages: 37, unitLabel: 'bottles' },
  );
  assert.equal(result.items.spirits.packages, 5);
  assert.equal(result.items.champagne.packages, 8);
});

test('calculates optional non-alcoholic drinks and total budget', () => {
  const result = calculateWeddingBeverages(validInput);
  assert.equal(result.nonAlcoholicServings, 198);
  assert.equal(result.items.water.packages, 6);
  assert.equal(result.items.softDrinks.packages, 9);
  assert.equal(result.estimatedBudget, 1177);
});

test('throws a validation error instead of calculating invalid input', () => {
  assert.throws(
    () => calculateWeddingBeverages({ ...validInput, mix: { beer: 100, wine: 10, spirits: 0, champagne: 0 } }),
    /Beverage mix percentages must total 100%\./,
  );
});

test('returns a copy-ready shopping list with totals', () => {
  const text = formatShoppingList(calculateWeddingBeverages(validInput));
  assert.match(text, /Wedding Beverage Shopping List/);
  assert.match(text, /Beer: 9 cases of 24/);
  assert.match(text, /Estimated budget: \$1,177/);
});
