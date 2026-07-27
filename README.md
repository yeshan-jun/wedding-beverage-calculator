# Wedding Beverage Calculator

## Project Introduction

Wedding Beverage Calculator is a responsive, installable planning tool for couples, wedding planners, venue coordinators, bartenders, and family members who need a practical beverage shopping estimate for a wedding. The project turns guest details, event duration, drinking level, beverage preferences, package sizes, and prices into a clear shopping list that can be copied or printed.

The calculator is designed for common do-it-yourself wedding situations, including BYOB venues, backyard receptions, private event spaces, and celebrations where the couple purchases beverages separately from the catering service. Instead of returning only a total number of drinks, the tool converts estimated servings into useful purchasing units such as beer cases, wine bottles, spirit bottles, champagne bottles, water cases, and soft drink packs.

The application runs entirely in the browser and is published as a static website. It does not require an account, database, application server, or third-party calculation API. The interface is optimized for desktop and mobile screens, while the Progressive Web App configuration allows visitors to install the calculator and reopen cached application files when the network is unavailable.

Live website: https://yeshan-jun.github.io/wedding-beverage-calculator/

## What It Does

The calculator accepts the total number of guests, the number of adults and children, the number of adult non-drinkers, and the wedding duration. Users can select a light, average, or heavy drinking level and define the preferred percentage split between beer, wine, spirits, and champagne.

A configurable safety buffer is applied to reduce the risk of purchasing too little. The result separates the original alcoholic serving estimate from the buffered shopping quantity, then converts each beverage category into complete packages using upward rounding. For example, a partial beer case becomes a full case and a partial wine bottle becomes a full bottle.

Optional water and soft drink calculations support guests who do not drink alcohol, children, designated drivers, and general hydration during the event. Package yields and package prices can be adjusted so the result matches the products available at a local retailer. The estimated budget is calculated from the rounded package quantities rather than from fractional servings.

The result panel provides:

- Estimated alcoholic servings
- Estimated non-alcoholic servings
- Beer cases
- Wine bottles
- Spirit bottles
- Champagne bottles
- Water cases
- Soft drink packs
- Safety buffer information
- Estimated total budget
- A copy-ready shopping list
- A print-friendly shopping list

## How To Use

1. Open the calculator in a modern browser.
2. Enter the total guest count.
3. Divide the total into adults and children. These two values must equal the total guest count.
4. Enter the number of adults who will not drink alcohol.
5. Select the event duration in hours.
6. Choose a drinking level. Light uses a lower hourly rate, Average uses the standard first-hour calculation, and Heavy applies a higher rate.
7. Adjust the beer, wine, spirits, and champagne percentages. The four percentages must total 100 percent.
8. Choose whether to include water and soft drinks.
9. Open the additional settings when package yields, package prices, per-guest non-alcoholic servings, or the safety buffer need to be changed.
10. Select **Calculate Wedding Beverages** to generate the shopping estimate.
11. Use **Copy List** to place a text version on the clipboard, or use **Print** to open a clean print layout containing the shopping list.

The most recent settings are stored in the browser through `localStorage`. Returning visitors on the same browser can continue with their previous values. Clearing site data resets the saved settings.

## Supported Formats

The project does not upload or process external documents. Its supported formats describe the values accepted by the calculator and the result formats it produces.

### Input formats

- Guest counts as whole numbers
- Event duration as a positive hour value
- Beverage mix values as percentages
- Safety buffer as a percentage from 0 to 50
- Package yields as positive serving counts
- Package prices as zero or positive numeric values
- Water and soft drink consumption as servings per guest

### Output formats

- Interactive results displayed in the browser
- Plain-text shopping list copied to the clipboard
- Browser print output suitable for paper or PDF printing
- Installable PWA application shell
- Shareable public GitHub Pages website

Currency output is displayed in United States dollars because the current calculator interface targets the English-language wedding planning market. The underlying calculation logic keeps pricing values separate from beverage serving rules, making future currency or locale expansion straightforward.

