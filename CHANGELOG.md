# Changelog

All updates and improvements to the Lemon app will be documented here.

## [Unreleased] - January 2026

### ✨ New Features

- **AI Smart Add 2.0 (Powered by DeepSeek V3)**: Major upgrade to the intelligent transaction logging system.
  - **Bulk Transaction Processing**: Record multiple transactions in a single natural language sentence (e.g., "Beli kopi 25rb dan bensin 50rb").
  - **Automatic Wallet Detection**: Intelligent mapping of payment sources like "BCA", "GoPay", or "Kas" using fuzzy matching.
  - **Debt Payment Integration**: Automatically detects when a transaction is a debt repayment and suggests linking it to existing debts.
  - **Real-time Balance & Budget Insights**: Instant AI warnings if a transaction leads to insufficient funds or exceeds category budgets.
  - **Conversational Refinement**: 
    - **Chat Correction**: Correct mistakes naturally via chat (e.g., "Eh, tadi salah, itu pakai kartu kredit BCA").
    - **Ambiguity Clarification**: AI asks clarifying questions for ambiguous inputs (e.g., "Ini masuk kategori 'Kebutuhan' atau 'Gaya Hidup'?").
  - **Enhanced AI UI**: New confirmation chips with category-specific colors and icons, haptic feedback, and auto-focus for a smoother experience.

- **Debt Monitoring & Analytics**: Introduced advanced debt tracking features to monitor financial health.
  - **Historical Comparison**: Track total debt changes compared to last month and last year with visual trend indicators.
  - **Silent Growth Detection**: Automatically identifies debts with high interest rates or outstanding balances exceeding the principal to prevent "silent" debt growth.
  - **Debt Payoff Projection**: Predicts estimated payoff dates based on the average monthly payment history from the last 3 months.
  - **Interactive Analytics Card**: A new dedicated dashboard for debt insights integrated into the Debts page.

- **Desktop UI/UX Overhaul (Assets & Wallets)**: Complete redesign of the desktop asset management experience.
  - **Gradient Summary Cards**: New visual cards for Total Assets, Total Liabilities, and Net Worth with beautiful gradients.
  - **Refined Wallet List**: Modern list view for wallets with improved typography, spacing, and visual hierarchy.
  - **Enhanced Wallet Details**: Improved desktop view for individual wallet details including active visual state integration.
  - **Unified Page Headers**: Implementation of the standard `PageHeader` component across desktop views for consistency.

- **Improved Transaction Visuals**: 
  - **Color-Coded Transaction Indicators**: Expense transactions now consistently use red (`text-rose-600`) for amounts and icons (`arrow-down-left`) across mobile and desktop views.
  - **Consistent Iconography**: Standardized use of `ArrowDownLeft` (expense) and `ArrowUpRight` (income) with appropriate semantic coloring.

- **Enhanced Mobile Homepage**: Complete redesign with modern solid design
  - **Clean Solid Cards**: All main cards now feature solid backgrounds with subtle borders and shadows for better clarity
  - **Gradient Text Effects**: Total balance display with beautiful gradient text effects for premium visual appeal
  - **Pull-to-Refresh Functionality**: Native mobile gesture implementation with smooth animated refresh indicator
  - **Horizontal Wallet Carousel**: Enhanced wallet section with horizontal scrollable format showing up to 5 wallets
  - **Micro-interactions & Animations**: Smooth animations using Framer Motion with spring physics
  - **Enhanced Visual Elements**: Improved debt summary, reminders, and overall visual hierarchy

- **Floating Action Button (FAB) Enhancements**: 
  - **Optimal Positioning**: Raised FAB position for better thumb reachability
  - **Visual Improvements**: Enhanced shadow effects, ring outlines, and gradient overlays
  - **Hover Animations**: Scale effects and shimmer animations for better interactivity
  - **Responsive Design**: Adaptive positioning based on screen height

- **Subscription Audit & Silent Inflation Detector**:
  - **Automated Audit**: Scans transactions for recurring subscriptions and calculates total monthly burn.
  - **Inflation Alert**: Detects price increases (silent inflation) by comparing recent transactions with historical data.
  - **Visual Insights**: New dashboard card displaying active subscriptions and alerts.

### 🎨 Enhancements

- **Desktop Navigation Consistency**: Unified header and action patterns across Dashboard, Wallets, and Transaction views.
- **Improved Visual Hierarchy**: Better use of white space, gradients, and typography in the desktop wallet management interface.
- **Modern Aesthetics**: Implementation of clean solid design with subtle shadows and depth effects
- **User Experience**: Intuitive pull-to-refresh gesture and smooth touch interactions
- **Performance Optimized**: Efficient animations and optimized build size
- **Accessibility**: Proper ARIA labels and semantic HTML structure

### 🛠 Technical & Bug Fixes

