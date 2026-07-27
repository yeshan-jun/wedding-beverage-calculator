import {
  calculateWeddingBeverages,
  formatShoppingList,
  validateCalculatorInput,
} from './calculator.js';

const form = document.querySelector('#calculatorForm');
const validationPanel = document.querySelector('#validationPanel');
const actionStatus = document.querySelector('#actionStatus');
const mixKeys = ['beer', 'wine', 'spirits', 'champagne'];
const itemKeys = ['beer', 'wine', 'spirits', 'champagne', 'water', 'softDrinks'];
const STORAGE_KEY = 'wedding-beverage-calculator-settings-v1';
let latestResult = null;

function numberValue(id) {
  return Number(document.querySelector(`#${id}`).value);
}

function collectInput() {
  const drinkingLevel = form.querySelector('input[name="drinkingLevel"]:checked')?.value ?? 'average';

  return {
    totalGuests: numberValue('totalGuests'),
    adults: numberValue('adults'),
    children: numberValue('children'),
    nonDrinkers: numberValue('nonDrinkers'),
    durationHours: numberValue('durationHours'),
    drinkingLevel,
    mix: {
      beer: numberValue('beerPercent'),
      wine: numberValue('winePercent'),
      spirits: numberValue('spiritsPercent'),
      champagne: numberValue('champagnePercent'),
    },
    includeWater: document.querySelector('#includeWater').checked,
    includeSoftDrinks: document.querySelector('#includeSoftDrinks').checked,
    waterServingsPerGuest: numberValue('waterServingsPerGuest'),
    softDrinkServingsPerGuest: numberValue('softDrinkServingsPerGuest'),
    safetyBufferPercent: numberValue('safetyBufferPercent'),
    packageYields: {
      beer: numberValue('beerYield'),
      wine: numberValue('wineYield'),
      spirits: numberValue('spiritsYield'),
      champagne: numberValue('champagneYield'),
      water: numberValue('waterYield'),
      softDrinks: numberValue('softDrinksYield'),
    },
    prices: {
      beer: numberValue('beerPrice'),
      wine: numberValue('winePrice'),
      spirits: numberValue('spiritsPrice'),
      champagne: numberValue('champagnePrice'),
      water: numberValue('waterPrice'),
      softDrinks: numberValue('softDrinksPrice'),
    },
  };
}

function updateRangeVisual(input) {
  const progress = ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
  input.style.setProperty('--range-progress', `${progress}%`);
  const output = document.querySelector(`#${input.id}Output`);
  if (output) output.textContent = `${input.value}%`;
}

function updateMixTotal() {
  const total = mixKeys.reduce((sum, key) => sum + numberValue(`${key}Percent`), 0);
  const output = document.querySelector('#mixTotal');
  output.textContent = `Total: ${total}%`;
  output.classList.toggle('is-invalid', total !== 100);
}

function showErrors(errors) {
  if (errors.length === 0) {
    validationPanel.hidden = true;
    validationPanel.replaceChildren();
    return;
  }

  const list = document.createElement('ul');
  for (const error of errors) {
    const item = document.createElement('li');
    item.textContent = error;
    list.append(item);
  }

  validationPanel.replaceChildren(list);
  validationPanel.hidden = false;
  validationPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderResult(result) {
  latestResult = result;

  for (const key of itemKeys) {
    const item = result.items[key];
    const row = document.querySelector(`[data-item="${key}"]`);
    row.hidden = item.packages === 0;
    row.querySelector('[data-quantity]').textContent = `${item.packages.toLocaleString('en-US')} ${item.unitLabel}`;
  }

  document.querySelector('#alcoholicServings').textContent = result.alcoholicServings.toLocaleString('en-US');
  document.querySelector('#nonAlcoholicServings').textContent = result.nonAlcoholicServings.toLocaleString('en-US');
  document.querySelector('#estimatedBudget').textContent = formatMoney(result.estimatedBudget);

  const note = document.querySelector('#calculationNote p');
  note.textContent = `${result.drinkingGuests} drinking guests × ${result.drinksPerGuest.toFixed(2).replace(/\.00$/, '')} drinks each = ${result.alcoholicServings.toLocaleString('en-US')} alcoholic servings, plus a ${result.safetyBufferPercent}% shopping buffer.`;
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectInput()));
  } catch {
    // Storage is an enhancement; calculation continues when storage is blocked.
  }
}

function restoreSettings() {
  let settings;
  try {
    settings = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return;
  }
  if (!settings) return;

  const simpleFields = {
    totalGuests: settings.totalGuests,
    adults: settings.adults,
    children: settings.children,
    nonDrinkers: settings.nonDrinkers,
    durationHours: settings.durationHours,
    safetyBufferPercent: settings.safetyBufferPercent,
    waterServingsPerGuest: settings.waterServingsPerGuest,
    softDrinkServingsPerGuest: settings.softDrinkServingsPerGuest,
  };

  for (const [id, value] of Object.entries(simpleFields)) {
    const element = document.querySelector(`#${id}`);
    if (element && value !== undefined) element.value = value;
  }

  for (const key of mixKeys) {
    const element = document.querySelector(`#${key}Percent`);
    if (element && settings.mix?.[key] !== undefined) element.value = settings.mix[key];
  }

  for (const key of itemKeys) {
    const priceId = key === 'softDrinks' ? 'softDrinksPrice' : `${key}Price`;
    const yieldId = key === 'softDrinks' ? 'softDrinksYield' : `${key}Yield`;
    if (settings.prices?.[key] !== undefined) document.querySelector(`#${priceId}`).value = settings.prices[key];
    if (settings.packageYields?.[key] !== undefined) document.querySelector(`#${yieldId}`).value = settings.packageYields[key];
  }

  document.querySelector('#includeWater').checked = settings.includeWater ?? true;
  document.querySelector('#includeSoftDrinks').checked = settings.includeSoftDrinks ?? true;

  const level = form.querySelector(`input[name="drinkingLevel"][value="${settings.drinkingLevel}"]`);
  if (level) level.checked = true;
}

function calculateAndRender({ scrollToResults = false } = {}) {
  const input = collectInput();
  const errors = validateCalculatorInput(input);
  showErrors(errors);

  if (errors.length > 0) return false;

  renderResult(calculateWeddingBeverages(input));
  saveSettings();
  actionStatus.textContent = '';

  if (scrollToResults && window.matchMedia('(max-width: 1030px)').matches) {
    document.querySelector('.results-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return true;
}

async function copyShoppingList() {
  if (!latestResult && !calculateAndRender()) return;
  const text = formatShoppingList(latestResult);

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  actionStatus.textContent = 'Shopping list copied.';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateAndRender({ scrollToResults: true });
});

document.querySelector('#copyButton').addEventListener('click', copyShoppingList);
document.querySelector('#printButton').addEventListener('click', () => {
  if (!latestResult && !calculateAndRender()) return;
  window.print();
});

for (const key of mixKeys) {
  const input = document.querySelector(`#${key}Percent`);
  input.addEventListener('input', () => {
    updateRangeVisual(input);
    updateMixTotal();
  });
}

restoreSettings();
for (const key of mixKeys) updateRangeVisual(document.querySelector(`#${key}Percent`));
updateMixTotal();
calculateAndRender();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
      // The calculator remains fully usable if service worker registration is unavailable.
    });
  });
}
