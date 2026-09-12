# BÄRENGARTEN RAVENSBURG
## Design System & Experience Matrix Specification

**Document ID:** `BG-DS-001`  
**Version:** `0.1.0`  
**Status:** `WORKING_SPEC / DESIGN_DIRECTION`  
**Scope:** Brand expression, website, landing pages, digital product surfaces, hospitality touchpoints, exterior perception  
**Primary surfaces:** Homepage, Hotel, Restaurant, Biergarten, Events/Groups, Booking/Reservation, Mobile  
**Source context:** `baerengarten-company-brain-bundle-v0.1.0` + approved working moodboard/concept from current design exploration  
**Brand context status:** Source Company Brain remains `candidate_not_active`; this document does not activate governance or resolve open business decisions.

---

# 0. Purpose

This specification translates the current Bärengarten Ravensburg brand context into a coherent design system for digital and physical hospitality experiences.

The system must communicate one central tension:

> **Warm, human hospitality × precise, effortless utility.**

Bärengarten must not appear as:

- a generic business hotel,
- an anonymous luxury property,
- a folkloric/rustic German inn,
- an Alpine chalet brand,
- a beer-themed novelty venue,
- a zoo, animal sanctuary or nature park.

The desired perception is:

> **A contemporary Ravensburg host with culinary confidence, personal presence and unusually human hospitality.**

---

# 1. Brand Foundation → Design Translation

## 1.1 Source principles

| Source principle | Design translation | UI / touchpoint behavior |
|---|---|---|
| Qualität & Ehrlichkeit | restrained premium quality, no visual exaggeration | clear information, real photography, no inflated claims |
| Qualität vor Quantität | fewer, stronger elements | fewer cards, fewer CTAs, more whitespace, high image quality |
| Gast nicht als Umsatznummer | visible human presence | host/team imagery, humane microcopy, recovery states |
| persönliche Gastgeberpräsenz | people over facilities | documentary photography and direct language |
| hohe Speisenqualität | gastronomy as visual heart | food photography gets editorial priority |
| saubere Zimmer | calm, precise hotel presentation | uncluttered room imagery, simple room facts |
| gepflegter Gesamteindruck | disciplined system | strict spacing, type hierarchy, consistent materials |
| unkomplizierter Aufenthalt | low-friction interface | short booking paths, strong mobile affordances |
| außergewöhnlicher Ort | memorable but controlled identity | strong typography, signature color, bespoke iconography |
| „unvernünftige Gastfreundschaft“ | memorable emotional brand layer | expressive headlines, human moments, not operational promises by default |

---

# 2. Brand Expression Model

The identity uses four simultaneous modes.

| Mode | Role | Emotional level | Visual behavior | Typical surfaces |
|---|---|---:|---|---|
| **Host** | human warmth | high | portraiture, serif, warm light | homepage, about, service recovery |
| **Table** | culinary confidence | high | food, texture, dark green/wine accents | restaurant, menu, events |
| **Stay** | calm utility | medium | whitespace, sans-serif, structured UI | hotel, rooms, booking |
| **Garden** | social openness | high | daylight, greenery, groups, broad imagery | biergarten, seasonal campaigns |

### Rule
No page may operate in only one mode. The system should always combine **one emotional mode** with **one functional mode**.

Examples:

- Hotel page = `Stay + Host`
- Restaurant = `Table + Host`
- Biergarten = `Garden + Table`
- Homepage = `Host + Table + Stay + Garden`

---

# 3. Identity Architecture

## 3.1 Primary naming

**Primary:** `BÄRENGARTEN`  
**Location qualifier:** `RAVENSBURG`  
**Descriptor:** `HOTEL · RESTAURANT · BIERGARTEN`

Preferred lockup hierarchy:

```text
BÄRENGARTEN
RAVENSBURG
HOTEL · RESTAURANT · BIERGARTEN
```

## 3.2 Brand line candidates

### Working headline layer

- `UNVERNÜNFTIG GASTFREUNDLICH.`
- `QUALITÄT & EHRLICHKEIT.`

### Contextual messaging

- `Gastfreundschaft darf ein bisschen unvernünftig sein.`
- `Gute Küche. Gute Menschen. Gute Zeit.`
- `Ankommen. Durchatmen. Weiterkommen.`

### Content governance note
These are design-system copy candidates, not automatically approved public claims.

---

# 4. Logo System

## 4.1 Direction

Preferred identity structure:

1. Wordmark `BÄRENGARTEN`
2. Supporting `RAVENSBURG`
3. Optional abstract mark
4. Descriptor lockup

## 4.2 Bear principle

A bear is permitted only as:

