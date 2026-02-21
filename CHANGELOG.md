# Changelog

All updates and improvements to the Lemon app will be documented here.

## [Version 2.5.0] - 21 February 2026

### 🏦 Assets & Liabilities Architecture Overhaul

- **Global State & Real-time Sync**:
  - Introduced `AssetProvider` to manage assets and liabilities globally across the application. This ensures that adding, updating, or deleting entries reflects instantly in all relevant views without manual page refreshes.
  - Implemented **Supabase Real-time** listeners for assets and liabilities tables, enabling multi-device synchronization and instant UI updates.
- **Improved Entry Experience**:
  - **Robust Form Validation**: Refactored `AssetLiabilityForm` to utilize standard HTML form submission, ensuring field validation and better keyboard accessibility.
  - **Smarter Quantity Parsing**: Improved the parsing of asset quantities (e.g., grams of gold, stock lots) to handle various input formats and prevent `NaN` errors.
  - **Consistent Pricing**: Refined the gold price tracking logic within the provider for better performance.
- **Architecture Cleanup**:
  - Refactored `useAssets` into a lightweight consumer hook for the global `AssetContext`, adhering to the project's modularity standards.

### 🧠 Performance & UX Refinements

- **AI Cost Optimization**:
  - Optimized the `extractTransaction` AI flow by moving dynamic context (time, user lists) from the system prompt to the user message. This leverages **DeepSeek Prefix Caching**, significantly reducing token consumption and costs.
- **Mobile Fidelity Patches**:
  - Refined the mobile bottom navigation with reduced transparency and increased backdrop blur for a more premium, readable feel.
- **Type Safety & Build Stability**:
  - Resolved several TypeScript errors in `TransactionComposer` and `useTransactionForm` related to date formatting and Zod schema transformations, ensuring successful production builds.

## [Version 2.4.9] - 21 February 2026

### 🛠 Transaction Editing & Robustness

- **Streamlined Editing Workflow**:
  - Refactored `EditTransactionSheet` to consistently utilize `useActions` for `updateTransaction` and `deleteTransaction`. This ensures all editing operations benefit from centralized optimistic updates, real-time event emissions, and robust error handling.
  - Resolved an issue where optimistic updates were not correctly applied during transaction edits, leading to perceived failures or delayed UI feedback.
- **Enhanced Edit User Experience**:
  - The manual edit form within `EditTransactionSheet` is now **always visible** by default, eliminating confusion and ensuring immediate access to all editable fields without requiring an additional click. The toggle button for manual form visibility has been removed for a streamlined experience.
  - Fixed `CategorySelector` to correctly initialize and display the existing sub-category of a transaction when opened for editing, preventing data loss or misrepresentation.
  - Ensured the `isNeed` (Needs vs. Wants) flag is accurately preserved and displayed when editing transactions.

### 💸 Expense Category Refinement & AI Integration

- **Comprehensive Expense Schema**:
  - Overhauled default expense categories in `src/lib/categories.ts` for greater detail and modern relevance (e.g., "Makanan" -> "Konsumsi & F&B", "Belanja" -> "Belanja & Lifestyle", "Tagihan" -> "Tagihan & Utilitas", "Langganan" -> "Langganan Digital").
  - Expanded sub-categories for all expense types to cover modern needs like Skincare, Logistics, and various Digital Subscriptions.
- **AI Intelligence for Expenses**:
  - Updated `extract-transaction-flow`'s AI prompt with specific mapping logic for new expense categories and sub-categories.
  - Enhanced merchant awareness for automotive maintenance (e.g., "oli", "yamalube", "motul") within the AI prompt, improving automated categorization accuracy.
  - Updated `MERCHANT_MAP` in `merchant-utils.ts` to include popular motor oil brands and related services.
- **Visual & Database Alignment**:
  - Integrated new Lucide icons (`Zap`, `Tv`) into `iconMap` in `category-utils.ts` for improved visual representation of new categories.
  - Introduced a new migration (`20260221130000_refine_expense_categories.sql`) to safely update default expense category names and sub-categories in the database, including the automatic update of existing transactions to align with the new naming conventions.

## [Version 2.4.8] - 21 February 2026

### 💰 Income Category Overhaul & Precision

