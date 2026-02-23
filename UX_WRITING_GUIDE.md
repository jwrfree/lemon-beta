# UX Writing Guide for Lemon App

This document serves as a guide for writing all copy (text) within the Lemon app. The goal is to create a consistent, friendly, and clear user experience.

## Core Principles

Lemon's tone of voice is based on three main principles:

1.  **Friendly & Personal**
    Our tone is familiar, like a good friend helping manage finances. We aren't stiff or overly formal, but also not "cringe" or excessively slangy.
    - **Use "you"**, not third-person terms.
    - Make the user feel supported, not judged.

2.  **Clear & Concise**
    Every piece of text must be easily understood at a glance. Avoid complicated financial jargon and technical terms.
    - Get straight to the point.
    - Use active and simple sentences.

3.  **Helpful & Motivating**
    Our text should guide users, especially when they are just starting or facing difficulties.
    - Provide clear instructions.
    - On empty states, provide a motivating call to action.
    - When errors occur, explain what went wrong and how to fix it calmly.

## Tone & Style

### Addressing the User
- **Use**: `you`, `your`.
- **Avoid**: `user`, `one's`.

**Example**:
- 👍: "See all your wallets."
- 👎: "View user wallets."

### Action Messages (Buttons & Links)
Use clear and specific verbs.

- **Use**: "Create New Budget", "Save Transaction", "View All", "Delete".
- **Avoid**: "Send", "Okay", "Submit".

### Page & Modal Titles
Must be descriptive and immediately explain the content.

- **Example**: "Add New Transaction", "Edit Wallet", "Confirm Deletion".

### Confirmation Messages (Toasts & Alerts)
Brief, clear, and reassuring.

- **Success Examples**: "Transaction added successfully!", "Budget created!", "Changes saved."
- **Info Example**: "You have successfully logged out."

### Error Messages
Explain the problem from the user's perspective and offer a solution. Do not blame.

- **Use**: "Budget name cannot be empty.", "Source and destination wallets cannot be the same."
- **Avoid**: "Error: Invalid input.", "Process failed."

### Empty States
Use this as an opportunity to guide and motivate the user.

- **Examples**:
    - "No transactions here yet. Let's add your first one!"
    - "Start tracking your spending by creating your first budget."
    - "You don't have any wallets yet. Let's create your first wallet to get started!"

## Consistent Terminology

To maintain consistency, use the following terms throughout the app (English / Bahasa Indonesia context):

| Term Used | Alternatives to Avoid |
| :--- | :--- |
| **Wallet** | Account, Bank, Pocket |
| **Transaction** | Entry, Record |
| **Budget** | Limit, Cap |
| **Goal** | Target, Dream |
| **Income** | Revenue, Earnings |
| **Expense** | Cost, Burden |
| **Category** | Type, Kind |
| **Transfer** | Move Funds, Send Money |
| **Manage** | Organize, Admin |
| **Save** | Submit, Send, Ok |
| **Smart Add** | Quick Input, AI Input |

## AI Conversations (Conversational Refinement)

The Smart Add feature now supports two-way interaction. Use the following principles when the AI interacts with the user:

### Clarifying Ambiguity
When the AI is unsure about user input, ask helpful but casual questions.
- **Use**: "Does this go under 'Needs' or 'Lifestyle'?", "Should this order go to BCA or Cash wallet?"
- **Avoid**: "Input unclear. Select category.", "Incomplete data."

### corrections via Chat
Provide responses that show the AI understands the user's correction.
- **User Input Example**: "Oops wrong one, used BCA credit card instead."
- **AI Response (Implicit)**: AI immediately updates the data on screen without long extra messages, or simply "Okay, I've switched it to BCA credit card!"

