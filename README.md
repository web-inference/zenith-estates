# Zenith Estates — Space to Live

A one-page site for a luxury real estate studio. It alternates black starfield sections with clean white editorial ones and uses an orb/planet motif throughout.

**Live:** https://web-inference.github.io/zenith-estates/

## Sections
Preloader · Hero · Stats · About · Services · Featured Properties · Places · Plans · Reviews · Market Data · Results · Team · Journal · FAQ · Contact & Footer

## Motion
- Smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis)
- [GSAP 3.13](https://gsap.com) with ScrollTrigger and SplitText:
  - section titles that sharpen from a blur as they rise
  - a paragraph that darkens word by word
  - number count-ups
  - stacked property cards
  - a sideways-scrolling neighborhoods row
  - a white planet that rises and shrinks before the pricing
  - a team carousel with a moon-phase reveal
  - charts that draw themselves in
  - pixel-block image reveals
- A canvas starfield that twinkles and shifts with the mouse
- A blend-mode cursor and buttons that pull toward the cursor
- Turns the motion off when the device is set to reduce motion

## Run locally
It's a static site with no build step:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

All names, prices and contact details are placeholders. The images are AI-generated.