- **Comprehensive Income Schema**:
  - Re-architected income categories to be more descriptive and professional (e.g., "Gaji" -> "Gaji & Tetap", "Investasi" -> "Investasi & Pasif").
  - **New Specialized Categories**: Introduced "Refund & Cashback" and "Penjualan Aset" (specifically for second-hand items, electronics, and vehicles).
  - **Modern Sub-categories**: Added support for Affiliate/AdSense income, Royalties, Zakat/Infaq received, and Asset liquidation.
- **AI Intelligence Upgrade**:
  - Enhanced the `extract-transaction-flow` engine to recognize high-intent keywords like "jual", "laku", "cair", and "cashback".
  - Improved mapping logic to automatically assign income to the new specialized categories.
- **Visual Fidelity**:
  - Integrated new high-fidelity Lucide icons (`RefreshCw`, `BadgeDollarSign`, `Wallet`, `Code`) with refined Tailwind color palettes for better visual distinction in lists and charts.
- **Database Integrity & Migration**:
  - Implemented a safe SQL migration (`20260221120000_refine_income_categories.sql`) to rename default categories and automatically update existing transaction history, ensuring zero data loss during the transition.

## [Version 2.4.7] - 21 February 2026

### 🎨 Dynamic DNA UI & Immersive Experience

- **"Dynamic DNA" Visual Engine**:
  - Implemented a sophisticated color extraction system that transforms category/wallet colors into high-fidelity visual profiles (Mesh Gradients, Ambient Glows, and Branded Shadows).
  - **Dashboard Overhaul**: Hero card now features a dynamic animated mesh background.
  - **Branded Wallet Stack**: Wallet cards now automatically adopt their brand's visual identity with glassmorphism insets for balance protection.
  - **Transaction List Fidelity**: Added **DNA Stripes** (vertical color indicators) to each transaction row for instant visual categorization.
- **Universal Borderless Depth**:
  - Replaced all remaining hard borders with layered shadows and elevation (Visual Depth principle).
  - Standardized "Inset Group" backgrounds for detail sections inside cards.

### 📊 Precision Budgeting & Sub-categories

- **Sub-category Budgets**:
  - Enabled the ability to set budgets for specific sub-categories (e.g., "Kopi" instead of just "Makanan").
  - **Atomic Sync**: Updated database triggers and backend logic to calculate "Spent" totals respecting sub-category filters.
  - **Refined Modals**: Added a multi-step selection flow in Add/Edit Budget modals for granular control.
  - **Smart Insights**: Budget recommendations now factor in historical sub-category spending.

## [Version 2.4.6] - 21 February 2026

### 🏗 Architecture & Engineering Standardization

- **Design System v1.1.0 Update**:
  - Formalized **Modularity & Scalability** as core engineering mandates in `docs/DESIGN_SYSTEM.md`.
  - Defined **Atomic Component** hierarchy: Atoms (basic UI), Molecules (combined logic), and Organisms (feature blocks).
  - Established strict **Naming Conventions**: `kebab-case` for files, `PascalCase` for components, and `camelCase` for utilities/hooks.
  - Specified **State Management** tiers: Global (Context), Server (Real-time hooks), and Local (React state).
  - Defined **API Versioning Strategy** for Supabase RPCs using `_v{n}` suffixes to ensure backward compatibility.

## [Version 2.4.5] - 21 February 2026

### 🛠 UI Infrastructure & Accessibility Fixes

- **Tooltip Rendering Fix**: 
  - Updated `src/components/ui/tooltip.tsx` to utilize **React Portal**. This ensures tooltips are no longer clipped by containers with `overflow: hidden` (like the new Capsule Sidebar).
- **Global Tooltip Standardization**:
  - Centralized `TooltipProvider` in the root `layout.tsx` to enable consistent tooltip behavior and performance across the entire application.
  - Standardized `delayDuration` to 300ms for a smooth, high-fidelity interaction feel.
- **Code Quality**:
  - Cleaned up redundant provider declarations in the Sidebar.
  - Fixed a syntax error in the Sidebar component that was blocking production builds.

## [Version 2.4.4] - 21 February 2026

### ✨ Visual Harmony & "Apple Capsule" Overhaul

- **Floating Inset Sidebar (Desktop)**:
  - Redesigned as a **floating capsule** with `rounded-[32px]` and deep shadow depth.
  - Implemented **Shadcn UI Tooltips** for all navigation items in collapsed mode.
  - Refined typography to `semibold` for an elegant, professional macOS-style feel.
  - Optimized alignment and spacing for perfect visual symmetry.