- **Hydration Fix (Goals Page)**: Resolved hydration mismatch errors by implementing client-side mount detection for date formatting.
- **TypeScript Build Stabilization**: Fixed multiple type errors across the codebase (debts, budget status, transaction tables, wallet views) to ensure successful production builds.
- **Component Cleanup**: Removed duplicate state declarations and redundant conditional logic in the Goals feature.
- **Missing Import Fixes**: Added missing component imports (e.g., `Badge` in wallet views) to prevent runtime errors.

## [Version 2.1.0] - January 2026

This release introduces comprehensive net worth tracking and developer tools for AI cost estimation.

### ✨ New Features

- **Assets & Liabilities Tracker**: Monitor your complete financial health by tracking assets (investments, cash, property) and liabilities (loans, credit cards).
    - **Net Worth Dashboard**: Real-time calculation of your total net worth.
    - **Visual Breakdown**: Categorized view of all your assets and liabilities.
- **AI Token Calculator**: A developer-focused tool to estimate token usage and costs for the DeepSeek V3 model.
    - **Cost Estimation**: Calculate input/output costs in IDR based on real-time rates.
    - **Runway Calculator**: Estimate how long your API budget will last based on daily transaction volume.

### 🎨 Enhancements

- **Settings Integration**: Added access points for Token Calculator and Assets management in the Settings/More menu.

## [Version 2.0.0] - 22 September 2025

**Status:** Ready to launch

### 🔍 Experience Audit & Navigation
- Menyelesaikan audit desain menyeluruh mencakup landing, autentikasi, dan alur utama aplikasi dengan dokumentasi heuristik baru.
- Menambahkan skip link dan navigasi anchor pada landing sehingga pengguna dapat menjangkau section fitur, keamanan, dan CTA akhir tanpa menggulir jauh.
- Memperbarui copy hero dan daftar manfaat agar proposisi nilai Lemon mudah dipahami dalam beberapa detik.

### 🎨 Visual, Motion & Accessibility
- Menstandarkan seluruh animasi ke durasi 0.28 s `ease-out` serta menambahkan dukungan `prefers-reduced-motion` di landing dan semua modal autentikasi.
- Memperkuat hierarchy visual dengan grid 4/8 px, radius 16–32 px, dan fokus ring kontras tinggi untuk navigasi keyboard.
- Menandai ilustrasi dekoratif sebagai `aria-hidden` dan memberikan outline fokus pada anchor nav untuk menjaga aksesibilitas.

### 🔐 Authentication & Recovery
- Memperbarui bottom sheet login, sign up, dan lupa password dengan latar belakang solid yang bersih, transisi konsisten, serta alert error inline yang mudah dibaca.
- Menjaga tombol aksi alternatif (Google, biometrik) tetap tersedia sambil menyajikan status loading yang jelas bagi setiap metode.
- Menambahkan pesan sukses permanen pada alur lupa password agar pengguna yakin email reset telah dikirim.

### 📚 Documentation & Alignment
- Menulis ulang **Design Audit** untuk memuat temuan heuristik, sistem desain, dan evaluasi alur lengkap menjelang rilis 2.0.0.
- Memperbarui **Product Blueprint** dengan snapshot rilis, prinsip pengalaman terbaru, spesifikasi motion, serta roadmap prioritas.
- Menyegarkan **README** dengan sorotan rilis, alur utama, komitmen desain & aksesibilitas, serta tautan dokumentasi penting.

## [Version 1.5.0] - December 2025

This release elevates the mobile experience with proactive guidance and complete visibility over financial obligations.

### ✨ New Features

- **Smart Reminders**: Create one-off or recurring reminders for bills, savings transfers, and follow-ups. Reminders can be linked to wallets, categories, or debts and sync with push notifications for quick completion.
- **Comprehensive Debt & IOU Tracking**: Track money you owe and are owed with dedicated debt profiles, payment schedules, counterparty histories, and interest snapshots. Transactions logged with Catat Cepat now auto-suggest matching debts.

### 🎨 Enhancements & UX Improvements

- **Mobile Home Refresh**: Added an "Upcoming" module to spotlight due reminders and approaching debt payments alongside key balances.
- **Reminder Center**: Introduced a unified calendar and list management view under the More tab for snoozing, completing, and reviewing reminder history.
- **Debt Insights Widget**: The Insights tab now visualizes total owed vs. owed to you, overdue items, and payoff velocity.

### 🧠 AI & Automation

- **Predictive Suggestions**: Catat Cepat classifies reminder intent and proposes linking entries to existing debts when confidence is high.
- **Weekly Digest**: A new AI-generated summary surfaces upcoming reminders, risky debts, and suggested actions every Monday.

### 🛠 Technical

- Added Firestore collections for reminders and debts with indexes optimized for due dates and statuses.
- Scheduled Cloud Functions send push notifications, recalculate debt projections nightly, and roll up weekly reminder stats for Insights.

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