- a reduced heraldic symbol,
- an abstract negative-space cue,
- a subtle element integrated into a `B` monogram,
- a secondary seal or signage mark.

### Forbidden bear treatments

- cartoon mascot,
- realistic bear photography,
- paw-print icon language,
- zoo/nature-reserve symbolism,
- mountains + bear + pine-tree compositions,
- craft-beer lumberjack clichés.

## 4.3 Preferred mark concept

`BG-MARK-A`: **B monogram with latent bear silhouette**

Properties:

- legible first as a monogram,
- bear discovered second,
- one-color capable,
- readable at 16–24 px,
- suitable for brass signage, keycard embossing and favicon.

## 4.4 Clear space

Minimum clear space = height of the `R` cap in `RAVENSBURG` around the complete lockup.

## 4.5 Minimum sizes

| Asset | Minimum digital | Minimum print |
|---|---:|---:|
| Full lockup | 160 px wide | 32 mm wide |
| Wordmark | 110 px | 24 mm |
| Monogram | 20 px | 6 mm |

---

# 5. Color System

## 5.1 Core palette

| Token | Hex | Role | Approx. usage |
|---|---|---|---:|
| `paper-50` | `#F6EFE4` | principal warm background | 45–60% |
| `paper-100` | `#EDE3D5` | secondary paper | 10% |
| `wine-700` | `#722F32` | signature emotional accent | 8–12% |
| `wine-900` | `#4D1E22` | deep wine / hover | selective |
| `green-800` | `#1F3B2E` | hospitality depth / footer | 10–15% |
| `green-950` | `#10251B` | dark surfaces | selective |
| `oak-500` | `#8B6F47` | material accent | 5–8% |
| `charcoal-900` | `#2E2E2E` | primary text | core |
| `charcoal-600` | `#5E5A55` | secondary text | core |
| `brass-500` | `#B08D57` | detail/highlight | <5% |
| `white` | `#FFFFFF` | functional contrast | utility |

## 5.2 Semantic color tokens

```css
--bg-primary: #F6EFE4;
--bg-secondary: #FFFFFF;
--bg-inverse: #1F3B2E;
--text-primary: #2E2E2E;
--text-secondary: #5E5A55;
--text-inverse: #F6EFE4;
--brand-primary: #722F32;
--brand-secondary: #1F3B2E;
--accent-material: #B08D57;
--border-subtle: rgba(46,46,46,.16);
--focus: #722F32;
--success: #315B43;
--warning: #996D2C;
--error: #9C3434;
```

## 5.3 Color behavior

### Default ratio

```text
60% warm neutral
20% photography/material
10% dark green
7% burgundy
3% brass/detail
```

### Rule
`wine` and `green` should not compete at equal visual weight within the same section.

One leads; the other supports.

## 5.4 Accessibility

All functional text must meet WCAG AA contrast minimums.

Brass is decorative, not a standalone body-text color on cream.

---

# 6. Typography System

## 6.1 Recommended production stack

### Editorial / emotional

**Newsreader**

Use for:

- hero headlines,
- campaign lines,
- pull quotes,
- section openings,
- selected navigation/editorial moments.

### Functional / UI

**Geist Sans**

Use for:

- navigation,
- buttons,
- booking UI,
- metadata,
- room facts,
- pricing,
- forms,
- body copy.

### Technical / micro

**Geist Mono**

Use sparingly for:

- dates,
- room codes,
- labels,
- booking metadata,
- operating information.

## 6.2 Typographic character

```text
Editorial serif = hospitality / memory / appetite / place
Modern grotesk = clarity / speed / booking / utility
Mono = precision / operations / subtle digital layer
```

## 6.3 Type scale

Desktop:

| Token | Size | Line height | Font | Use |
|---|---:|---:|---|---|
| `display-xl` | 96 px | 0.94 | Newsreader | key hero |
| `display-lg` | 72 px | 0.98 | Newsreader | hero / manifesto |
| `display-md` | 56 px | 1.00 | Newsreader | major section |
| `h1` | 48 px | 1.05 | Newsreader | page title |
| `h2` | 36 px | 1.10 | Newsreader | sections |
| `h3` | 28 px | 1.15 | Newsreader / Geist | cards |
| `body-lg` | 20 px | 1.55 | Geist | lead |
| `body` | 16 px | 1.55 | Geist | default |
| `body-sm` | 14 px | 1.5 | Geist | metadata |
| `label` | 12 px | 1.2 | Geist | eyebrow |
| `micro` | 11 px | 1.2 | Geist Mono | operational |

Mobile:

| Token | Size |
|---|---:|
| `display-xl` | clamp(48px, 14vw, 68px) |
| `display-lg` | 48 px |
| `display-md` | 40 px |
| `h1` | 38 px |
| `h2` | 30 px |
| `h3` | 24 px |
| `body-lg` | 18 px |
| `body` | 16 px |