- **Universal Card Standardization**:
  - Upgraded all list cards (Budgets, Goals, Debts, Reminders) to `rounded-[32px]` with **Visual Depth** (soft shadows instead of hard borders).
  - Standardized progress bars and status badges with high-fidelity typography (`tracking-tighter` for amounts).
- **Modal & Bottom Sheet Polish**:
  - Standardized all mobile sheets to `rounded-t-[2.5rem]` with `backdrop-blur-xl` glass effects.
  - Converted all primary action buttons to `rounded-full` for better ergonomics and aesthetic consistency.
- **Settings Bento Grid 2.0**:
  - Overhauled the profile bento layout with the new radius and shadow standards.
  - Refined typography and spacing for a high-density "Command Center" feel.

## [Version 2.4.3] - 21 February 2026

### 🏷️ Massive Merchant Visual Map Extension
- **Comprehensive Indonesian Branding**: Added hundreds of local favorites across:
  - **F&B**: Richeese Factory, Waroeng Steak, Mie Gacoan, Kopi Tuku, Point Coffee, Duck/Bebek Kaleyo, etc.
  - **Fashion**: Erigo, 3Second, Roughneck 1991, The Executive, Cardinal.
  - **Footwear**: Ventela, Compass, Aerostreet, Brodo.
  - **Health & Beauty**: Kahf, Azarine, Skintific, Wardah, Somethinc, Avoskin, Scarlett.
- **Global & Tech Ecosystem**:
  - **Dev & Infra**: Alibaba Cloud, Hostinger, Vercel, AWS, GitHub, Cloudflare.
  - **Digital Services**: ChatGPT, Midjourney, Disney+, Noton, Slack.
  - **Electronics**: Samsung, Sony, Polytron, Intel, NVIDIA, RTX, Ryzen.
- **Daily Utilities & Public Services**:
  - **Fuel**: Pertamina (Pertalite/Pertamax), Shell, BP, Vivo.
  - **Gov**: Samsat (STNK), PBB, BPJS, Pajak, Paspor (using new `ShieldCheck` icon).
  - **Transport**: MRT, LRT, KRL, TransJakarta, Garuda, AirAsia.
- **Smart Cataloging**:
  - Added support for **Generic Keywords**: Automatically brands transactions containing "serum", "facewash", "skincare", "bensin", "bengkel", "obat", etc.
  - Expanded icon library with 20+ new Lucide icons for high-fidelity visual representation.


## [Version 2.4.2] - 21 February 2026

### 🎨 Design System Standardization

- **New Design System Document**: 
  - Created `docs/DESIGN_SYSTEM.md` to formalize the **"Apple-Inspired Premium Fidelity"** aesthetic.
  - Defined core visual pillars: **Glassmorphism**, **Visual Depth** (no borders), **Typography-First**, and **Liquid Intelligence**.
  - Established standards for components (Magic Bar, Result Cards), charts (Monotone, Shadcn), and interactions (Haptics, Optimistic UI).
- **Goal**: To serve as the Single Source of Truth for maintaining visual consistency and high-quality UX across the entire application ecosystem.

## [Version 2.4.1] - 21 February 2026

### 🧠 Smart Add 2.0 "Liquid Intelligence"

- **Visual Overhaul (Apple-Style)**:
  - **Result Card**: Redesigned with a cleaner, "frosted glass" aesthetic (`bg-white/90` with `backdrop-blur-xl`).
  - **Typography First**: Transaction amount is now the hero element (large, bold text).
  - **Intelligent Merchant Detection**: Automatically displays the **real merchant logo** (e.g., Starbucks, Gojek, Netflix) if detected, falling back to category icons.
  - **Input Bar**: Replaced borders with "Visual Depth" (deep shadows and ambient glow) for a floating, immersive feel.
  - **Typewriter Effect**: AI status messages now type out character-by-character for a more organic assistant feel.
- **UX Refinements**:
  - **Consistent Iconography**: Standardized "Keinginan" (Want) icon to `ShoppingBag` across all forms.
  - **No UI Jump**: Fixed a glitch where the confirmation card would flash back to the input field during saving.
  - **Smart Date/Time**: Added a Time Picker (`HH:mm`) to manual entry for precise timestamping.

### 📊 Charts & Analytics Fixes

