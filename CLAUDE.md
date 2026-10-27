# Keeper — Claude Design & Styling Instructions

You are an expert UI/UX designer and React/MUI developer working on **Keeper**, a personal bookmarking app. Your goal is to create a clean, comfortable, visually delightful mobile-first experience.

---

## App Overview

Keeper lets users save and organize bookmarks ("products") with titles, descriptions, images (via Open Graph), and categories. It is a **personal, everyday-use app** — the design should feel calm, organized, and lightly expressive, not corporate or flashy.

---

## Tech Stack

- React
- MUI v5 (`@mui/material`) with `createTheme`
- Mobile-first, used primarily on small screens

---

## MUI Theme

The primary color is **deep purple** (`palette.primary.main`). Current approximate value: `#5e2d91` (adjust if the exact hex differs in code).

When modifying or extending the theme, always work within `createTheme` — never hardcode the primary color inline. Reference it as `theme.palette.primary.main`, `primary.light`, `primary.dark`, etc.

Suggested theme shape to maintain consistency:

```js
createTheme({
  palette: {
    primary: {
      main: '#5e2d91',       // deep purple — can be adjusted
      light: '#9c6bc4',
      dark: '#3b1a5e',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 12,         // rounded feel throughout
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", sans-serif',
    fontWeightMedium: 500,
  },
})
```

---

## Category Label Colors

Category chips/labels must be **colorful but follow accessible color rules**:

- Each category gets a **fixed, deterministic color** based on its name (use a hash function, not random)
- Use a **curated pastel palette** — never neon, never grayscale
- Text color must **always pass WCAG AA contrast** against its background chip color
- Use `color` for the chip border and text, and a **10–15% opacity tint** of the same color as background

### Suggested palette pool for category colors:
```js
const CATEGORY_COLORS = [
  { bg: '#fce4ec', text: '#880e4f' }, // rose
  { bg: '#e8f5e9', text: '#1b5e20' }, // green
  { bg: '#e3f2fd', text: '#0d47a1' }, // blue
  { bg: '#fff8e1', text: '#e65100' }, // amber
  { bg: '#f3e5f5', text: '#4a148c' }, // purple
  { bg: '#e0f7fa', text: '#006064' }, // teal
  { bg: '#fbe9e7', text: '#bf360c' }, // deep orange
  { bg: '#ede7f6', text: '#311b92' }, // deep purple
];

// Assign by hashing the category name string:
function getCategoryColor(name) {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}
```

Apply to MUI `<Chip>` like:
```jsx
<Chip
  label={category}
  size="small"
  sx={{
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 500,
    border: `1px solid ${color.text}22`,
    borderRadius: '20px',
  }}
/>
```

---

## Product Cards (Mobile Layout Fix)

Cards are currently overflowing on mobile. Follow these rules:

- Card width must be `100%` — never use fixed pixel widths
- Images inside cards: use `aspect-ratio: 4/3` or `aspect-ratio: 16/9`, `width: 100%`, `object-fit: cover`
- Card container should use `display: flex; flex-direction: column`
- Add `overflow: hidden` to the card root to prevent bleed
- Padding inside cards: `16px` on mobile, `20px` on desktop
- Title: single line with `text-overflow: ellipsis; overflow: hidden; white-space: nowrap`

```jsx
<Card sx={{
  width: '100%',
  borderRadius: 3,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
}}>
  <CardMedia
    component="img"
    image={imageUrl}
    sx={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
  />
  <CardContent sx={{ p: 2 }}>
    <Typography noWrap variant="subtitle1" fontWeight={600}>{title}</Typography>
    ...
  </CardContent>
</Card>
```

---

## General Design Rules

### Spacing & Layout
- Use MUI `spacing` scale — avoid arbitrary pixel values
- Mobile content padding: `16px` horizontal
- Section gaps: `spacing(2)` to `spacing(3)`
- List/grid of cards: `display: flex; flex-direction: column; gap: spacing(2)` on mobile

### Typography
- Page titles (e.g. "Settings", "Edit Product"): `variant="h5"` or `h6`, `fontWeight: 600`
- Section labels (e.g. "PROFILE", "MY CATEGORIES"): `variant="overline"`, `letterSpacing: 1.2`, muted color
- Body text: `variant="body2"`, color `text.secondary` for supporting info
- Avoid all-caps except for `overline` labels

### Buttons
- Primary actions (Save, Update): `variant="contained"` with `primary` color, `borderRadius: 2`
- Secondary/cancel: `variant="text"` with `primary` color — no outline unless needed
- Destructive actions (Delete account): `color="error"`, `variant="outlined"` — keep it clearly distinct but not alarming

### Form Fields
- Use `variant="outlined"` consistently
- `borderRadius` on inputs should match global `shape.borderRadius`
- Helper text (e.g. `6/20` character count): `variant="caption"`, `color="text.disabled"`

### Filter Chips (category tabs)
- Active chip: `variant="filled"` with `primary` color
- Inactive: `variant="outlined"` with muted border, `color="default"`
- Scrollable row with `overflow-x: auto`, no visible scrollbar (`scrollbar-width: none`)

### Floating Action Button (+ button)
- Position: `fixed`, bottom-right, `bottom: 24px; right: 24px`
- Size: MUI default FAB size
- Color: `primary`
- Add subtle `box-shadow` elevation

---

## Accessibility

- All interactive elements must have visible focus states — do not suppress `outline` without a replacement
- Contrast ratio for text: minimum 4.5:1 (WCAG AA)
- Icon-only buttons must have `aria-label`
- Color alone must never be the only indicator of state (e.g. active filter chip should also change weight/fill, not just color)

---

## What to Avoid

- Do not use `sx={{ color: '#5e2d91' }}` inline — use `color="primary"` or `sx={{ color: 'primary.main' }}`
- Do not set fixed `width` or `height` in px on card or image components
- Do not use `!important` in `sx` props
- Do not use random colors for categories — always derive from the hash function
- Do not mix `variant="outlined"` and `variant="contained"` for the same action type across different screens
