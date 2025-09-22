# Changelog

All updates and improvements to the Lemon app will be documented here.

## [Version 1.4.0] - November 2025

This release introduces a major new authentication feature and focuses heavily on UI consistency and bug fixes based on user feedback.

### ✨ New Features

- **Biometric Login**: Users can now enable and use fingerprint or Face ID to log in securely and quickly. An option to manage this feature has been added to the Settings page.

### 🎨 Enhancements & Bug Fixes

- **Complete Statistics Page Redesign**: The "Statistics" page has been completely overhauled to match the app's consistent design language. This includes standardizing the header, tabs, and card components.
- **Restored Statistics Insights**: All key data insights on the Statistics page—including monthly summaries, daily trends, category distribution, largest category, and largest transaction—have been restored and integrated into the new, consistent design.
- **Biometric Authentication Fixes**:
    - Resolved a `Permissions-Policy` error that blocked WebAuthn API in the development environment by updating Next.js headers.
    - Fixed a race condition (`No document to update` error) for new users enabling biometrics by using a more robust Firestore write method.
- **Animation Standardization**: Replaced `spring` animations for drawers and modals with a uniform `ease-out` transition of 0.2 seconds for a more consistent feel.
- **Hydration Error Fixes**: Resolved React hydration errors on the Statistics and Budget Detail pages, ensuring a stable rendering experience.

### 🐞 Known Bugs

- **Deleting Transfers**: The application currently does not support the deletion of "Transfer" type transactions from the transaction history. Attempting to do so will show an error message.

## [Version 1.3.0] - November 2025

This release introduces major performance optimizations, cost-saving AI enhancements, and the completion of core financial features.

### ✨ New Features

- **Full CRUD for Financial Goals**: Users can now create, read, update, and delete their financial targets. A target date has been added to make goals more specific and trackable.
- **New "Health" Category**: Added "Kesehatan" as a primary expense category with relevant sub-categories like "Dokter & RS" and "Obat & Vitamin".

### ⚡️ Performance & Optimizations

- **AI Cost Reduction**: The "Catat Cepat" (Quick Add) AI flow has been completely refactored to use Genkit Tools instead of passing large data objects in prompts. This drastically reduces token usage and lowers operational costs.
- **Page Flicker Fixed**: Resolved a major page flickering issue during navigation by centralizing the global `AppProvider` in the root layout, ensuring a stable and smooth user experience.
- **Optimized Font Loading**: Improved initial page load times and prevented layout shift by optimizing the way custom fonts are loaded via CSS variables.
- **Refactored Transactions Page**: Removed a redundant transaction history page and consolidated functionality into a single, more efficient page with an improved filtering UI.

### 🎨 Enhancements & Bug Fixes

- **New Zoom Transition**: Replaced the page slide animation with a more modern and subtle zoom-in/zoom-out effect for a smoother feel.
- **Z-Index Fix**: Permanently fixed the bug where page content would scroll over sticky headers by applying a consistent z-index strategy across the app.
- **UI & Form Fixes**:
    - Removed shadows from all `Card` components for a cleaner, flatter design.
    - Fixed a bug where the edit transaction form would not display the correct categories after changing the transaction type.
    - Resolved a Next.js error by correcting the component export on the Settings page.
    - Enhanced UI consistency by adding an underline effect to link-style buttons on hover.

## [Version 1.2.0] - October 2025

This release focuses on significant UI/UX enhancements and the introduction of AI-powered features to make transaction logging faster and more intuitive.

### ✨ New Features

- **"Catat Cepat" with AI**: A new way to add transactions using natural language.
    - **Text Input**: Type or paste transaction details like "beli kopi 25rb pake GoPay".
    - **Voice Input**: Use your voice to dictate transactions for a hands-free experience.
    - **Receipt Scanning**: Snap a photo of a receipt, and the AI will extract the details automatically.
- **Smart Transaction Defaults**: The AI will now intelligently default to "Tunai" (Cash) for the wallet and "today" for the date if not specified, reducing manual input.
- **Instant Transaction Insights**: When using "Catat Cepat", the app now provides instant, non-AI insights on how the new transaction will affect your budget and wallet balance before you even save it.
- **Animated Counters**: Key financial numbers like total balance, income, and expenses on the homepage now animate when they change, providing a more dynamic and satisfying user experience.

### 🎨 Enhancements & Fixes

- **Intuitive Budget Creation**: The "Add Budget" flow has been revamped with a slider and quick-select buttons, making it easier and more interactive to set a target amount.
- **Streamlined Transaction History**: The transaction history page now features a cleaner header with a compact, icon-based filter sheet, providing more space for content. Filters are now progressively disclosed for a tidier interface.
- **Improved Budget Visualization**: The progress bar on the budget detail page now dynamically changes color (blue, yellow, red) to indicate whether spending is safe, nearing the limit, or has exceeded it.
- **UI Consistency & Fixes**:
    - Addressed a key `z-index` issue where page content would scroll over the header.
    - Fixed a page-flickering issue during navigation by optimizing the global state provider's location.
    - Resolved several React warnings and errors, including `indicatorClassName` prop and initialization errors.
    - Improved the touch target and visual design of the filter removal "X" button.
    - Removed the inconsistent "Back" button from the main Budgeting page header.

## [Version 1.1.0] - September 2025

This is our first major feature release focused on improving tracking details and user experience.

### ✨ New Features

- **Sub-Categories**: You can now add sub-categories for each transaction, providing deeper insights into your spending and income. Simply select a main category, and a panel will appear to choose a sub-category.
- **Transaction Location/Store**: Add a location or store name as an optional field when creating a transaction to remember where you made the purchase.
- **Updated Category Structure**: We've revamped and added several new, more relevant categories for digital workers and freelancers, such as "Subscriptions" (for software, cloud, etc.) and "Side Hustle" as a primary income category.

### 🎨 Enhancements & Fixes

- **UI Consistency**: The transaction history is now always grouped by date (`Today`, `Yesterday`, etc.) across all sections of the app for a more consistent experience.
- **Cleaner Layout**: Long category names in the transaction form will now be truncated with an ellipsis (...) to keep the layout clean.
- **Homepage Background**: The homepage now uses a light gray background (`bg-muted`) to be uniform with other pages.
- **Simplified Header**: The duplicate "Settings" button in the homepage header has been removed to simplify navigation.