## 6.4 Tracking

- Display serif: `-0.02em` to `-0.035em`
- Uppercase labels: `0.12em` to `0.18em`
- Body: normal
- Never letter-space body copy for decorative effect.

---

# 7. Spacing System

Base unit: **4 px**

```text
space-1  = 4
space-2  = 8
space-3  = 12
space-4  = 16
space-5  = 20
space-6  = 24
space-8  = 32
space-10 = 40
space-12 = 48
space-16 = 64
space-20 = 80
space-24 = 96
space-32 = 128
space-40 = 160
```

### Section spacing

| Viewport | Standard | Large editorial |
|---|---:|---:|
| Mobile | 64–80 px | 96 px |
| Tablet | 80–96 px | 120 px |
| Desktop | 96–128 px | 160 px |

---

# 8. Grid & Layout

## 8.1 Breakpoints

```text
xs   0–479
sm   480–767
md   768–1023
lg   1024–1279
xl   1280–1599
2xl  1600+
```

## 8.2 Content widths

```css
--content-narrow: 720px;
--content-reading: 840px;
--content-standard: 1200px;
--content-wide: 1440px;
--content-max: 1600px;
```

## 8.3 Desktop grid

- 12 columns
- 24–32 px gutters
- 48–80 px outer margins

## 8.4 Tablet grid

- 8 columns
- 24 px gutters
- 32 px margins

## 8.5 Mobile grid

- 4 columns
- 16 px gutters
- 20 px outer margins

## 8.6 Composition principle

Avoid permanently centered layouts.

Use editorial asymmetry:

- 7/5 splits,
- 5/7 splits,
- edge-to-edge image + inset copy,
- offset cards,
- oversized typography crossing column boundaries.

Functional surfaces remain aligned and predictable.

---

# 9. Shape Language

## 9.1 Corners

The brand is materially warm, not app-bubbly.

```text
radius-xs = 2 px
radius-sm = 4 px
radius-md = 8 px
radius-lg = 12 px
radius-pill = 999 px // only tags / utility
```

Avoid 20–32 px SaaS-card radii.

## 9.2 Borders

Default: `1px solid rgba(46,46,46,.16)`

Dark surface: `rgba(246,239,228,.18)`

## 9.3 Shadows

Use sparingly.

```css
--shadow-soft: 0 12px 32px rgba(20,20,20,.08);
--shadow-float: 0 18px 48px rgba(20,20,20,.12);
```

Physical-material contrast is preferred over artificial shadow depth.

---

# 10. Material System

## 10.1 Core materials

| Material | Meaning | Usage |
|---|---|---|
| oiled oak | warmth, durability | interiors, dividers, cards |
| linen | human, quiet | backgrounds, photography styling |
| ceramic | gastronomy | food/touchpoint photography |
| natural stone | permanence | architectural detail |
| brushed brass | craft / emphasis | logo, signage, separators |
| dark textile | service professionalism | uniforms, dark UI panels |

## 10.2 Digital texture rule

Textures may appear at **2–6% perceived intensity**.

Never use fake woodgrain as a full website background.

---

# 11. Photography System

## 11.1 Image philosophy

> **Document hospitality; do not stage luxury.**

The photography should make the viewer feel present rather than impressed by production value.

## 11.2 Image categories

### A. Host / Human

Capture:

- service gestures,
- host interaction,
- natural conversation,
- hands,
- subtle eye contact,
- real staff.

Avoid:

- crossed-arm team portraits,
- receptionist stock poses,
- exaggerated smiling at camera.

### B. Food

Capture:

- recognisable ingredients,
- texture,
- steam,
- serving moments,
- table context,
- kitchen action.

Avoid:

- sterile Michelin-black backgrounds,
- tweezers-and-foam cliché,
- excessive shallow-depth luxury styling.

### C. Hotel

Capture:

- daylight,
- bed cleanliness,
- workspace,
- luggage/arrival cues,
- practical room context.

Avoid:

- distorted ultra-wide lenses,
- impossible room sizes,
- staged luxury props.

### D. Biergarten

Capture:

- canopy of trees,
- evening light,
- mixed groups,
- families,
- glasses/plates in context,
- social density with breathing room.

Avoid:

- Oktoberfest styling,
- lederhosen shorthand,
- beer-only communication.

### E. Ravensburg / Place

Capture locality through:

- subtle architecture,
- streets,
- texture,
- approach/arrival,
- recognizable but non-touristic context.

## 11.3 Color grade

