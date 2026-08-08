---
name: Deep Forest Glass
colors:
  surface: '#141404'
  surface-dim: '#141404'
  surface-bright: '#3b3a25'
  surface-container-lowest: '#0f0f02'
  surface-container-low: '#1d1c0a'
  surface-container: '#21200d'
  surface-container-high: '#2b2b17'
  surface-container-highest: '#363621'
  on-surface: '#e7e4c5'
  on-surface-variant: '#bfc8cb'
  inverse-surface: '#e7e4c5'
  inverse-on-surface: '#32311d'
  outline: '#8a9295'
  outline-variant: '#40484b'
  surface-tint: '#94cfe2'
  primary: '#94cfe2'
  on-primary: '#003641'
  primary-container: '#105666'
  on-primary-container: '#8ec9dc'
  inverse-primary: '#276676'
  secondary: '#b8cf88'
  on-secondary: '#243600'
  secondary-container: '#3c4f17'
  on-secondary-container: '#aac17c'
  tertiary: '#f8b7ac'
  on-tertiary: '#4d251e'
  tertiary-container: '#71423a'
  on-tertiary-container: '#f1b1a6'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b0ecff'
  primary-fixed-dim: '#94cfe2'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5e'
  secondary-fixed: '#d3eca2'
  secondary-fixed-dim: '#b8cf88'
  on-secondary-fixed: '#141f00'
  on-secondary-fixed-variant: '#3a4d15'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#f8b7ac'
  on-tertiary-fixed: '#34100b'
  on-tertiary-fixed-variant: '#683a33'
  background: '#141404'
  on-background: '#e7e4c5'
  surface-variant: '#363621'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
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
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  metrics-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system embodies a "Dark Luxury Agritech" aesthetic, blending the organic depth of nature with cutting-edge artificial intelligence. It targets high-end agricultural stakeholders and enterprise farm managers who require a sophisticated, data-rich environment that feels premium and reliable.

The style is a hybrid of **Minimalism** and **Glassmorphism**, set against a **Deep Forest Obsidian** canvas. It utilizes depth through translucency rather than heavy shadows, creating a UI that feels like an advanced command center viewed through frosted architectural glass. The emotional response should be one of calm control, high-tech precision, and organic growth.

## Colors
The palette is rooted in a dark, botanical foundation.

- **Primary (Midnight Teal):** Used for primary brand elements and core navigation.
- **Secondary (Moss Green):** Represents growth, health, and positive data trends.
- **Tertiary (Terracotta Rosy Brown):** Used sparingly for alerts, negative trends, or critical interruptions, providing a warm contrast to the cool teal tones.
- **Neutrals:** **Warm Cream Parchment** is the primary text color to ensure high legibility and a premium feel, while **C8D6AF** serves as the secondary text for metadata.
- **Glow States:** Active components and data points use a **Neon Teal (#1A7A90)** outer glow to simulate high-tech illumination.

## Typography
The system uses a dual-font approach to balance character with utility. 

**Outfit** is used for headlines to provide a modern, geometric, and luxurious feel. **Plus Jakarta Sans** is the workhorse for UI, metrics, and body text, chosen for its exceptional readability in dense data environments. 

For mobile devices, `display-lg` should scale down to 32px and `metrics-xl` to 28px to maintain composition balance. All labels use a slight tracking (letter-spacing) increase to enhance clarity against dark, blurred backgrounds.

## Layout & Spacing
The layout follows a **fluid grid** system. Desktop views utilize a 12-column grid with generous 24px gutters to allow the glass backgrounds to breathe. 

Spacing is based on a 4px baseline, with standard increments (8, 16, 24, 40, 64) defining the rhythm between sections. On mobile, margins reduce to 16px, and the grid collapses to a single-column flow with horizontal scrolling cards for data visualization.

## Elevation & Depth
Depth is created through transparency and optical layering rather than traditional drop shadows.

1.  **Background Layer:** Deep Forest Obsidian (#051C13).
2.  **Surface Layer:** 25% Midnight Teal with a 12px backdrop-blur. 
3.  **Bordering:** Every elevated surface features a 1px solid border of Moss Green at 25% opacity (`rgba(131, 153, 88, 0.25)`), acting as a "rim light" that defines the edge of the glass.
4.  **Active Elevation:** Elements in an active or hovered state receive a subtle neon outer glow using #1A7A90 with a 15px spread and 0.4 opacity.

## Shapes
The shape language is consistently rounded to soften the high-tech edge, mirroring organic growth forms. 

The standard corner radius for cards, buttons, and input fields is **16px**. Small components like chips or checkboxes use a **4px** radius. The "Glass" effect must always be accompanied by the 12px backdrop-blur to ensure text legibility over complex background gradients or data visualizations.

## Components
- **Buttons:** Primary buttons are solid Midnight Teal with Warm Cream text. Secondary buttons are ghost-style with the 1px Moss Green border. Active states trigger the Neon Teal glow.
- **Cards:** Use the Frosted Glass surface (25% teal, 12px blur). Padding is consistently 24px.
- **Input Fields:** Semi-transparent background (10% opacity) with the 1px border. On focus, the border opacity increases to 100% and a subtle inner glow is applied.
- **Chips/Badges:** Pill-shaped (fully rounded) with a low-opacity Moss Green fill for "Healthy" statuses and Terracotta for "Alerts."
- **Data Visualizations:** Line charts should use the Neon Teal for primary data paths, with a subtle gradient fill underneath.
- **Progress Indicators:** Use the Moss Green for growth-related progress, appearing as a "glowing vine" or bar.