- **Spending Trend Fix**: 
  - **Date Boundary Bug**: Fixed an issue where today's transactions were cut off from the chart/list due to timezone/timestamp truncation. Now fetches up to `23:59:59` of the end date.
  - **Negative Dip Fix**: Changed chart interpolation from `natural` to `monotone` to prevent the area chart from dipping below zero (visual artifact).
  - **Shadcn UI Migration**: Refactored the chart to use the standardized `ChartContainer` system for consistent theming and tooltips.
  - **Mobile Interactivity**: Added haptic feedback (`onTouchStart`) and a visible cursor/active dot to improve touch responsiveness.
- **Activity List Ordering**:
  - Enforced strict `DESC` sorting by `date` AND `created_at` to ensure the most recently input transaction always appears at the top, even if dates are identical.

## [Version 2.4.1] - 21 February 2026

### 🏦 Enhanced Wallet Ecosystem & "Command Center" UI

This update focuses on deepening the wallet management experience and achieving a professional, high-density desktop aesthetic.

- **New Wallet Categorization**:
  - Added support for **Paylater** and **Investasi** account types across the entire ecosystem.
  - **Smart Brand Detection**: New intelligence layer automatically assigns logos and color themes for Indonesian brands like Kredivo, Spaylater, Bibit, Ajaib, etc., during creation.
- **Enterprise Desktop UI (Wallet View)**:
  - **Borderless Design**: Achieved a clean, frameless aesthetic by removing all visible borders and relying on background elevation/shadows for separation.
  - **Optimized Density**: Reduced padding and refined spacing to maximize information density, creating a true "Financial Command Center" feel.
  - **Typographic Polish**: Removed heavy font weights (Bold/Black) in favor of a cleaner, medium-weight hierarchy.
- **Balance Correction Utility**:
  - Introduced a **"Koreksi Saldo"** tool in the wallet settings.
  - Automatically creates a reconciliation transaction under the new **"Penyesuaian Saldo"** category to sync app records with real-world balances transparently.
- **Improved Filter System**:
  - Redesigned the wallet navigator with high-density filter pills for quick switching between Bank, E-Wallet, Paylater, and Investment accounts.


### ⚡️ Real-Time & Optimistic UI Overhaul

This release focuses on making the app feel "instant" by eliminating loading states for core actions.

- **Instant Budget Updates**: 
  - The "Spent" progress bar on budgets now updates immediately when you add a transaction, without needing a page refresh.
  - Implemented a listener for `transaction.created` events directly in the budget hook to recalculate progress on the fly.
- **Optimistic Goals & Debts**:
  - Creating, editing, or deleting **Savings Goals** and **Debts** now reflects instantly in the UI.
  - **Debt Payments**: Recording a debt payment now instantly updates the debt's outstanding balance and status (e.g., to "Settled") before the server confirms the request.
- **Unified Event Architecture**:
  - Refactored `WalletProvider` to listen to global transaction events (`transaction.created/updated/deleted`).
  - **Prevented Double-Counting**: Removed manual wallet updates from `use-transaction-actions.ts` to rely solely on the global event listener, ensuring a Single Source of Truth for balance updates.

## [Version 2.3.3] - 21 February 2026

### 🛡 Type Safety & Stability Improvements

- **Design System Consistency**:
  - **Badge Variants**: Added missing `success` (Emerald) and `warning` (Yellow) variants to the `Badge` component, resolving visual regressions in the Net Worth card.
- **Robust Transaction Handling**:
  - **Optimistic Type Safety**: Enforced strict number conversion for transaction amounts in `use-transaction-actions`, preventing potential `NaN` or string concatenation errors during optimistic UI updates.
  - **Service Layer Hardening**: Simplified data processing in `TransactionService` by leveraging Zod-validated types directly, removing redundant and error-prone string manipulation logic.
  - **Form Initialization**: Fixed a type conflict in `useTransactionForm` where initial empty values clashed with strict schema definitions, ensuring smoother form hydration.

## [Version 2.3.2] - 21 February 2026

### 📲 PWA Installation Experience

- **Global Install Prompt**: 
  - Introduced a non-intrusive, global installation prompt (`InstallPrompt`) that elegantly suggests installing the app.
  - The prompt is designed to appear after a short delay to avoid disrupting the initial user experience.
- **Sidebar Integration**: 
  - Added a persistent "Install App" button to the desktop sidebar footer.
  - This button intelligently hides itself once the app is successfully installed or running in standalone mode.
- **Enhanced Discoverability**: 
  - Moved the installation trigger from being buried in Settings to prominent, context-aware locations for better user adoption.

