# Contributing Guide for Lemon

Thank you for considering contributing to the Lemon app! We greatly appreciate help from the community.

## How to Get Started

1.  **Fork & Clone the Repository**:
    *   Fork this repository to your GitHub account.
    *   Clone your fork to your local machine:
        ```bash
        git clone https://github.com/YOUR_USERNAME/lemon-app.git
        cd lemon-app
        ```

2.  **Install Dependencies**:
    This project uses `npm` as its package manager.
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    *   Copy the `.env.local.example` file to `.env.local`.
    *   Fill in the required environment variables, especially your Firebase configuration.

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

Here is a brief overview of the main folder structure:

-   `src/app`: Contains all the main routes and pages using the Next.js App Router.
-   `src/components`: Reusable React components.
    -   `ui/`: Base UI components from `shadcn/ui`.
    -   Other components are application-specific (e.g., `add-transaction-form.tsx`).
-   `src/lib`: Contains core logic and utilities.
    -   `firebase.ts`: Firebase configuration and initialization.
    -   `categories.ts`: Category and icon definitions.
    -   `utils.ts`: General helper functions.
-   `src/hooks`: Custom React Hooks (e.g., `useApp`).

## Contribution Workflow

1.  **Create a New Branch**:
    Create a new branch from `main` for each feature or fix you are working on.
    ```bash
    git checkout -b feature/cool-new-feature
    ```

2.  **Make Changes**:
    *   Write clean, readable, and consistent code with the existing style.
    *   Be sure to follow the styling guidelines with Tailwind CSS and `shadcn/ui`.

3.  **Commit Your Changes**:
    Use clear and descriptive commit messages.
    ```bash
    git commit -m "feat: Add an amazing new feature X"
    ```

4.  **Push to Your Branch**:
    ```bash
    git push origin feature/cool-new-feature
    ```

5.  **Open a Pull Request**:
    *   Go to your forked repository on GitHub and click the "New pull request" button.
    *   Provide a clear title and description of the changes you've made.
    *   Wait for review and feedback.

Thank you for making Lemon better!
