# Safegati Packers & Movers: homepage design preview v7 ("Compass")

A completely new design for the Safegati homepage, built by Inspirito Ventures Pvt Ltd. It shares no colours, type, layout or motion with the earlier previews (draft 5, preview 5 and v6 "On the highway"). There is no build step: the files in this folder are the website.

## What's inside

```
index.html              the homepage
assets/css/site.css     all styles
assets/js/site.js       interactions: menu, two-step quote bar, isometric scenes, moving-day countdown, branch tabs, flip card, pricing selector, copy GSTIN
assets/js/motion.js     animation layer (GSAP + plugins, Lenis smooth scroll)
assets/vendor/          GSAP 3.15.1 with ScrollTrigger, SplitText, DrawSVG, MorphSVG, MotionPath and Flip, plus Lenis 1.3.27, stored here rather than loaded from a CDN
assets/fonts/           Unbounded and Instrument Sans (self-hosted, SIL Open Font License, see the OFL files)
assets/img/             logo (colour and white), favicon, and the photos (WebP, two sizes each)
_headers                Cloudflare headers (noindex, caching for /assets)
robots.txt              keeps search engines out of the preview
```

## Deploy

GitHub Desktop → Cloudflare Pages: publish this folder as a repository, connect it to a Pages project, leave the framework preset as None and the build command empty, and set the output directory to `/`.

Netlify: drag this folder onto Netlify Drop, or connect the repository with no build command and `/` as the publish directory.

Open it from a web address, not by double-clicking `index.html`: browsers block self-hosted fonts on `file://` pages, so the type falls back to the system font locally.

## Design system

- Colours: ink #0B1324, Safegati blue #0070CB, and the four colours of the Safegati star used as accents (red #EF2B3E, green #10A34F, orange #FF8A1F, sky #16ACEF), on white and mist #F4F7FB.
- Type: Unbounded (headings, wide geometric) and Instrument Sans (text).
- Look: light, glassy and soft. A drifting colour aurora behind the hero, frosted-glass header and cards, a neumorphic countdown section, a dark team section, and real photos only inside shaped frames.

## Animation map

| Section | What moves |
|---|---|
| Loader (first visit per tab) | Animated logo: the star petals morph out of dots, the ring and gear teeth draw themselves, the name rises, then a curtain lifts |
| Header | Floating glass bar that hides on scroll down, shows on scroll up; four-colour progress line; active section highlighted; below 1121 px the hamburger turns into an X and the menu opens as a circular reveal |
| Hero | Aurora blobs drift and morph; grid pans; light follows the cursor; headline letters flip up and gain weight; photo pills open inside the headline and widen on hover; three glass cards rise in 3D, tilt flat as you scroll and float; skeleton loading turns into a live tracking card; a WhatsApp chat types and replies on a loop; GST tick redraws |
| Quote bar | Two steps morph in place (route → details → confirmation with a self-drawing tick); swap button spins; errors shake the bar |
| City ticker | Speeds up and reverses with your scroll speed and direction; outlined and solid city names |
| Numbers | Icons draw themselves; numbers count up |
| Photo band: "Carried out by our crew" | Parallax photo: the frame opens from a rounded card to full width as it scrolls in, the photo drifts slower than the page and the text drifts faster (two depths) |
| Services | Vertical scroll drives a horizontal track (desktop); cards swing in from 3D; each icon is an animated scene (box flaps close and tape on, shutter opens, wheels and road roll, globe turns, office windows light up); cards tilt toward the cursor |
| How your move works | Scrollytelling: a path draws itself down the page while a truck travels along it; each step lights up; isometric scenes for each step play stop-motion loops (chat bubbles pop, box packs, cartons load, truck drives, house delivery) |
| Photo band: "Long-distance moves" | Parallax photo that also zooms out as you scroll, with the text moving on its own layer |
| Four hands, one plan | Collaborative cursors (Branch desk, Packing crew, Driver, Delivery crew) pick up the move card and hand it across a board, leaving notes |
| Planned from Hyderabad | Charminar photo in an arch frame: the frame wipes open, the photo moves inside it, and the two tags float at different speeds; office and warehouse icons draw themselves |
| Moving-day countdown | Neumorphic panel: date input, ring and toggles. Tasks rebuild around your date and reshuffle smoothly when you change it |
| Why Safegati | Mixed media: photos in arch, card and blob frames move at different depths; hand-drawn doodles draw themselves; tags pop in |
| Branches | Liquid tabs (gooey blob follows the selected city); the city name fills with a moving liquid wave |
| Check us before you book | 3D ID card with a holographic sheen; turns once to show it has a back, flips on press, tilts with the cursor |
| Pricing | Sliding segmented controls; ticket card; hand-drawn circle around the 25% advance |
| Reviews | Skeleton cards shimmer until Google reviews are connected; stars spin in |
| FAQs | Plus morphs into a minus; answers open smoothly |
| Closing call to action | Parallax photo of taped cartons under a navy wash; huge headline whose letters thicken near the cursor; liquid gradient follows the pointer; magnetic buttons |
| Footer | Outlined SAFEGATI wordmark rises; each letter fills with a star colour on hover |