- Warm neutrals
- Greens remain natural and deep
- Skin tones neutral/warm
- Moderate contrast
- Soft highlights
- No orange/teal cinematic grade
- No desaturated “heritage brown” preset

## 11.4 Crop ratios

```text
Hero landscape: 16:9 / 3:2
Editorial horizontal: 4:3
Portrait: 4:5
Story/mobile: 9:16
Food: 1:1 / 4:5
Room card: 3:2
```

---

# 12. Iconography System

## 12.1 Principle

Icons are **quiet functional instruments**, not decoration.

Style:

- monoline,
- 1.5 px optical stroke at 24 px,
- slightly geometric,
- squared/soft joins,
- no cartoon illustration,
- no generic tourism glyph family.

## 12.2 Core icon set

### Hospitality / Hotel

- bed
- key / access
- clock / 24h
- wifi
- parking
- desk/workspace
- breakfast
- luggage
- accessibility

### Restaurant

- table
- fork/knife
- menu
- reservation
- dietary/allergen
- wine/beverage

### Biergarten

- tree-canopy abstraction
- outdoor table
- sun/cloud weather state
- family/group

### Navigation

- location
- arrow
- external link
- phone
- mail
- calendar
- chevron

## 12.3 Signature iconography

Create 4–6 proprietary line symbols derived from the monogram geometry:

1. `Host`
2. `Stay`
3. `Table`
4. `Garden`
5. `Arrival`
6. `Together`

These should become the recognizable visual grammar of the system.

---

# 13. Motion System

## 13.1 Motion personality

Motion should feel like:

- entering a room,
- pulling out a chair,
- evening light changing,
- a menu opening.

Not like:

- an app dashboard,
- a tech landing page,
- a parallax demo.

## 13.2 Timing

```text
micro: 120–180 ms
standard: 220–320 ms
editorial reveal: 500–800 ms
image crossfade: 700–1200 ms
```

## 13.3 Easing

```css
--ease-standard: cubic-bezier(.2,.7,.2,1);
--ease-enter: cubic-bezier(.16,1,.3,1);
```

## 13.4 Reduced motion

Respect `prefers-reduced-motion`.

No critical information may require animation.

---

# 14. Core Components

## 14.1 Navigation

### Desktop

```text
[BÄRENGARTEN]  Hotel  Restaurant  Biergarten  Anlässe  Kontakt   [Zimmer] [Tisch]
```

Rules:

- header starts transparent over hero when contrast permits,
- converts to cream or deep-green surface after scroll,
- `Zimmer` and `Tisch` are persistent differentiated actions,
- maximum 5 primary navigation items before utility actions.

### Mobile

Top:

- wordmark
- menu trigger

Bottom sticky action bar:

```text
Zimmer | Tisch | Menü
```

Minimum touch target: 44 × 44 px.

---

## 14.2 Hero

### Homepage hero

Height:

- desktop: `min(92vh, 980px)`
- mobile: `78–88svh`

Contains:

1. visual atmosphere,
2. wordmark/brand context,
3. one primary emotional headline,
4. descriptor,
5. max 2 primary actions,
6. optional scroll cue.

### Prohibited

- booking engine as the dominant first visual,
- rotating carousel,
- 4+ buttons,
- testimonial badges layered over the hero.

---

## 14.3 Portal Cards

Homepage three-entry system:

1. Hotel
2. Restaurant
3. Biergarten

Each card contains:

- full image,
- one-word/short title,
- maximum 2 lines supporting copy,
- one arrow action.

Desktop: triptych.  
Mobile: vertical, full-width, 4:5 or 3:2.

---

## 14.4 Manifesto Block

Purpose: translate brand doctrine into memorable public expression.

Pattern:

```text
EYEBROW

Large serif statement.

Short supporting body.

Two principles / proof cues.
```

Maximum 70 characters in primary manifesto line when possible.

---

## 14.5 Booking Bar

Fields:

- arrival
- departure
- guests
- room/type if necessary
- availability CTA

### Behavior

Desktop: horizontal.  
Mobile: collapsed summary → bottom sheet / dedicated booking step.

Avoid embedding a dense third-party booking widget directly into the visual rhythm without a branded wrapper.

---

## 14.6 Restaurant Reservation Module

Primary action: `Tisch reservieren`

Secondary:

- menu
- opening times
- phone contact if necessary

Restaurant reservation should never compete with room booking on restaurant-specific pages.

---

## 14.7 Content Split

Use 5/7 or 7/5 grid.

Variants:

- image left / text right,
- image right / text left,
- inset copy over wide image only with readable contrast.

---

## 14.8 Quote / Review

Style:

- large serif quotation,
- one source label,
- optional platform/rating as secondary proof.

Avoid star-rating wall aesthetics.

---

