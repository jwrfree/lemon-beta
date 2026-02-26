#!/usr/bin/env node
/**
 * Design System Audit Script
 *
 * Scans component files under src/components/ and src/components/ui/ to detect
 * which components are not following design system tokens and standards.
 *
 * Output: JSON array with compliance status for each component.
 *
 * Usage: node scripts/audit-design-system.mjs [--output <file>]
 *
 * @see DESIGN_SYSTEM.md for full token specifications.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const SCAN_PATHS = ['src/components', 'src/components/ui'];

// ── Compliance Check Helpers ──────────────────────────────────────────────────

/** DS §2 — Arbitrary pixel/rem font sizes are forbidden */
const ARBITRARY_FONT_RE = /text-\[\d+(\.\d+)?(px|rem)\]/;

/** DS §2 — font-bold is reserved for marketing only */
const FONT_BOLD_RE = /\bfont-bold\b/;

/** DS §3 — Hardcoded hex colors are forbidden in JSX className */
const HARDCODED_HEX_RE = /#[0-9a-fA-F]{3,8}\b/;

/** DS §3 — Raw Tailwind colour literals (e.g. bg-blue-600) without semantic wrapper */
const RAW_COLOR_RE =
  /\b(bg|text|border|ring|fill|stroke)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;

/** DS §4 — Arbitrary border-radius values */
const ARBITRARY_RADIUS_RE = /rounded-\[\d+(\.\d+)?(px|rem)\]/;

/** DS §5 — Arbitrary spacing values in padding/margin */
const ARBITRARY_SPACING_RE = /\b[pm][xytblr]?-\[\d+(\.\d+)?(px|rem)\]/;

/** DS §6 — Inline box-shadow in style prop (should use shadow-* utility) */
const INLINE_SHADOW_RE = /boxShadow\s*:|box-shadow\s*:/;

/** DS §7 — motion: uses motion-* classes or transition-* utilities */
const MOTION_CLASS_RE = /\b(motion-|transition-|animate-|duration-|ease-)\S+/;

/** DS §8 State — Error state uses standard tokens */
const ERROR_TOKEN_RE = /\b(text-error|text-destructive|bg-error|bg-destructive)\b/;
const RAW_ERROR_RE = /\b(text-red-|bg-red-|text-rose-|border-red-)/;

/** DS §8 State — Empty state uses EmptyState component */
const EMPTY_STATE_IMPORT_RE = /EmptyState/;

/** DS §9 — Responsive: has at least one breakpoint class */
const RESPONSIVE_RE = /\b(sm:|md:|lg:|xl:|2xl:)\S+/;

/** DS §10 Forms — Input uses tokenized padding/font/radius */
const INPUT_TOKEN_RE =
  /\b(rounded-md|rounded-lg|rounded-input|font-normal|text-sm|text-base|px-3|py-2)\b/;

// ── Scanner ───────────────────────────────────────────────────────────────────

/**
 * Format a deduplicated sample of violation matches for readable notes.
 * Shows up to 3 unique examples.
 */
function formatSample(matches) {
  return [...new Set(matches)].slice(0, 3).join(', ');
}

/**
 * Collect all .tsx files (excluding test files) from a directory tree.
 */
