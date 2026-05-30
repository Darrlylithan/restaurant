# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static single-page website for **Maison Lumière**, a fictional upscale French restaurant. No build tools, no frameworks, no dependencies — open `index.html` directly in a browser.

## Architecture

Three files, no compilation step:

- **`index.html`** — all markup. Sections in DOM order: `#hero` → `#menu` → `#testimonials` → `#reservations` → `footer`. Every interactive element uses semantic HTML with ARIA attributes.
- **`styles.css`** — all styles. Built on CSS custom properties defined in `:root` (colours, type scale, spacing, shadows). Mobile-first; breakpoints at `640px` and `1024px`. Section blocks appear in the same order as the DOM.
- **`script.js`** — single IIFE, five init functions called from `DOMContentLoaded`: `initNav`, `initScrollAnimations`, `initCarousel`, `initFormValidation`, `initCopyrightYear`.

## Key conventions

**Design tokens** — every colour, font, size, and shadow lives in `:root` custom properties in `styles.css`. Always use a token; never hardcode a raw value.

**Scroll animations** — add class `fade-in` to any element and it will animate in via IntersectionObserver. `nth-child(2/3/4)` stagger delays are already defined in CSS.

**Form validation** — `initFormValidation()` in `script.js` drives all field logic. Each required field must have `name`, `aria-describedby="<name>-error"`, and a paired `<span class="form-error" id="<name>-error">`. Add a new validator by adding an entry to the `validators` object keyed by `input.name`.

**Images** — all dish photos are Unsplash CDN URLs (`https://images.unsplash.com/photo-{ID}?w=800&q=80`). Hero uses `?w=1600&q=80` and must **not** have `loading="lazy"`. All other images must have `loading="lazy"` and a descriptive `alt` attribute.

**Nav state** — the header is transparent by default (overlays hero) and gains class `nav--scrolled` (solid charcoal) via JS once `window.scrollY > 80`. Both states are styled in CSS; JS only toggles the class.

**Carousel** — `initCarousel()` drives the testimonials via CSS `translateX` on `.carousel__track`. Autoplay pauses on `mouseenter`/`focusin` and resumes on `mouseleave`/`focusout`.

**Security** — the form success banner is written via `innerHTML`; user-supplied values are passed through `escapeHtml()` before insertion. Keep this pattern for any future `innerHTML` writes.