## 14.9 CTA Band

Preferred dark-green background.

Large serif question:

> `Was führt Sie zu uns?`

Actions:

- Zimmer
- Tisch
- Anlass / Zusammenkommen

---

## 14.10 Footer

Contains:

- Bärengarten Ravensburg
- Hotel · Restaurant · Biergarten
- address
- contact
- navigation
- legal
- social if active
- operational information

Footer should feel like a closing hospitality surface, not a sitemap dump.

---

# 15. Button Matrix

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| `primary-wine` | wine-700 | paper-50 | none | booking/conversion |
| `primary-green` | green-800 | paper-50 | none | restaurant/location |
| `secondary` | transparent | charcoal-900 | charcoal 25% | secondary action |
| `inverse` | paper-50 | green-950 | none | dark sections |
| `text-link` | none | current | none | editorial navigation |

Button height:

- desktop: 48–52 px
- mobile: 52–56 px

Button radius: 4–8 px.

No pill-shaped primary buttons.

---

# 16. Form System

## 16.1 Inputs

- minimum 52 px height,
- visible labels, never placeholder-only,
- warm neutral surface,
- 1 px border,
- wine focus ring.

## 16.2 Error language

Human and direct.

Bad:

> Invalid input.

Good:

> Bitte prüfen Sie das Anreisedatum.

## 16.3 Success states

Use calm confirmation, not celebratory SaaS animation.

---

# 17. Information Architecture

## 17.1 Primary website tree

```text
/
├── hotel/
│   ├── zimmer/
│   ├── anreise-check-in/
│   └── buchen/
├── restaurant/
│   ├── speisekarte/
│   └── reservieren/
├── biergarten/
├── anlässe/
├── ueber-uns/
├── kontakt-anreise/
├── faq/
└── legal/
```

Optional later:

```text
├── ravensburg/
├── angebote/
├── jobs/
└── journal/
```

---

# 18. Homepage Matrix

| Section | Goal | Mode | Visual | CTA |
|---|---|---|---|---|
| Hero | establish place & feeling | Host + Garden | evening hospitality | Zimmer / Tisch |
| 3 Portals | orientation | Stay + Table + Garden | 3 category images | explore |
| Manifesto | differentiation | Host | typography-led | optional |
| Gastronomy | desire | Table | food/interior | Tisch / Karte |
| Hotel | utility/trust | Stay | room/work/arrival | Zimmer |
| Host layer | human proof | Host | real people | about/contact |
| Biergarten | social desire | Garden | full bleed | discover |
| Ravensburg | local utility | Stay | map/place | route |
| Reviews | trust | Host | editorial quotes | optional |
| Final CTA | conversion | all | dark branded field | 3 destinations |

---

# 19. Landing Page Matrix

## 19.1 Hotel

### Priority hierarchy

1. room clarity
2. availability
3. arrival/check-in simplicity
4. cleanliness / comfort
5. business utility
6. host presence
7. restaurant cross-sell

### Page sequence

```text
Hotel Hero
→ Booking Bar
→ Room types
→ Arrival / check-in
→ Business usefulness
→ Restaurant in-house
→ Reviews
→ FAQ
→ Final booking CTA
```

### Visual ratio

`60% functional / 40% emotional`

---

## 19.2 Restaurant

### Priority hierarchy

1. appetite
2. atmosphere
3. reservation
4. menu
5. quality philosophy
6. host/team
7. occasions

### Page sequence

```text
Restaurant Hero
→ Reservation action
→ Food editorial
→ Menu preview
→ Quality & honesty
→ Interior/people
→ Occasions
→ Opening information
→ Final reservation CTA
```

### Visual ratio

`70% emotional / 30% functional`

---

## 19.3 Biergarten

### Priority hierarchy

1. atmosphere
2. current availability/opening status
3. food/drink
4. family/social suitability
5. location

### Page sequence

```text
Seasonal Hero
→ Today's status
→ Garden experience
→ Food/drinks
→ Families/groups
→ practical info
→ Visit CTA
```

### Visual ratio

`80% emotional / 20% functional`

---

## 19.4 Events / Groups

### Priority hierarchy

1. occasion fit
2. capacity / possibilities
3. food/service
4. inquiry
5. trust

### Page sequence

```text
Occasion Hero
→ occasion types
→ spaces
→ food/service
→ gallery
→ inquiry form
```

---

# 20. Mobile Experience Matrix

## 20.1 Mobile principle

> **Feel first. Action always within thumb reach.**

## 20.2 Persistent mobile actions

Default bottom bar:

```text
[Zimmer] [Tisch] [Menü]
```

Contextual override:

