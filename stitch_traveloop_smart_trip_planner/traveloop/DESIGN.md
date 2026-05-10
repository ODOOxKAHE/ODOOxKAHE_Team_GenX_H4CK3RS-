---
name: Traveloop
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#400010'
  on-tertiary-container: '#da586c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
This design system embodies the spirit of a modern explorer: disciplined and reliable, yet fueled by a sense of wonder. The aesthetic is rooted in **Corporate / Modern** principles—ensuring trust for complex trip logistics—while integrating **Minimalist** airy layouts to evoke the freedom of travel. 

The visual language balances professional stability with adventurous energy. It targets high-intent travelers who seek a platform that feels as organized as a premium concierge but as inspiring as a luxury travel magazine. The emotional goal is to move the user from the stress of planning to the excitement of the journey through clear information architecture and optimistic visual accents.

## Colors
The palette is designed to transition users from logistical planning to tropical dreaming.

*   **Deep Navy (Primary):** Used for primary text, navigation backgrounds, and core structural elements to establish authority and trust.
*   **Vibrant Teal (Secondary):** Applied to interactive elements, icons, and progress indicators to inject a refreshing, coastal energy.
*   **Warm Coral (Accent):** Reserved exclusively for high-priority Call-to-Actions (CTAs) and "Book Now" triggers to provide a warm, inviting contrast.
*   **Neutrals:** A range of cool slates and off-whites are used to maintain the "airy" feel and provide high legibility for long itineraries.

## Typography
**Plus Jakarta Sans** is the sole typeface for this design system, chosen for its modern, geometric clarity and friendly open counters. 

Headlines utilize tighter letter-spacing and heavier weights to command attention and feel "adventurous." Body copy is set with generous line-height to ensure readability during intensive trip planning. Labels are often uppercase with slight letter-spacing to provide a clean, architectural feel to metadata and categories.

## Layout & Spacing
This design system employs a **Fixed Grid** model on desktop with a 1280px maximum container to prevent eye strain on ultra-wide monitors. 

The spacing philosophy follows a **progressive rhythm**:
*   **Desktop:** 12-column grid with 24px gutters. Use wide 80px gaps between major sections to maintain an "airy" feel.
*   **Tablet:** 8-column grid with 20px gutters.
*   **Mobile:** 4-column grid with 16px margins. 

Whitespace is treated as a functional element—vertical margins between itinerary cards should be generous (minimum 24px) to avoid visual clutter and "planning fatigue."

## Elevation & Depth
Depth is conveyed through **Ambient Shadows**, avoiding harsh lines to maintain the friendly vibe. 

Surface tiers are defined as:
1.  **Level 0 (Background):** Solid `#F8FAFC`.
2.  **Level 1 (Cards/Content):** White surface with a subtle, diffused shadow (Blur: 20px, Y: 4px, Color: `rgba(15, 23, 42, 0.05)`).
3.  **Level 2 (Hover/Active):** Slightly more pronounced shadow with a hint of Navy tint to simulate physical lift.
4.  **Level 3 (Modals/Overlays):** Strongest depth with a dark backdrop blur (12px) to focus the user on critical planning tasks.

## Shapes
This design system uses a **Rounded** shape language to appear accessible and modern. 

Standard components (inputs, small buttons) use `0.5rem` (8px). Larger containers, such as destination cards and trip summary modules, use `rounded-lg` (16px) to soften the interface. High-level decorative elements or "pill" tags use `rounded-full` to provide visual variety and a "friendly" touch.

## Components

### Buttons & Chips
*   **Primary Button:** Deep Navy background, white text. Bold and authoritative.
*   **CTA Button:** Warm Coral background. Reserved for "Finalize" or "Book" actions.
*   **Secondary/Outlined:** Teal border and text. Used for "Add to Itinerary" or "View Map."
*   **Chips:** Rounded-full. Used for travel tags (e.g., "Beach," "Budget," "Hiking") using light Teal tints with dark Teal text.

### Cards
Destination and activity cards should feature a top-heavy layout with high-quality imagery. The bottom content area uses white backgrounds with subtle elevation. Titles are Headline-MD, with price or duration labels in Teal.

### Trip Timelines
The timeline is a vertical track. Use a 2px secondary Teal line as the spine. Nodes are Navy circles with white centers. Each "stop" in the timeline is a Level 1 card with internal padding of 24px.

### Budget Visualization
Charts should use a clean, thin-stroke aesthetic.
*   **Donut Charts:** Use Primary Navy for fixed costs (Flights), Secondary Teal for experiences, and Accent Coral for food/drink.
*   **Progress Bars:** Thin 4px tracks with rounded ends to visualize remaining budget.

### Input Fields
Soft Slate-200 borders, turning Navy on focus. 0.5rem corner radius. Labels sit above the field in Label-SM weight.