Buttons everywhere fill from the point where the pointer enters, nudge their arrow and press down on click. Nothing bounces except the error shake. With "reduce motion" turned on, the loader, smooth scrolling, pinned scrolling and every loop are switched off and each section shows its finished state.

## Preview behaviour

- Contact is WhatsApp only: no call buttons or phone numbers. On the live site every WhatsApp button opens a chat with +91 91600 00478.
- Only this page works. Links to other pages, WhatsApp, email, maps, the GST portal, certificates and social profiles are set to `#` and do nothing. The one live link is the footer credit to inspirito.in.
- The quote bar has two steps and shows a confirmation; nothing is sent from the preview.
- Text marked with a yellow highlight needs details from Safegati: how international moves travel and which countries are covered, founding year, price ranges, Google rating and review count, car/bike handover steps, and what customers enter to track a shipment.
- The tracking card and WhatsApp chat in the hero are labelled as examples.

## Responsive and menu

Checked at 320, 360, 390, 414, 600, 740 (landscape phone), 768, 900, 1024, 1130, 1180, 1280, 1440 and 1920 px wide: nothing scrolls sideways at any width. Below 1121 px the header shows the hamburger menu. The menu:
- moves keyboard focus to its first link and keeps Tab inside the menu while open
- closes with the X, the Escape key (focus returns to the button), any menu link (the page then scrolls to that section) or by widening the window past 1120 px
- locks the page behind it, including with reduce motion on
- fits short landscape phones (links switch to three columns)

## Photos

Free stock photos from Unsplash (Unsplash License, not Unsplash+). Replace them with Safegati's own photos of its crew, trucks and warehouse before launch.

| Where on the page | Photo | Photographer | Unsplash page |
|---|---|---|---|
| Photo band 1 | A man unloading boxes from a van | Richard Stachmann | unsplash.com/photos/a-man-is-unloading-boxes-from-a-van-GgmZ23grWNY |
| Photo band 2 | Orange and black truck on a road near the sea | Rishav Sarkar | unsplash.com/photos/orange-and-black-truck-on-road-near-sea-during-daytime-MVFoNcSWk5c |
| Planned from Hyderabad | The Charminar under a blue sky | Swipe | unsplash.com/photos/charminar-monument-in-hyderabad-F-LVLE4r7sA |
| Closing call to action | A large pile of brown cardboard boxes with blue tape | Rohit Choudhari | unsplash.com/photos/a-large-pile-of-brown-cardboard-boxes-with-blue-tape-qO2ztAz5g7A |
| Hero pill 1, Why collage (arch) | Someone packing a carton in a living room | Vitaly Gariev | (from earlier previews) |
| Hero pill 2, Why collage (card) | A painted goods lorry on a road in Tamil Nadu | Gowtham AGM | (from earlier previews) |
| Hero pill 3 | A couple carrying boxes into their new home | Vitaly Gariev | (from earlier previews) |
| Why collage (blob) | Boxes on warehouse racks | CHUTTERSNAP | (from earlier previews) |
