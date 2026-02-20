# Lemon Complexity Control Guide

**Document Type:** Internal Product & Design Guardrail
**Version:** 1.0
**Status:** Active Reference

---

## 1. Core Principle

Complexity may increase as the product evolves. Cognitive load must not.

Every new feature, metric, or visual component must justify its existence by improving one of the following:

* Clarity
* Control
* Confidence

If a feature does not improve at least one of these outcomes, it should not be added to the default interface.

---

## 2. Layered Information Architecture (Mandatory Framework)

All screens must follow a three-layer disclosure model.

### Layer 1 — Glance (≤ 3 seconds)

Purpose: Immediate understanding.

Contains:

* One primary metric (hero)
* One directional indicator (trend or status)
* One short insight sentence (≤ 90 characters)

This layer must communicate the user’s financial state instantly.

No additional charts, tables, or dense components are allowed at this level.

---

### Layer 2 — Expand (≤ 10 seconds)

Purpose: Controlled exploration.

Contains:

* Primary chart or breakdown
* Two to three supporting statistics
* One actionable control (adjust, review, resolve)

This layer must be expandable (accordion, sheet, tab, or drill-in). It should never appear fully expanded by default.

---

### Layer 3 — Deep Dive (Power User)

Purpose: Detailed analysis.

Contains:

* Filters and comparison tools
* Historical tables
* Export or advanced configuration options

This layer must never be visible by default.

---

## 3. Visual Weight Hierarchy

Each screen must clearly define visual importance.

* One Hero element
* Maximum two Secondary elements
* All remaining elements categorized as Tertiary and collapsed

If multiple elements compete for primary attention, hierarchy must be revised.

---

## 4. Contextual Prominence

Information must surface based on state relevance.

Examples:

* Debt Health widget moves higher when status becomes critical.
* Budget warnings increase visual emphasis only when overspent.
* Subscription alerts surface only when recurring impact exceeds threshold.

The interface must adapt to financial context rather than remain static.

---

## 5. Information Compression Strategy

Before adding a new visual component, evaluate whether the same insight can be delivered through:

* A single sentence
* A color-coded indicator
* A compact progress bar

AI-generated summaries should function as cognitive compression tools, not decorative content.

---

## 6. Screen Density Checklist

Before release or merge:

* Is there sufficient white space?
* Is there only one focal point?
* Can the user identify the key message in under three seconds?

If the screen fails any of the above, refinement is required.

---

## 7. Interaction Guardrails

* Standard motion duration: 0.28s ease-out
* Overlays and modals: 0.24s
* Haptics reserved for confirmation, warnings, and milestone achievements
* Reduced-motion preference must disable non-essential animation

Motion must clarify state changes, not distract.

---

## 8. Emotional Outcome Filter

All features must support the core emotional outcome:

"Financial decisions feel lighter, clearer, and more controlled."

If a feature introduces anxiety, confusion, or unnecessary friction, it must be redesigned or relocated to a deeper layer.

---

## 9. Anti-Overengineering Rule

Before introducing a major feature, confirm:

1. Does it meaningfully impact primary success metrics?
2. Will at least 60% of active users benefit from it?
3. Can it live in Layer 3 instead of Layer 1 or 2?

If these cannot be clearly justified, defer implementation.

---

## 10. Decision Evaluation Matrix

| Question                      | If Yes          | If No                       |
| ----------------------------- | --------------- | --------------------------- |
| Does this improve clarity?    | Keep            | Simplify or remove          |
| Is this actionable?           | Prioritize      | Downgrade layer             |
| Can this be compressed?       | Compress first  | Visualize only if necessary |
| Is this universally relevant? | Surface earlier | Restrict to deeper layer    |

---

## 11. Surface Integrity Rule

The default interface must always remain:

* Clean
* Fast
* Predictable
* Non-intimidating

Internal complexity must never be reflected as visual clutter.

---

## 12. Design Mental Model

Lemon should function like a precision mechanical watch.

Internally complex.
Externally effortless.

If reading the interface requires effort, the design has failed.

---

**End of Document**
