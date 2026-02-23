UX Writing Guide for Lemon App (v2)

This document defines how all copy inside the Lemon app should be written.
Our goal is to create a clear, supportive, and emotionally intelligent financial experience.


---

1. Brand Voice Foundation

Lemon is a supportive financial companion — not a bank, not a motivational coach, and not a strict accountant.

We help users manage money calmly and confidently.

Voice Attributes

Attribute	Level	Description

Formality	3/10	Casual but respectful. Never slangy.
Playfulness	3/10	Light warmth allowed. No jokes during serious moments.
Directness	8/10	Clear, straight to the point.
Emotional Tone	6/10	Calm and supportive, never judgmental.



---

2. Core Writing Principles

2.1 Friendly & Personal

Use "you" and "your".

Speak directly to the user.

Never refer to the user in third person.


Example:

"See all your wallets."

Avoid: "View user wallets."



---

2.2 Clear & Concise

Avoid financial jargon.

Use short sentences.

One idea per sentence.

Prefer active voice.


Example:

"Add a new transaction."

Avoid: "A new transaction can be added."



---

2.3 Helpful & Actionable

Always guide the user toward the next step.

Error messages must explain what happened and what to do next.



---

3. Emotional Context Handling

Financial apps must handle sensitive situations carefully.

3.1 When User Exceeds Budget

Avoid blame or shame.

Avoid: "You exceeded your budget."

Use: "You've gone over this budget. Want to review your recent expenses?"



---

3.2 When User Has Low Balance

Be neutral and supportive.

Avoid: "Insufficient funds."

Use: "This wallet doesn’t have enough balance for this transfer."



---

3.3 When Goals Are Not Met

Encourage without pressure.

Avoid: "Goal failed."

Use: "You’re not there yet. Let’s adjust your plan and keep going."



---

4. Action Messages (Buttons & Links)

4.1 Primary Actions

Use strong, specific verbs.

Use:

"Create New Budget"

"Save Transaction"

"Add Wallet"

"Confirm Transfer"


Avoid:

"Submit"

"Okay"

"Send"


Primary CTA max length: 3–4 words.


---

4.2 Destructive Actions

Be explicit and serious.

Use:

"Delete Wallet"

"Delete Permanently"

"Confirm Deletion"


Never soften destructive actions with vague wording.


---

5. Page & Modal Titles

Titles must clearly describe the content.

Use:

"Add New Transaction"

"Edit Wallet"

"Transfer Between Wallets"


Avoid generic titles like "Details" or "Manage".


---

6. Confirmation Messages (Toasts & Alerts)

Short and reassuring.

Success:

"Transaction added successfully."

"Budget created."

"Changes saved."


Information:

"You have logged out."


Keep under 10 words when possible.


---

7. Error Message Framework

Errors must follow this structure:

1. What happened


2. Why (if necessary)


3. What to do next



7.1 Validation Errors

Direct and specific.

"Budget name cannot be empty."


---

7.2 System or Network Errors

Calm and reassuring.

"We’re having trouble connecting. Please try again."

Avoid technical terms like "server error" or "exception".


---

7.3 Permission Errors

Clear and instructive.

"You don’t have access to edit this wallet."


---

8. Empty States

Empty states should guide action.

Structure:

1. State what is missing.


2. Encourage next step.



Examples:

"No transactions yet. Add your first one."

"You don’t have any wallets. Create your first wallet to get started."


Keep it short and motivating.


---

9. Consistent Terminology

Use only these terms:

Term Used	Avoid

Wallet	Account, Bank, Pocket
Transaction	Entry, Record
Budget	Limit, Cap
Goal	Target, Dream
Income	Revenue, Earnings
Expense	Cost, Burden
Category	Type, Kind
Transfer	Move Funds, Send Money
Manage	Organize, Admin
Save	Submit, Send, Ok
Smart Add	Quick Input, AI Input


Do not mix terminology across screens.


---

10. AI Conversation Guidelines (Smart Add)

The AI should feel efficient, calm, and natural.

10.1 Clarifying Ambiguity

Ask casual but clear questions.

Use:

"Does this go under 'Needs' or 'Lifestyle'?"

"Should this use BCA or Cash wallet?"


Avoid robotic phrasing:

"Input unclear. Select category."



---

10.2 Handling Corrections

Keep responses short.

User: "Oops wrong one, used BCA credit card instead."

AI: "Okay, I’ve switched it to BCA credit card."

Do not over-explain.


---

10.3 AI Personality Boundaries

The AI:

Should not joke about money.

Should not criticize spending.

Should not sound overly enthusiastic.

Should not give financial advice beyond tracking and organizing.


The AI may:

Gently encourage.

Clarify.

Summarize clearly.



---

11. Writing Constraints

Avoid emojis in core financial actions.

Avoid slang.

Avoid exclamation marks in serious contexts.

Use sentence case (not ALL CAPS).

Keep most UI text under 12 words.



---

12. Accessibility & Inclusivity

Use simple language.

Avoid idioms that may confuse non-native speakers.

Avoid culturally specific jokes.

Avoid gendered language.



---

Final Principle

If a sentence makes the user feel judged, confused, or overwhelmed — rewrite it.

Lemon should always feel calm, clear, and in control.