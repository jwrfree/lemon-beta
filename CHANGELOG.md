# Changelog

All updates and improvements to the Lemon app will be documented here.

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