- hotel page: `[Verfügbarkeit] [Anrufen]`
- restaurant page: `[Reservieren] [Karte]`
- biergarten: `[Heute] [Anfahrt]`

## 20.3 Mobile content order

Information must be reordered by intent, not simply stacked from desktop.

## 20.4 Mobile image rule

Prefer portrait crops with visible human activity.

Do not crop away the contextual reason for the image.

---

# 21. Content & Voice System

## 21.1 Tone

The language should be:

- direct,
- warm,
- concise,
- confident,
- unpretentious,
- specific.

Avoid:

- luxury adjectives,
- empty superlatives,
- tourism clichés,
- corporate hospitality jargon,
- pseudo-poetic copy everywhere.

## 21.2 Copy pattern

### Emotional headline
Short, distinctive, human.

### Functional line
Concrete and precise.

Example:

```text
Ankommen muss nicht kompliziert sein.

Anreiseinformationen, Zugang und Zimmerdetails klar an einem Ort.
```

## 21.3 Preferred vocabulary

Use:

- Gastgeber
- ankommen
- essen
- zusammensitzen
- bleiben
- Ravensburg
- Qualität
- ehrlich
- unkompliziert
- persönlich

Use sparingly:

- premium
- exklusiv
- Erlebnis
- Genusswelt
- einzigartig
- luxuriös

---

# 22. Content Claim Gates

The visual system must not convert founder intent into unsupported public fact.

| Claim / concept | Source status | Public-use rule |
|---|---|---|
| Hotel + Restaurant + Biergarten | stated identity | usable |
| Ravensburg / address | stated context | usable after operational verification |
| Qualität & Ehrlichkeit | intended positioning | usable as brand promise |
| Qualität vor Quantität | value | usable as principle |
| unvernünftige Gastfreundschaft | intended characteristic | usable as brand concept; operational examples require approval |
| primarily business guests | intended target | useful for UX targeting, not necessarily public copy |
| families important to gastronomy | intended target | useful for UX/content |
| 24/7 check-in | founder-confirmed but evidence missing | **do not publish as factual promise until verified** |
| extraordinary in-house gastronomy | founder-confirmed but evidence missing | use as ambition; avoid comparative claim until evidenced |
| fair/normal price | unresolved definition | avoid explicit price-position claim until defined |
| culinary center of Ravensburg | vision | use internally; public comparative claim requires substantiation |

---

# 23. Design Decision Matrix

Use this matrix when choosing between two visual options.

Score each option from `1–5`.

| Criterion | Weight |
|---|---:|
| feels human, not corporate | 5 |
| communicates quality without luxury theater | 5 |
| supports fast booking/reservation | 5 |
| distinctive in local hospitality market | 4 |
| works on mobile | 5 |
| gastronomy remains visually strong | 4 |
| hotel utility stays clear | 4 |
| supports real content, not stock dependence | 4 |
| can extend to physical touchpoints | 3 |
| accessible and readable | 5 |
| avoids zoo/bear-park associations | 5 |

Minimum recommended weighted score: **80%**.

Any option scoring `<4` on `avoids zoo/bear-park associations` is rejected regardless of total.

---

# 24. Brand Perception Matrix

The target position is intentionally between opposites.

```text
Rustic ----------------●---------------- Corporate
              BÄRENGARTEN

Cheap -----------------●---------------- Luxury
              FAIR QUALITY

Traditional -----------●---------------- Trend-driven
          CONTEMPORARY ROOTEDNESS

Anonymous -------------●---------------- Overfamiliar
             PERSONAL HOST

Functional ------------●---------------- Theatrical
         WARM + PRECISE
```

Target values:

| Axis | Target |
|---|---:|
| Rustic → Corporate | 45/100 |
| Cheap → Luxury | 58/100 |
| Traditional → Trend | 55/100 |
| Anonymous → Personal | 78/100 |
| Functional → Theatrical | 52/100 |

---

# 25. Exterior & Physical Touchpoint Matrix

## 25.1 Priority touchpoints

| Touchpoint | Primary role | Recommended expression |
|---|---|---|
| facade sign | recognition | wordmark + subtle monogram, dark green/brass |
| entrance | welcome/orientation | calm, direct, warm light |
| biergarten entrance | invitation | wood/metal + current status |
| menu | culinary brand | cream + wine / editorial serif |
| room keycard | intimate brand detail | minimal monogram |
| check-in interface | utility | functional Geist UI |
| invoice/stationery | trust | restrained wordmark |
| staff apron | human brand | charcoal/green + small mark |
| mug/tableware | material identity | cream ceramic + subtle mark |
| signage | wayfinding | sans + proprietary icons |
| vehicle/delivery | recognition | minimal, avoid full advertising wrap |

## 25.2 Signage materials

Preferred:

