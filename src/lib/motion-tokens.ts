export const motionTokens = {
  /** Fast micro-interactions (press, hover) — 150–170ms */
  durationFastMs: 160,
  /** Default UI transitions (overlays, cards) — 180–200ms */
  durationNormalMs: 200,
  /** Framer Motion-friendly seconds variants */
  durationFast: 0.16,
  durationNormal: 0.2,
  /** Calm, intentional easing curve */
  easingStandard: [0.22, 0.61, 0.36, 1] as const,
  /** Subtle vertical offsets to avoid layout jump */
  translateSmall: 4,
  translate: 8,
} as const