## [Version 2.3.1] - 21 February 2026

### 🛡 Data Integrity & Atomic Sync Patch

- **Critical Fix: Double-Counting Balance**: 
  - Fixed a regressive bug in `create_transaction_v1` and `update_transaction_v1` where wallet balances were being updated twice (both by RPC and Trigger).
  - Cleaned up RPC logic to rely solely on the database trigger `on_transaction_change` for gold-standard accuracy.
- **Improved Debt Payment Deletion**:
  - Linked `debt_payments` to the `transactions` table via `transaction_id`.
  - Updated `delete_debt_payment_v1` to automatically delete the associated money transaction, ensuring wallet balances are reverted correctly when a payment is deleted.
- **Atomic Reliability**: Enforced stricter ownership checks across all database functions using `auth.uid()`.

## [Version 2.3.0] - 18 February 2026

### 🛡 Security & Performance Audit Fixes

- **Database Performance & Integrity**:
  - **Added Missing Indexes**: Created B-tree indexes for `user_id`, `wallet_id`, `date`, and `category` across all core tables (`transactions`, `wallets`, `budgets`, `debts`, `goals`, `reminders`) to ensure $O(log n)$ query speed.
  - **Unique Email Constraint**: Enforced a `UNIQUE` constraint on `profiles.email` to guarantee reliable biometric login and profile lookups.
- **Functional Fixes**:
  - **Resolved Wallet Double-Counting**: Fixed a critical bug where transactions were being counted twice in wallet balances by removing redundant manual balance updates from RPCs and delegating solely to the database trigger.
  - **Atomic Debt Payment Deletion**: Moved complex payment removal logic from the client to a robust SQL RPC (`delete_debt_payment_v1`), preventing race conditions and ensuring $100\%$ balance integrity.
- **Security Hardening**:
  - **Atomic Ownership Verification**: Updated all financial RPCs (`create_transaction_v1`, `update_transaction_v1`, `delete_transaction_v1`, `create_transfer_v1`, `pay_debt_v1`) to verify resource ownership using `auth.uid()` before execution.
  - **Client Parameter Isolation**: Hardened RPCs against ID spoofing by overriding any client-provided `p_user_id` with the actual authenticated session ID.
- **Architecture & DX**:
  - **Unified RPC Signature**: Simplified `TransactionService` to handle `sub_category` and `is_need` flags directly within atomic database calls, reducing network round-trips.

### 🛠 Codebase Refactoring & Quality Audit

