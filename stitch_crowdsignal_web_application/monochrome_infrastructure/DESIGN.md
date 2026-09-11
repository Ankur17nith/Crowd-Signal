---
name: Monochrome Infrastructure
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c7c6c6'
  on-secondary: '#2f3131'
  secondary-container: '#484949'
  on-secondary-container: '#b8b8b8'
  tertiary: '#ffffff'
  on-tertiary: '#00315b'
  tertiary-container: '#d3e4ff'
  on-tertiary-container: '#0066b3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#d3e4ff'
  tertiary-fixed-dim: '#a2c9ff'
  on-tertiary-fixed: '#001c38'
  on-tertiary-fixed-variant: '#004881'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  metric-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  metric-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.015em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes an ultra-refined, utilitarian aesthetic engineered for high-density financial and technical infrastructure. Drawing structural clarity, conversational ergonomics, and focused quietness from modern AI tool interfaces, it deliberately rejects sensory decoration: zero gradients, zero decorative blurs, zero glow effects, and zero colored cast shadows.

The tone is authoritative, sober, and frictionless. Every visual mark must communicate pure function. The interface prioritizes deep spatial rhythm, strict monochromatic layering, razor-sharp 1px boundary lines, and unambiguous typographic hierarchy. High-signal information density is balanced by deliberate, breathing structural gutters—giving quantitative operators the cognitive bandwidth to read market shifts, execute complex flows, and monitor critical telemetry without visual fatigue.

## Colors

The palette is engineered strictly on an opaque monochromatic slate foundation, accented solely by semantic indicators. Gradients of any format (linear, radial, conic, mesh) are categorically forbidden. Surfaces rely on precise lightness shifts:

- **Canvas Background**: `#0D0D0D` (the base environment)
- **Primary Surface**: `#141414` (primary cards, work areas, panels)
- **Secondary Surface**: `#1A1A1A` (inset controls, headers, toolbars)
- **Hover Surface**: `#202020` (interactive highlight state)
- **Active / Pressed Surface**: `#262626`
- **Border Default**: `#292929` (crisp 1px boundary)
- **Border Subtle**: `#202020` (dividers and secondary separation)
- **Text Primary**: `#F5F5F5` (headings, high-emphasis metrics)
- **Text Secondary**: `#A1A1A1` (labels, body copy, descriptions)
- **Text Muted**: `#707070` (table column headers, inactive states, metadata)

### Semantic Accents
Color is deployed with extreme restraint, never exceeding 2% to 5% of viewport coverage:
- **Up / Bullish / Positive**: `#4DA3FF` (applied only to delta labels, micro line charts, and upward metric indicators)
- **Down / Bearish / Caution**: `#E7A94B` (warm amber applied only to negative deltas, loss states, and system warnings)

## Typography

Inter serves across all headline, body, and label roles to guarantee neutral, uncompromising legibility. 

- **Tabular Figures**: Every numeric financial figure, metric display, timestamp, and tabular column must force the CSS rule `font-variant-numeric: tabular-nums lining-nums`. This prevents horizontal jitter during live ticker refreshes and guarantees perfect vertical alignment across ledger columns.
- **Micro-Weighting**: Avoid ultra-bold weights. Typography tops out at `600` (Semi-Bold) for major structural headers and key balances. Body text and narrative prompts use `400` (Regular), while interface metadata, pill counters, and table headers use `500` (Medium).

## Layout & Spacing

The layout model is a disciplined, responsive 12-column grid structured for high-density tools:

- **Desktop (1280px+)**: 12 columns, 24px (`1.5rem`) gutters, 32px (`2rem`) outer canvas margins. Centered primary workspace capped at 1440px max-width, or full-width docked multi-pane split for terminal and dashboard layouts.
- **Tablet (768px - 1279px)**: 8 columns, 16px (`1rem`) gutters, 24px outer margins. Collapsible left navigation drawer collapses to a 56px icon rail.
- **Mobile (Under 768px)**: 4 columns, 16px gutters, 16px outer margins. Split views convert strictly to stacked card flows or tabbed segments.

Spacing follows an unambiguous 4px/8px modular cadence. Inset components prioritize lean padding (`space-sm` to `space-md`) to ensure dense data remains visible above the fold without scrolling, while large structural divisions maintain clear `space-xl` separation.

## Elevation & Depth

