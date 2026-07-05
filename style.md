# THE PARTY — Design Reference Sheet

---

## Color Palette

### Backgrounds

|Name|Hex|RGB|Role|
|---|---|---|---|
|Void|`#0a0e2a`|`10, 14, 42`|Primary background, deep space navy|
|Smoke|`#141834`|`20, 24, 52`|Card/panel backgrounds, stage floor|
|Haze|`#1c2148`|`28, 33, 72`|Elevated surfaces, dialogue bubbles|

### Accents

|Name|Hex|RGB|Role|
|---|---|---|---|
|Pulse|`#ff018f`|`255, 1, 143`|Primary accent — hot pink, buttons, highlights|
|Ultraviolet|`#7b2fff`|`123, 47, 255`|Secondary accent — purple, glows, gradients|
|Cyan Wash|`#00e5ff`|`0, 229, 255`|Tertiary accent — ally relationship color|
|Ember|`#ffcc00`|`255, 204, 0`|Warm pop — sparingly, party end, disco ball|

### Relationship Colors

|Name|Hex|RGB|Role|
|---|---|---|---|
|Ally|`#00e5ff`|`0, 229, 255`|Ally interactions, friendly glow|
|Opposite|`#ff018f`|`255, 1, 143`|Opposite interactions, clash glow|
|Outlier|`#ffcc00`|`255, 204, 0`|Outlier moments|
|Neutral|`#6b6f99`|`107, 111, 153`|Neutral/muted interactions|

### Text

|Name|Hex|RGB|Role|
|---|---|---|---|
|White|`#f0f0ff`|`240, 240, 255`|Primary text, slightly blue-white|
|Mist|`#a0a4cc`|`160, 164, 204`|Secondary text, credits, captions|
|Dim|`#5a5e88`|`90, 94, 136`|Disabled/muted text|

---

## Typography

### Headings — Space Grotesk

- Source: Google Fonts (`https://fonts.google.com/specimen/Space+Grotesk`)
- Weights: 700 (bold), 500 (medium)
- Use: titles, artist names, "THE PARTY", event labels
- Tracking: -0.02em for large titles, 0 for smaller headings
- Why: geometric but not sterile, has personality without being gimmicky, reads well at massive sizes

### Body / Dialogue — Inter

- Source: Google Fonts (`https://fonts.google.com/specimen/Inter`)
- Weights: 400 (regular), 500 (medium)
- Use: dialogue lines, descriptions, UI text, buttons
- Why: neutral, legible at small sizes, doesn't compete with headings

### Credits / System — JetBrains Mono

- Source: Google Fonts (`https://fonts.google.com/specimen/JetBrains+Mono`)
- Weights: 400 (regular)
- Use: footer credits, "all rights reserved", loading text, timestamps
- Why: monospace reads as system/technical, fits the party-as-simulation vibe

---

## Type Scale

|Role|Size|Font|Weight|
|---|---|---|---|
|Hero title|96–128px|Space Grotesk|700|
|Page heading|48–64px|Space Grotesk|700|
|Section heading|28–32px|Space Grotesk|500|
|Artist name|20–24px|Space Grotesk|500|
|Body / dialogue|16–18px|Inter|400|
|Button text|16px|Inter|500|
|Caption / credits|13–14px|JetBrains Mono|400|

---

## Visual Effects

### Glow

- Dialogue bubbles: `box-shadow: 0 0 24px rgba(123, 47, 255, 0.3)`
- Active speaker: `box-shadow: 0 0 40px rgba(255, 1, 143, 0.4)`
- Ally highlight: `box-shadow: 0 0 32px rgba(0, 229, 255, 0.3)`

### Gradients

- Stage floor: `linear-gradient(180deg, #0a0e2a 0%, #1c2148 100%)`
- Button shimmer: `linear-gradient(135deg, #ff018f, #7b2fff, #00e5ff)`
- Loading state: `linear-gradient(90deg, #7b2fff, #ff018f)` animated

### Blur & Noise

- Background elements: `backdrop-filter: blur(40px)` for haze effects
- Film grain overlay: CSS noise texture at 3–5% opacity for texture
- Motion blur on characters: achieved via R3F post-processing or CSS

---

## CSS Variables (copy to index.css)

```css
:root {
  /* backgrounds */
  --bg-void: #0a0e2a;
  --bg-smoke: #141834;
  --bg-haze: #1c2148;

  /* accents */
  --accent-pulse: #ff018f;
  --accent-uv: #7b2fff;
  --accent-cyan: #00e5ff;
  --accent-ember: #ffcc00;

  /* relationships */
  --rel-ally: #00e5ff;
  --rel-opposite: #ff018f;
  --rel-outlier: #ffcc00;
  --rel-neutral: #6b6f99;

  /* text */
  --text-primary: #f0f0ff;
  --text-secondary: #a0a4cc;
  --text-dim: #5a5e88;

  /* fonts */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

## Signature Element

The disco ball as a 3D object reflecting relationship colors onto the stage — ally cyan, opposite pink, outlier amber. It pulses with track changes and spins faster during high-energy moments. The light reflections on the characters' faces shift color based on who's speaking.