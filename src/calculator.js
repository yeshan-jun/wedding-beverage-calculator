const DRINKING_RATES = {
  light: (hours) => hours * 0.75,
  average: (hours) => 2 + Math.max(0, hours - 1),
  heavy: (hours) => 2.5 + Math.max(0, hours - 1) * 1.25,
};

const ITEM_NAMES = {
  beer: 'Beer',
  wine: 'Wine',
  spirits: 'Spirits',
  champagne: 'Champagne',
  water: 'Water',
  softDrinks: 'Soft drinks',
};

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function packageLabel(type, packageYield) {
  if (type === 'beer' || type === 'water') {
    return `cases of ${packageYield}`;
  }
  if (type === 'softDrinks') {
    return `packs of ${packageYield}`;
  }
  return 'bottles';
}

function createItem(type, exactServings, packageYield, price) {
  const servings = Math.ceil(exactServings);
  const packages = exactServings > 0 ? Math.ceil(exactServings / packageYield) : 0;

  return {
    key: type,
    name: ITEM_NAMES[type],
    servings,
    packages,
    packageYield,
    unitLabel: packageLabel(type, packageYield),
    packagePrice: price,
    cost: packages * price,
  };
}

export function validateCalculatorInput(input) {
  const errors = [];

  if (!input || typeof input !== 'object') {
    return ['Enter your wedding details before calculating.'];
  }

  const guestFields = ['totalGuests', 'adults', 'children', 'nonDrinkers'];
  for (const field of guestFields) {
    if (!isFiniteNumber(input[field]) || input[field] < 0) {
      errors.push('Guest counts must be zero or greater.');
      break;
    }
  }

  if (isFiniteNumber(input.totalGuests) && input.totalGuests <= 0) {
    errors.push('Total guests must be greater than zero.');
  }

  if (
    isFiniteNumber(input.adults)
    && isFiniteNumber(input.children)
    && isFiniteNumber(input.totalGuests)
    && input.adults + input.children !== input.totalGuests
  ) {
    errors.push('Adults and children must add up to the total guest count.');
  }

  if (
    isFiniteNumber(input.nonDrinkers)
    && isFiniteNumber(input.adults)
    && input.nonDrinkers > input.adults
  ) {
    errors.push('Non-drinkers cannot exceed the number of adults.');
  }

  if (!isFiniteNumber(input.durationHours) || input.durationHours <= 0) {
    errors.push('Event duration must be greater than zero.');
  }

  if (!Object.hasOwn(DRINKING_RATES, input.drinkingLevel)) {
    errors.push('Choose a valid drinking level.');
  }

  const mix = input.mix ?? {};
  const mixKeys = ['beer', 'wine', 'spirits', 'champagne'];
  if (mixKeys.some((key) => !isFiniteNumber(mix[key]) || mix[key] < 0 || mix[key] > 100)) {
    errors.push('Each beverage percentage must be between 0% and 100%.');
  } else {
    const mixTotal = mixKeys.reduce((total, key) => total + mix[key], 0);
    if (Math.abs(mixTotal - 100) > 0.01) {
      errors.push('Beverage mix percentages must total 100%.');
    }
  }

  if (!isFiniteNumber(input.safetyBufferPercent) || input.safetyBufferPercent < 0 || input.safetyBufferPercent > 50) {
    errors.push('Safety buffer must be between 0% and 50%.');
  }

  if (!isFiniteNumber(input.waterServingsPerGuest) || input.waterServingsPerGuest < 0) {
    errors.push('Water servings per guest must be zero or greater.');
  }

  if (!isFiniteNumber(input.softDrinkServingsPerGuest) || input.softDrinkServingsPerGuest < 0) {
    errors.push('Soft drink servings per guest must be zero or greater.');
  }

  const packageYields = input.packageYields ?? {};
  if (['beer', 'wine', 'spirits', 'champagne', 'water', 'softDrinks'].some(
    (key) => !isFiniteNumber(packageYields[key]) || packageYields[key] <= 0,
  )) {
    errors.push('Package serving amounts must be greater than zero.');
  }

  const prices = input.prices ?? {};
  if (['beer', 'wine', 'spirits', 'champagne', 'water', 'softDrinks'].some(
    (key) => !isFiniteNumber(prices[key]) || prices[key] < 0,
  )) {
    errors.push('Package prices must be zero or greater.');
  }

  return [...new Set(errors)];
}

export function calculateWeddingBeverages(input) {
  const errors = validateCalculatorInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const drinkingGuests = Math.max(0, input.adults - input.nonDrinkers);
  const drinksPerGuest = DRINKING_RATES[input.drinkingLevel](input.durationHours);
  const alcoholicServings = Math.ceil(drinkingGuests * drinksPerGuest);
  const bufferFactor = 1 + input.safetyBufferPercent / 100;
  const bufferedAlcoholicServings = Math.ceil(alcoholicServings * bufferFactor);

  const items = {};
  for (const type of ['beer', 'wine', 'spirits', 'champagne']) {
    const exactServings = bufferedAlcoholicServings * (input.mix[type] / 100);
    items[type] = createItem(type, exactServings, input.packageYields[type], input.prices[type]);
  }

  const waterExact = input.includeWater
    ? input.totalGuests * input.waterServingsPerGuest * bufferFactor
    : 0;
  const softDrinksExact = input.includeSoftDrinks
    ? input.totalGuests * input.softDrinkServingsPerGuest * bufferFactor
    : 0;

  items.water = createItem('water', waterExact, input.packageYields.water, input.prices.water);
  items.softDrinks = createItem('softDrinks', softDrinksExact, input.packageYields.softDrinks, input.prices.softDrinks);

  const nonAlcoholicServings = items.water.servings + items.softDrinks.servings;
  const estimatedBudget = Object.values(items).reduce((total, item) => total + item.cost, 0);

  return {
    drinkingGuests,
    drinksPerGuest,
    alcoholicServings,
    bufferedAlcoholicServings,
    nonAlcoholicServings,
    safetyBufferPercent: input.safetyBufferPercent,
    estimatedBudget,
    items,
  };
}

export function formatShoppingList(result) {
  const lines = ['Wedding Beverage Shopping List', ''];

  for (const type of ['beer', 'wine', 'spirits', 'champagne', 'water', 'softDrinks']) {
    const item = result.items[type];
    if (item.packages > 0) {
      lines.push(`${item.name}: ${item.packages} ${item.unitLabel}`);
    }
  }

  lines.push('');
  lines.push(`Alcoholic servings: ${result.alcoholicServings.toLocaleString('en-US')}`);
  lines.push(`Non-alcoholic servings: ${result.nonAlcoholicServings.toLocaleString('en-US')}`);
  lines.push(`Safety buffer: ${result.safetyBufferPercent}%`);
  lines.push(`Estimated budget: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(result.estimatedBudget)}`);

  return lines.join('\n');
}