function collectFiles(dir) {
  const abs = join(ROOT, dir);
  const results = [];
  for (const entry of readdirSync(abs)) {
    const full = join(abs, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(relative(ROOT, full)));
    } else if (extname(entry) === '.tsx' && !entry.endsWith('.test.tsx')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Audit a single file and return a compliance record.
 */
function auditFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const rel = relative(ROOT, filePath);
  const name = filePath.split('/').pop().replace('.tsx', '');

  const notes = [];

  // ── Typography ───────────────────────────────────────────────────────────
  const arbitraryFonts = (source.match(new RegExp(ARBITRARY_FONT_RE.source, 'g')) || []);
  const hasFontBold = FONT_BOLD_RE.test(source);
  const typographyCompliant = arbitraryFonts.length === 0 && !hasFontBold;
  if (arbitraryFonts.length > 0) {
    notes.push(`Typography: ${arbitraryFonts.length} arbitrary font-size(s) found: ${formatSample(arbitraryFonts)}`);
  }
  if (hasFontBold) {
    notes.push('Typography: font-bold used (reserved for marketing only — use font-semibold or font-medium)');
  }

  // ── Colors ───────────────────────────────────────────────────────────────
  const hexMatches = (source.match(new RegExp(HARDCODED_HEX_RE.source, 'g')) || []);
  const rawColorMatches = (source.match(new RegExp(RAW_COLOR_RE.source, 'g')) || []);
  const colorsCompliant = hexMatches.length === 0 && rawColorMatches.length === 0;
  if (hexMatches.length > 0) {
    notes.push(`Colors: ${hexMatches.length} hardcoded hex color(s): ${formatSample(hexMatches)}`);
  }
  if (rawColorMatches.length > 0) {
    notes.push(`Colors: ${rawColorMatches.length} raw Tailwind color literal(s): ${formatSample(rawColorMatches)}`);
  }

  // ── Spacing ──────────────────────────────────────────────────────────────
  const arbitrarySpacing = (source.match(new RegExp(ARBITRARY_SPACING_RE.source, 'g')) || []);
  const spacingCompliant = arbitrarySpacing.length === 0;
  if (arbitrarySpacing.length > 0) {
    notes.push(`Spacing: ${arbitrarySpacing.length} arbitrary spacing value(s): ${formatSample(arbitrarySpacing)}`);
  }

  // ── Radius ───────────────────────────────────────────────────────────────
  const arbitraryRadius = (source.match(new RegExp(ARBITRARY_RADIUS_RE.source, 'g')) || []);
  const radiusCompliant = arbitraryRadius.length === 0;
  if (arbitraryRadius.length > 0) {
    notes.push(`Radius: ${arbitraryRadius.length} arbitrary radius value(s): ${formatSample(arbitraryRadius)}`);
  }

  // ── Shadow ───────────────────────────────────────────────────────────────
  const inlineShadow = INLINE_SHADOW_RE.test(source);
  const shadowCompliant = !inlineShadow;
  if (inlineShadow) {
    notes.push('Shadow: inline boxShadow style detected — use shadow-* utility token instead');
  }

  // ── Motion ───────────────────────────────────────────────────────────────
  // A component is motion-compliant if it either has no interactive transitions
  // OR uses tokenized motion/transition utilities (not inline style transitions).
  const hasInlineTransition = /style=.*transition/i.test(source);
  const hasMotionToken = MOTION_CLASS_RE.test(source);
  const motionCompliant = !hasInlineTransition;
  if (hasInlineTransition) {
    notes.push('Motion: inline style transition detected — use transition-* / duration-* / ease-* tokens');
  }

  // ── State Consistency ────────────────────────────────────────────────────
  const hasRawErrorColor = RAW_ERROR_RE.test(source);
  const hasErrorToken = ERROR_TOKEN_RE.test(source);
  const hasEmptyStateRef = EMPTY_STATE_IMPORT_RE.test(source);
  // Detect if file likely renders an empty state without the component.
  // 'belum.*ada' is Indonesian ("not yet available") — this is a bilingual app.
  const likelyNeedsEmptyState = /empty|no.*data|no.*result|nothing.*here|belum.*ada/i.test(source) && !hasEmptyStateRef;
  const stateCompliant = !hasRawErrorColor && !likelyNeedsEmptyState;
  if (hasRawErrorColor && !hasErrorToken) {
    notes.push('State: raw red/rose color used for error — use text-error or text-destructive token');
  }
  if (likelyNeedsEmptyState) {
    notes.push('State: empty-state copy found but EmptyState component not imported — use <EmptyState>');
  }

  // ── Responsive ───────────────────────────────────────────────────────────
  const responsiveCompliant = RESPONSIVE_RE.test(source);
  if (!responsiveCompliant) {
    notes.push('Responsive: no breakpoint classes (sm:/md:/lg:) detected');
  }

  // ── Forms ────────────────────────────────────────────────────────────────
  const hasInputElement = /<(Input|input|Select|Textarea|textarea)\b/i.test(source);
  const formsCompliant = !hasInputElement || INPUT_TOKEN_RE.test(source);
  if (hasInputElement && !formsCompliant) {
    notes.push('Forms: input element found but no standard padding/font/radius token detected');
  }

  return {
    component_name: name,
    file_path: rel,
    typography_compliant: typographyCompliant,
    colors_compliant: colorsCompliant,
    spacing_compliant: spacingCompliant,
    radius_compliant: radiusCompliant,
    shadow_compliant: shadowCompliant,
    motion_compliant: motionCompliant,
    state_compliant: stateCompliant,
    responsive_compliant: responsiveCompliant,
    forms_compliant: formsCompliant,
    notes: notes.length > 0 ? notes : null,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const outputArgIdx = process.argv.indexOf('--output');
const outputFile = outputArgIdx !== -1 ? process.argv[outputArgIdx + 1] : null;

const allFiles = SCAN_PATHS.flatMap(collectFiles);
const report = allFiles.map(auditFile);

const json = JSON.stringify(report, null, 2);

if (outputFile) {
  writeFileSync(join(ROOT, outputFile), json, 'utf8');
  console.log(`✅ Design system audit written to ${outputFile} (${report.length} components)`);
} else {
  process.stdout.write(json + '\n');
}

// Print a summary to stderr so it's always visible
const failing = report.filter(
  (r) =>
    !r.typography_compliant ||
    !r.colors_compliant ||
    !r.spacing_compliant ||
    !r.radius_compliant ||
    !r.shadow_compliant ||
    !r.motion_compliant ||
    !r.state_compliant ||
    !r.responsive_compliant ||
    !r.forms_compliant
);

process.stderr.write(
  `\nDesign System Audit — ${report.length} components scanned, ${failing.length} non-compliant\n`
);