- powder-coated dark metal,
- warm brass,
- solid/oiled wood only where architecture supports it,
- painted wall lettering,
- warm indirect illumination.

Avoid:

- faux vintage distress,
- generic Bavarian sign language,
- excessive chalkboard aesthetic.

---

# 26. Digital Asset Matrix

## Required master assets

### Brand

- full horizontal logo
- stacked logo
- wordmark
- monogram
- monochrome variants
- favicon/app mark

### Iconography

- core 24 px icon set
- proprietary 6-symbol family
- social/contact icons

### Photography

- homepage hero 16:9
- hotel hero
- restaurant hero
- biergarten hero
- 12–20 supporting editorial images
- 6–10 portrait/human frames
- 8–12 food frames
- 6–10 room/utility frames

### UI

- OpenGraph image
- booking/reservation cards
- map treatment
- review treatment
- empty/error/success states

### Social

- 1:1 post
- 4:5 post
- 9:16 story/reel cover
- event/season template

---

# 27. Responsive Component Matrix

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Header | compact + menu | compact nav | full nav |
| Hero | 78–88svh | 80vh | up to 92vh |
| Portal cards | vertical | 2+1 / vertical | 3-column |
| Booking | bottom sheet / stacked | 2-row | horizontal |
| Editorial split | stacked | 50/50 | 5/7 or 7/5 |
| Reviews | one at time | 2 cards | editorial 3-up |
| CTA | stacked | 2-column | horizontal / 3-path |
| Footer | accordion/stack | grid | multi-column |

---

# 28. Accessibility Requirements

Minimum:

- WCAG 2.2 AA target
- keyboard navigation
- visible focus states
- `44×44 px` touch targets
- semantic heading structure
- alt text for meaningful photography
- decorative imagery empty-alt
- no text baked into essential images
- captions/transcripts for video
- reduced-motion support
- form errors associated programmatically
- color never used as sole signal

---

# 29. Performance Requirements

Hospitality photography must not create a slow site.

Targets:

```text
LCP < 2.5s target
CLS < 0.1
INP < 200ms target
```

Image rules:

- AVIF/WebP preferred
- responsive `srcset`
- hero preload only when necessary
- lazy-load below fold
- reserve aspect ratio dimensions
- avoid autoplay high-bitrate hero video on mobile

---

# 30. SEO / Discoverability Design Rules

Design must preserve:

- crawlable text headings,
- indexable menu/room information where appropriate,
- location/address semantics,
- structured data compatibility,
- accessible internal links,
- page-specific titles and CTAs.

Do not replace content with canvas-rendered or image-only layouts.

---

# 31. States & Operational UX

## 31.1 Dynamic status surfaces

Potential statuses:

- restaurant open / closed
- biergarten open / weather-dependent
- room availability
- reservation available
- seasonal message

Status design:

```text
● Heute geöffnet
```

Use understated dot + text.

Never use aggressive red/green dashboard styling on public hospitality pages.

## 31.2 Failure states

Brand principle: honesty.

If booking/reservation systems fail:

1. state the issue clearly,
2. preserve phone/email fallback,
3. do not blame third-party provider,
4. provide next action.

---

# 32. Homepage Hero Variants

## Variant A — Garden First

Visual: evening Biergarten under mature trees.

```text
BÄRENGARTEN
RAVENSBURG

Unvernünftig gastfreundlich.

Hotel · Restaurant · Biergarten
```

Best for: place/emotion positioning.

## Variant B — Host First

Visual: genuine service moment with environment visible.

```text
Ein Ort für echte Gäste.
Nicht für Buchungsnummern.
```

Best for: human differentiation.

## Variant C — Table First

Visual: restaurant moment / food + people.

```text
Gut essen.
Gut bleiben.
Gern wiederkommen.
```

Best for: gastronomy-led acquisition.

### Current recommendation
**Variant A** as default brand homepage direction; use `Host` content immediately below.

---

# 33. Page-Level Color Modes

## Homepage

- cream dominant
- green hero/footer
- wine signature moments

## Hotel

- cream/white dominant
- charcoal functionality
- green secondary

## Restaurant

- cream + wine dominant
- green secondary
- brass detail

## Biergarten

- natural photography + green
- cream copy surfaces
- wine kept minimal

## Events

- wine + cream
- dark green secondary

---

# 34. UI Density Rules

## Emotional sections

- low UI density
- high image scale
- 1 primary message
- max 2 actions

## Functional sections

- medium density
- clear labels
- structured grid
- explicit state/price/time information

## Never

Combine dense booking UI with oversized manifesto typography in the same visual layer.

---

# 35. Do / Don't Matrix

