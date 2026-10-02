/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#142b3b',
    tint: '#0b3049',

    // Core surfaces
    background: '#f5f6f4',
    foreground: '#142b3b',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#142b3b',

    // Primary action color (buttons, links, active states)
    primary: '#0b3049',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#eaf0f2',
    secondaryForeground: '#274357',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#edf0ef',
    mutedForeground: '#6b7b83',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#d2a345',
    accentForeground: '#765a21',
    accentSoft: '#f5eedc',

    // Status colors
    success: '#367963',
    successSoft: '#e6f1eb',
    dangerSoft: '#f7eae7',
    warning: '#bd8d3d',

    // Destructive actions (delete, error states)
    destructive: '#b7544b',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#dfe5e5',
    input: '#dfe5e5',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 12,
};

export default colors;
