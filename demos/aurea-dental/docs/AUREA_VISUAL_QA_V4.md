# AUREA — V4 validation (2026-10-01)

## Evidence and fixes

The review began with desktop 1440×1080 and mobile 390×844 screenshots of the previous preview. Valid evidence showed an inset hero, two dominant dark actions, phone CTA below the first screen, very faint journey labels and overlapping scene navigation. Immediate screenshots taken before lazy imagery or scrolling settled were rejected.

The owner's review additionally rejected the reference's copied composition, small type and rapid animated anchor navigation. V4 replaces those rules rather than fine-tuning the copied motion sequence.

| Area | Result |
|---|---|
| Hero | Full viewport height (1080 desktop, 844 mobile); primary CTA ends at y=730 on mobile |
| Section flow | Desktop bounds are consecutive; no negative overlap (offset rounding can differ by 1px) |
| Palette/type | Cream/forest colors; Georgia headings and locally bundled Manrope; readable body sizing |
| Journey | All five steps exist in natural flow; columns on desktop and rows on phone/tablet |
| Header/menu | Persistent header; mobile menu opens, closes on destination and releases scroll lock |
| Services | Clicking Dental Implants and paging down retains that selection |
| Doctors | Rapid four-doctor switching leaves one visible biography and the correct selected tab; Home works |
| Results | Tablet uses one column; divider responds to ArrowRight |
| FAQ | Second question opens through its button |
| Booking | Sample submission completes; no sending or real booking; current demo button works |
| Widths | No horizontal document overflow at 390, 834 and 1440px |
| Build | Astro check: 0 errors/warnings/hints; static build: 5 routes |

Images were reviewed in the local Cloudflare Worker browser with the deployed CSP. Current screenshots: desktop hero, desktop team, mobile hero/menu/journey and tablet comparison. The reference video was unavailable in this workspace; the review used the shipped implementation, screenshots, documented V3 rules and the owner's description. This is targeted remediation, not a claim of exhaustive device or performance coverage.

Reduced-motion and no-JavaScript fallback structure remains intact. The previous functional smoke suite had passed; this turn additionally exercised the interactions and viewport changes listed above. No new performance benchmark was run.
