# Design QA — About composition

## Evidence

- Source visual truth: `/var/folders/zg/067pss8x4cx8tmjgqbhz4l5h0000gn/T/codex-clipboard-93d6b446-56e8-497f-bd89-8960a4f7d2a9.png`
- Browser-rendered desktop implementation: `about-composition-desktop.png`
- Browser-rendered mobile implementation: `about-composition-mobile.png`
- Combined full-view comparison: `about-composition-qa.png`
- Route/state: `/#about`, dark theme, default state; first desktop card hover also tested.
- Desktop viewport: 1512 × 982 CSS px at device scale 1; implementation capture is 1512 × 982 px.
- Mobile viewport: 390 × 844 CSS px at device scale 1; implementation capture is 390 × 844 px.
- Source screenshot: 3024 × 1964 px. Its content region was cropped to 3024 × 1532 px and normalized to 1512 × 766 px, matching the likely 2× source density.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Header and cards use the same four desktop tracks: brand/section label on the left, lead across the center two, year headline on the right.
- The vertical rhythm matches the reference: compact header, tall illustration band, separated copy band, and continuous column rules.
- Typography intentionally keeps Yapil's Inter Tight + Oranienbaum system instead of copying the reference's monospaced headings.
- Generated illustrations are sharp, share one art direction, and use true transparency; no square raster mats are visible.
- All original Russian card copy is present. Decorative card numbers were removed because they are absent from the selected reference.
- Text wraps without clipping at both tested breakpoints.
- Mobile collapses to one column with no horizontal overflow (`scrollWidth` equals the 390 px viewport width).
- Browser console: no errors.
- Hover test: the first illustration applies the expected translated/scaled transform without shifting the card layout.

## Focused Region Comparison

The mobile capture checks the stacked header, wrapping, dividers, transparent illustrations, and the first card at 390 px. The desktop capture keeps the full four-column composition and card copy readable.

## Comparison History

- Pass 1: the combined comparison exposed dark rectangular image mats around the generated illustrations (P2).
- Fix: converted the four WebPs to alpha-backed assets and reduced their scale to match the source's breathing room.
- Pass 2: the updated combined comparison shows no image mats and no remaining P0/P1/P2 differences.

## Follow-up Polish

- [P3] If an even closer Armory-like tone is desired later, the card headings could use a separate mono face. It is intentionally omitted now to preserve the site's existing typography.

## Implementation Checklist

- [x] Shared four-column header and card grid
- [x] Two-column tablet layout
- [x] One-column mobile layout
- [x] Transparent line-art assets and dotted texture
- [x] Responsive copy and image cropping
- [x] Hover state
- [x] Build, browser render, overflow, and console checks

final result: passed