| Do | Don't |
|---|---|
| real people | generic stock reception poses |
| warm editorial serif | rustic pub typefaces |
| precise sans UI | decorative font for forms |
| restrained bear reference | bear mascot / paw motif |
| cream + deep color fields | beige-on-beige generic boutique aesthetic |
| genuine food texture | over-styled fine-dining cliché |
| clear booking action | hero full of booking controls |
| asymmetrical editorial grids | template-like centered sections everywhere |
| fair-quality perception | luxury-signaling gold overload |
| Ravensburg context | fake Alpine identity |
| concise copy | tourism brochure prose |

---

# 36. Figma / Design Token Naming

Recommended hierarchy:

```text
BG/
  Color/
    Surface/
    Text/
    Brand/
    Semantic/
  Type/
    Display/
    Heading/
    Body/
    Label/
    Mono/
  Space/
  Radius/
  Border/
  Shadow/
  Motion/
  Grid/
  Icon/
```

Component naming:

```text
BG/Button
BG/Header
BG/Footer
BG/Hero
BG/PortalCard
BG/BookingBar
BG/ReservationCTA
BG/EditorialSplit
BG/Manifesto
BG/ReviewQuote
BG/Status
BG/RoomCard
BG/MenuPreview
BG/LocationBlock
BG/CTASection
BG/MobileActionBar
```

---

# 37. Implementation Token Starter

```css
:root {
  --bg-primary: #F6EFE4;
  --bg-secondary: #FFFFFF;
  --bg-inverse: #1F3B2E;

  --text-primary: #2E2E2E;
  --text-secondary: #5E5A55;
  --text-inverse: #F6EFE4;

  --brand-wine: #722F32;
  --brand-wine-dark: #4D1E22;
  --brand-green: #1F3B2E;
  --brand-green-dark: #10251B;
  --material-oak: #8B6F47;
  --material-brass: #B08D57;

  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-32: 8rem;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --content-standard: 1200px;
  --content-wide: 1440px;

  --ease-standard: cubic-bezier(.2,.7,.2,1);
  --ease-enter: cubic-bezier(.16,1,.3,1);
}
```

---

# 38. Acceptance Criteria

A design is conformant when all of the following are true:

- [ ] clearly reads as hotel + restaurant + biergarten, not animal/nature attraction
- [ ] hospitality feels human rather than corporate
- [ ] restaurant has enough visual authority to differentiate the property
- [ ] hotel information remains practical and legible
- [ ] mobile conversion is available without dominating the emotional experience
- [ ] serif and sans roles remain distinct
- [ ] cream is the dominant digital neutral
- [ ] burgundy and green are used hierarchically, not competitively
- [ ] bear symbolism is secondary and abstract
- [ ] photography feels real and locally plausible
- [ ] no unsupported operational claim is presented as fact
- [ ] design meets AA accessibility target
- [ ] physical and digital identity feel like one system
- [ ] component system can scale to Hotel, Restaurant, Biergarten and Events pages

---

# 39. Open Design Decisions

These require a later explicit design/owner decision:

1. final one-sentence identity
2. final logo architecture and monogram
3. final production fonts / licensing confirmation
4. whether `UNVERNÜNFTIG GASTFREUNDLICH.` becomes a master tagline or campaign line
5. exact public wording for fair-price positioning
6. definition of service behaviors that substantiate “unvernünftige Gastfreundschaft”
7. verified capability before publicly promising `24/7 Check-in`
8. final room-booking provider and integration pattern
9. final restaurant-reservation provider
10. whether real-time Biergarten open/weather status is technically supported
11. final photography commissioning brief and shot list
12. final accessibility and legal review before production launch

---

# 40. Recommended Next Artifacts

This spec should generate the following next artifacts in sequence:

```text
BG-DS-001  Design System & Matrix          ← this document
BG-ID-001  Logo / Identity Exploration
BG-IC-001  Iconography Master Spec
BG-PH-001  Photography & Shot Direction
BG-UI-001  Web Component Library
BG-WEB-001 Homepage High-Fidelity Design
BG-WEB-002 Hotel Landing Page
BG-WEB-003 Restaurant Landing Page
BG-WEB-004 Biergarten Landing Page
BG-WEB-005 Events / Groups Landing Page
BG-EXT-001 Signage & Physical Touchpoints
BG-ACC-001 Accessibility Validation
```

---

# 41. Design North Star

Every new screen, asset, sign or communication should pass one question:

> **Does this feel like a real host who cares deeply about quality — or like a hospitality template trying to sell something?**

If it feels like the latter, simplify, humanize and return to the core tension:

> **Gastlichkeit ist groß. Bedienung ist klein und präzise.**

---

**END — BG-DS-001 / v0.1.0**
