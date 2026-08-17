# Design QA

**Source visual truth**

- Desktop hero: `/Users/yapil/0/yapil new/source-desktop-top.png`
- Desktop archive: `/Users/yapil/0/yapil new/source-desktop-archive-settled.png`
- Mobile hero: `/Users/yapil/0/yapil new/source-mobile-hero.png`
- Mobile archive: `/Users/yapil/0/yapil new/source-mobile-archive.png`

**Implementation evidence**

- Desktop hero: `/Users/yapil/0/yapil new/inspiring-home/implementation-desktop-hero.png`
- Desktop archive: `/Users/yapil/0/yapil new/inspiring-home/implementation-desktop-archive.png`
- Mobile hero: `/Users/yapil/0/yapil new/inspiring-home/implementation-mobile-hero.png`
- Mobile archive: `/Users/yapil/0/yapil new/inspiring-home/implementation-mobile-archive.png`
- Combined comparison: `/Users/yapil/0/yapil new/inspiring-home/qa-comparison.png`

**Viewport and normalization**

- Desktop source and implementation: 1440 × 1000 CSS px, 1440 × 1000 output pixels, device scale factor 1.
- Mobile source and implementation: 390 × 844 CSS px, 390 × 844 output pixels, device scale factor 1.
- Same home/archive states were compared without browser chrome or density scaling.

**Full-view comparison evidence**

- Hero composition, archive composition, and responsive mobile states were viewed together in `qa-comparison.png`.
- The post-fix captures align the hero title, subtitle, CTA, chrome, archive card grid, footer, and mobile menu affordance with the source hierarchy.

**Focused region comparison evidence**

- Hero typography: Instrument Serif is the downloaded source font; DM Sans is the downloaded source UI font. Desktop title renders at 100/97 px and mobile at 42/40 px, preserving the source wrapping and mint underlines.
- Archive cards: real downloaded source imagery and avatars are used with matching grayscale treatment, dark teal surfaces, small radii, staggered rotations, and source-like author metadata.
- Background: the live WebGL canvas could not be copied as a file, so it was replaced with a project-local raster generated from the captured source art direction. It contains no UI or text and is used responsively as the full-viewport background.
- Detail/share states: panel width, white surface, serif display hierarchy, close control, fields, and blurred archive backdrop were visually checked against the captured source states.

**Findings**

- No actionable P0/P1/P2 issues remain.
- Fonts and typography: passed; source font files, weights, scale, line height, wrapping, and hierarchy match.
- Spacing and layout rhythm: passed; the 1440 × 1000 and 390 × 844 compositions preserve source margins, vertical centering, card density, footer positioning, and tap targets.
- Colors and tokens: passed; deep teal/black background, white foreground, mint accents, translucent borders, and grayscale card imagery match the captured palette.
- Image quality and asset fidelity: passed; all visible card covers, avatars, noise, favicon, and fonts are local source assets. The unavailable WebGL shader is the only replaced asset and uses a local, reference-derived raster.
- Copy and content: passed for the homepage, archive, representative detail, share form, and mobile menu states.
- Icons and controls: passed; close, menu, language, share, and navigation controls are present and keyboard reachable.
- Accessibility: semantic buttons/dialogs, Escape-to-close, reduced-motion handling, labels/placeholder guidance, contrast, and practical mobile targets are present.

**Comparison history**

1. Initial comparison found P2 drift: overly strong CSS light rays, mobile hero content about 28 px too high, desktop cards too regular/large, and a persistent focused logo outline. Fixes: moved the mobile hero down, corrected focus behavior, staggered/rotated the archive grid, and normalized card dimensions.
2. Second comparison found P2 asset drift because the source background is a live WebGL canvas and the CSS approximation did not preserve its subtle glow/scratches. Fix: created a local raster replacement from the captured source background and removed the CSS-drawn rays.
3. Post-fix evidence: `qa-comparison.png` plus the final same-size implementation screenshots listed above. No P0/P1/P2 findings remain.

**Primary interactions tested**

- Hero text parallax: pointer movement tilts the complete text group as one perspective plane on the X/Y axes; the label, headline, copy, and CTA retain distinct Z-depths. Touch/reduced-motion layouts remain static.
- Hero CTA → archive.
- Archive story card → detail panel → close.
- Share your inspiration → form panel → close.
- Mobile hamburger → menu.
- Home/logo navigation and Escape-to-close.
- Browser console checked: no errors or warnings.

**Follow-up polish**

- P3: the original WebGL background and card field have additional shader-driven depth; the local version preserves the visible art direction with a static raster background while the hero text retains live pointer-reactive depth.

final result: passed