- **Form Management Overhaul**: Refactored Debt, Wallet, and Transaction forms to use `React Hook Form` and `Zod` for robust validation and improved UX.
- **Type Safety Enforcement**: Eliminated 100+ instances of `any` types in critical files ([use-assets.ts](file:///g:/01_projects/lemon-beta/src/features/assets/hooks/use-assets.ts), [lazy-charts.tsx](file:///g:/01_projects/lemon-beta/src/features/charts/components/lazy-charts.tsx), etc.) to improve developer experience and prevent runtime bugs.
- **Hook Modernization**: Replaced deprecated `useApp` hook with modular `useAuth` and `useActions` across 13+ files, reducing unnecessary re-renders and improving code modularity.
- **Performance Optimization**: Optimized Context Providers (`AuthProvider`, `ActionProvider`, `UIProvider`) using `useMemo` and `useCallback` for stable state management.
- **Icon Casing Fix**: Resolved 10 console errors related to incorrect React component casing for Lucide icons in [chart-utils.ts](file:///g:/01_projects/lemon-beta/src/features/charts/lib/chart-utils.ts).
- **Centralized Actions**: Moved core CRUD operations to `ActionProvider` for better maintainability and state consistency.
- **Clean Code**: Deleted legacy `use-data.ts` and other redundant files to reduce technical debt.

## [Version 2.2.0] - 16 February 2026

This release focuses on "Premium Fidelity" and Advanced Analytics, elevating Lemon from a simple tracker to a professional wealth management tool.

### ✨ New Features

- **Advanced Financial Analytics**: 4 new data layers for deep financial storytelling.
  - **Net Worth Trend**: Historical 6-month tracking of total wealth (Assets vs. Liabilities).
  - **Saving Potential & Efficiency**: Visual comparison of maximum saving capacity vs. actual performance.
  - **Behavior Analytics**: Deep dive into spending habits (Weekday vs. Weekend) and "Payday Drain" velocity.
  - **Subscription & Fixed Cost Audit**: Centralized tracker for recurring bills with due-date alerts.
- **Premium PWA Experience**: 
  - **Custom Install Prompt**: New elegant "Install Lemon" module in Settings with one-tap installation.
  - **OLED Optimized Palette**: Synchronized brand colors (Teal 600) across manifest and UI.
  - **Offline Resilience**: Improved "Luring" mode with premium visual feedback and smart caching.

### 🎨 Visual & UX Enhancements ("Premium Fidelity")

- **Standardized Component Radius**: Professional 8px radius for desktop and touch-friendly 14px for mobile devices.
- **Haptic Feedback Engine**: Subtle physical vibrations for navigation, Smart Add, and successful transactions.
- **Success Celebrations**: New high-end checkmark animations and particle effects when saving transactions.
- **Skeleton Loading Screens**: Replaced generic spinners with contextual skeletons for Home and Statistics pages.
- **Premium Empty States**: Beautiful silhouettes and aspirational typography for empty lists and charts.
- **Progress Track Design**: Overhauled category list items with smooth gradients and integrated budget indicators.
- **Fluid Layout**: Increased maximum mobile width to `max-w-lg` for better appearance on modern wide phones and foldables.

### 🛠 Technical & Robustness

- **Clean Architecture Refactor**:
  - **Service Layer**: Isolated database logic into `TransactionService` for better testability.
  - **Controller Hooks**: Unified form logic into `useTransactionForm` custom hook.
  - **Modular UI**: Extracted edit logic into a standalone premium `EditTransactionSheet`.
- **Optimistic Updates**: Zero-latency UI response—wallet balances and lists update instantly before server confirmation.
- **Database Schema Sync**: Added `sub_category` column support across database triggers, RPC functions, and frontend forms.
- **Performance Optimization**: Implemented `next/dynamic` lazy loading for heavy chart components to reduce initial bundle size.

## [Unreleased] - February 2026

### 🎨 Visual & UI Consistency

- **Design System Standardization**:
  - **Semantic Tokens**: Introduced `warning` and `info` semantic tokens to the global design system for better consistency.
  - **Sharpened Shadows**: Added a custom `shadow-card` utility for a more professional, enterprise-grade look.
  - **Radius Consistency**: Refactored `Card` components to use the standardized `rounded-lg` radius, ensuring consistency with the design system.
- **Component Refactoring**:
  - **NetWorthCard**: Updated to use semantic text colors (`text-success`, `text-warning`, `text-destructive`) instead of hardcoded palette values.
  - **DesktopDashboard**: Removed hardcoded colors and border radii, aligning the dashboard with the global theme and responsive design tokens.
- **Brand Intelligence**:
  - **SeaBank Integration**: Added SeaBank to merchant and wallet visual maps, ensuring the logo and brand colors appear correctly in transaction lists and wallet stacks.
- **Testing**: Added `visual-regression.test.tsx` to verify component structure and class usage.

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
- Completed a comprehensive design audit covering landing, authentication, and core app flows with new heuristic documentation.
- Added skip links and anchor navigation on the landing page so users can reach features, security, and final CTA sections without excessive scrolling.
- Updated hero copy and benefits list to make Lemon's value proposition easy to understand in seconds.

### 🎨 Visual, Motion & Accessibility
- Standardized all animations to 0.28s `ease-out` duration and added `prefers-reduced-motion` support on the landing page and all authentication modals.
- Strengthened visual hierarchy with a 4/8 px grid, 16–32 px radii, and high-contrast focus rings for keyboard navigation.
- Marked decorative illustrations as `aria-hidden` and provided focus outlines on anchor nav to maintain accessibility.

### 🔐 Authentication & Recovery
- Updated login, sign up, and forgot password bottom sheets with clean solid backgrounds, consistent transitions, and easy-to-read inline error alerts.
- Kept alternative action buttons (Google, biometric) available while presenting clear loading statuses for each method.
- Added permanent success messages in the forgot password flow to assure users that the reset email has been sent.

### 📚 Documentation & Alignment
- Rewrote the **Design Audit** to include heuristic findings, design systems, and full flow evaluations ahead of the 2.0.0 release.
- Updated the **Product Blueprint** with release snapshots, latest experience principles, motion specs, and priority roadmaps.
- Refreshed the **README** with release highlights, key flows, design & accessibility commitments, and important documentation links.

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