This system avoids decorative cast shadows, colored glow drop-shadows, and frosted glass/backdrop filters. Depth is communicated strictly through planar tonal hierarchy and crisp low-contrast 1px outlines:

- **Base Layer (Elevation 0)**: `#0D0D0D` canvas background.
- **Inset / Recessed Wells**: `#0A0A0A` with a 1px border of `#202020` for input search bars, code blocks, and ticker rails.
- **Surface Cards & Panels (Elevation 1)**: Solid `#141414` backed by a sharp 1px border in `#292929`. Completely opaque; no blur or opacity blending.
- **Raised Popovers & Dropdowns (Elevation 2)**: Solid `#1A1A1A` with a 1px border in `#292929`. Supported solely by an ambient, completely desaturated, dark falloff shadow: `0px 8px 24px rgba(0, 0, 0, 0.6)`. No tinted or colored ambient light.
- **Modals & Overlays (Elevation 3)**: Solid `#1A1A1A` border `#333333`, shadow `0px 16px 36px rgba(0, 0, 0, 0.75)`. Screen backdrop is an opaque-feel dim of `rgba(0, 0, 0, 0.7)` with zero backdrop-filter blur.

## Shapes

The geometric architecture balances modern ergonomics with precision instrumentation. All corner radii sit strictly between 6px and 10px:

- **Micro Controls, Badges, and Table Tags**: 6px radius (`0.375rem`).
- **Standard Buttons, Form Inputs, and Dropdown Menus**: 8px radius (`0.5rem`).
- **Cards, Modules, and Main Data Tables**: 10px radius (`0.625rem`).
- **Dialogs and Modals**: 10px radius (`0.625rem`).

Full pill radius (`rounded-full`) is reserved exclusively for system notification dots and inline delta chips.

## Components

### Buttons
- **Primary**: Background `#F5F5F5`, text `#0D0D0D`, font weight 500, height 36px (desktop) or 40px (touch). Hover background `#E5E5E5`. No shadow.
- **Secondary**: Background `#1A1A1A`, border 1px solid `#292929`, text `#F5F5F5`. Hover background `#202020`, border `#383838`.
- **Tertiary / Ghost**: Transparent background, text `#A1A1A1`. Hover background `#1A1A1A`, text `#F5F5F5`.

### Input Fields & Search Bars
- Background `#141414` (resting) or `#0D0D0D` (nested inside `#141414` cards).
- 1px solid border `#292929`. 8px border radius.
- Text `#F5F5F5`, placeholder `#707070`.
- **Focus State**: 1px border `#F5F5F5` or `#4DA3FF`. Never use an outer fuzzy focus ring or glow; rely on a clean 1px border switch.

### Data Cards & Panels
- Background `#141414`, border 1px solid `#292929`, radius 10px.
- Internal padding: 16px (`1rem`) to 20px (`1.25rem`).
- Flat, completely opaque presentation with high-contrast metric presentation.

### Chips & Semantic Indicators
- **Positive Delta Chip**: Background `rgba(77, 163, 255, 0.1)`, text `#4DA3FF`, 0 border or 1px subtle `rgba(77, 163, 255, 0.2)`. Tabular figures only.
- **Negative Delta Chip**: Background `rgba(231, 169, 75, 0.1)`, text `#E7A94B`, 0 border or 1px subtle `rgba(231, 169, 75, 0.2)`. Tabular figures only.
- **Neutral Filter Tag**: Background `#1A1A1A`, border 1px solid `#292929`, text `#A1A1A1`.

### Lists & Financial Tables
- Header cells: `#707070`, 11px uppercase (`label-xs`), letter spacing `0.02em`, height 36px, bottom border 1px solid `#202020`.
- Row cells: Height 44px, bottom border 1px solid `#1A1A1A`.
- Row hover: Background `#1A1A1A`.
- Numeric values right-aligned with `tabular-nums`.

### Checkboxes & Switches
- Checkbox frame: 16px × 16px, 4px corner radius, background `#141414`, 1px border `#292929`.
- Checked state: Background `#F5F5F5`, check icon `#0D0D0D` (no accent color required for standard boolean selections).
- Switch track: 36px × 20px, background `#202020`, 1px border `#292929`. Thumb 16px circle `#F5F5F5`. Checked track `#F5F5F5`, thumb `#0D0D0D`.