## Technical Details

The source stack is HTML, CSS, and modern JavaScript modules. There are no runtime libraries and no framework dependency. Node.js is used only for the local development server, tests, and production build script.

The calculation logic is isolated in `src/calculator.js`. It validates guest relationships, beverage percentages, duration, package yields, prices, and optional drink settings before generating results. The browser interaction layer in `src/main.js` reads form values, saves settings, renders the results, handles copying, starts printing, and registers the Service Worker. Visual styling is contained in `src/styles.css`, including responsive desktop and mobile layouts and print-specific rules.

The test suite uses Node.js built-in test support through `node --test`. Calculation tests cover validation, drinking-rate rules, package rounding, optional beverages, budget totals, and shopping-list formatting. Static tests verify SEO metadata, canonical URLs, required HTML comments, PWA configuration, GitHub link attributes, README requirements, repository configuration, and build behavior.

The PWA uses `public/manifest.webmanifest` and `public/sw.js`. The Service Worker pre-caches the complete local application shell. For later requests, it follows a Network First strategy: it requests the current resource from the server, refreshes the cache after a successful response, and uses the cached response only when the network request fails. This approach favors current deployed files while preserving offline access to previously cached assets.

## Project Structure

```text
wedding-beverage-calculator/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.webmanifest
│   ├── maskable-icon-512.png
│   ├── og-image.png
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── sw.js
│   └── ui-icons.svg
├── scripts/
│   ├── build.mjs
│   └── serve.mjs
├── src/
│   ├── calculator.js
│   ├── main.js
│   └── styles.css
├── tests/
│   ├── build.test.js
│   ├── calculator.test.js
│   └── static.test.js
├── index.html
├── package.json
├── README.md
└── repo.config.json
```

`npm run build` recreates the `dist` directory, copies the static website files, adds `.nojekyll`, and copies the root `README.md` and the existing `.github` directory into the build output. The source `.github` directory is maintained independently; the build script copies it but does not generate it.

## Deployment

Install a current Node.js release, clone the repository, and run the following commands:

```bash
npm test
npm run build
```

The production website is written to `dist/`. To preview the project locally, run:

```bash
npm run dev
```

Then open:

```text
http://localhost:4173/wedding-beverage-calculator/
```

For GitHub Pages deployment, keep the default branch as `main` and configure GitHub Pages to use GitHub Actions as its source. The existing workflow tests the project, runs the build command, uploads the generated `dist` directory, and deploys it to GitHub Pages. The canonical website address is already configured as:

```text
https://yeshan-jun.github.io/wedding-beverage-calculator/
```

When the repository name or owner changes, update the canonical URL, Open Graph URL, manifest paths, sitemap, Service Worker paths, repository link, homepage field in `repo.config.json`, and local preview path before deployment.

## Repository

Repository name: `wedding-beverage-calculator`

Repository URL: https://github.com/yeshan-jun/wedding-beverage-calculator

The root `repo.config.json` file contains reusable repository creation metadata, including the repository name, English description, visibility, homepage, topics, default branch, README creation preference, source stack, and Pages stack. It can be read by a repository automation script or copied into another deployment workflow.

## Privacy

All beverage calculations are performed locally in the visitor's browser. The project has no application backend, no database, no user account system, and no form submission endpoint. Guest counts, drink preferences, package settings, and price values are not sent to a calculation server.

The application stores the most recent calculator settings in the browser's `localStorage` so the values can be restored during a later visit on the same device and browser. Visitors can remove this data by clearing the website's storage in their browser settings. The Service Worker stores static website files in the browser cache to provide installation and offline fallback behavior.

The repository does not include analytics or advertising scripts by default. A future deployment that adds external analytics, advertising, embedded content, or third-party services should update this privacy section and provide any notices required by the deployment region.

## License

> This project is released under the MIT License.

The MIT License permits use, copying, modification, distribution, sublicensing, and commercial use under its stated conditions. Retain the copyright and license notice when redistributing substantial portions of the project.
