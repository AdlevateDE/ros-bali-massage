/* All facts of the site live here. Change a value, save, reload.
   Everything listed under "todo" is a placeholder until Ros confirms it. */
window.SITE = {
  // true = draft banner on top, placeholders marked, WhatsApp buttons do not open a chat
  draft: true,

  brand: { name: "Ros Bali Massage", short: "Ros", tagline: "Bali Massage" },

  // Digits only, with country code, no plus sign. Example: "6281234567890". Empty = not set yet.
  whatsapp: { number: "6289676872702", display: "+62 896-7687-2702" },

  // Instagram profile name without @ (Ros sent it on WhatsApp, 16.11.2026). Empty = no Instagram links on the page.
  instagram: "ros.homemassage",

  currency: "Rp",

  // The two headline facts (from Ros, 16.11.2026)
  years: 26,
  teamSize: 8,

  // Areas the team travels to, nearest first (the first one is shown biggest).
  // Transport fees are NOT listed on purpose (we do not know them): the page only says a fee may apply
  // and that the amount is confirmed on WhatsApp.
  // Ros, 17.11.2026: "all area on Bali", she is based in Denpasar Barat. Listed: the visitor areas within
  // about 40 minutes of her; everything else goes through "Somewhere else" and the note under the list.
  areas: ["Canggu", "Seminyak", "Kerobokan", "Umalas", "Berawa", "Pererenan", "Legian", "Kuta", "Denpasar", "Sanur"],

  // Confirmed by Ros on WhatsApp, 17.11.2026 ("never closed 24 hour ready", payment "all ok",
  // cancel "2 hour before", "team bring oil and sarung", massage bed "extra 100k").
  facts: {
    brings: "oil and a sarong",
    hours: "Every day, 24 hours",
    payment: "cash in rupiah, QRIS or bank transfer",
    cancel: "2 hours",
    bedFee: 100000 // extra charge in rupiah when the team brings a massage bed
  },

  // Body areas. x / y = tap point on the body picture in percent. side / lead = where the label sits
  // (r = right, l = left; lead = length of the little line in percent of the picture width).
  // angle = direction the muscle fibres run in the close-up.
  zones: [
    { id: "head",  label: "Head",             x: 50,   y: 19,   side: "r", lead: 13, fibres: "Scalp and temples",     angle: 0,   line: "Jet lag and screen time sit here." },
    { id: "neck",  label: "Neck & shoulders", x: 50,   y: 27.5, side: "r", lead: 21, fibres: "Trapezius",             angle: 28,  line: "Scooter rides, laptops, heavy backpacks." },
    { id: "upper", label: "Upper back",       x: 50,   y: 33.5, side: "r", lead: 25, fibres: "Rhomboids and lats",    angle: -32, line: "Paddling out, carrying boards, hunching over a desk." },
    { id: "lower", label: "Lower back",       x: 50,   y: 41.5, side: "r", lead: 27, fibres: "Erector spinae",        angle: 90,  line: "Long flights and soft hotel beds." },
    { id: "arms",  label: "Arms & hands",     x: 30.3, y: 45.5, side: "l", lead: 7,  fibres: "Forearm flexors",       angle: 82,  line: "Surfing, climbing, typing." },
    { id: "legs",  label: "Legs",             x: 43.5, y: 68,   side: "l", lead: 10, fibres: "Hamstrings and calves", angle: 88,  line: "Volcano hikes, long walks, leg day." },
    { id: "feet",  label: "Feet",             x: 41.5, y: 87.7, side: "l", lead: 9,  fibres: "Plantar fascia",        angle: 8,   line: "A day in flip-flops on hot pavement." }
  ],

  // Prices per person in rupiah. Leave a length out if it is not offered.
  // Ros, 17.11.2026: "balinese massage only" and "60 = same price like your website". So there is ONE massage
  // (Balinese) at one price per length; the four entries are the same massage with a different focus.
  // 60 minutes = 250,000 is confirmed. 90 and 120 minutes are the values she saw on the page and did not correct.
  treatments: [
    {
      id: "balinese",
      name: "Balinese massage",
      blurb: "Long strokes, palm and thumb pressure, warm oil. The classic full-body massage.",
      prices: { 60: 250000, 90: 350000, 120: 450000 },
      // film: where the camera looks (x / y in percent of the picture, s = zoom), which side the text sits on,
      // which anatomy lights up (back, blade, calves, neck)
      film: { x: 50, y: 36.5, s: 2.35, side: "left", anat: "back", shown: "Lighting up: the long back muscles and the lats" }
    },
    {
      id: "deep",
      name: "Back & shoulders",
      blurb: "The same Balinese massage, with the time spent on knots in the back and shoulders. Good after surfing or a long flight.",
      prices: { 60: 250000, 90: 350000, 120: 450000 },
      film: { x: 57, y: 31.8, s: 4.6, side: "right", anat: "blade", shown: "Lighting up: trapezius fibres and a knot at the shoulder blade" }
    },
    {
      id: "feet",
      name: "Foot massage",
      blurb: "Feet and calves get the whole time. Good after a day of walking.",
      prices: { 60: 250000, 90: 350000 },
      film: { x: 50, y: 79.5, s: 3.6, side: "left", anat: "calves", shown: "Lighting up: calf muscles and Achilles tendons",
              phone: { y: 81, s: 3.2 } } // phones: a bit further back, so the feet stay above the text
    },
    {
      id: "head",
      name: "Head, neck & shoulders",
      blurb: "For desk necks and scooter shoulders. No oil in your hair unless you ask.",
      prices: { 60: 250000, 90: 350000 },
      film: { x: 50, y: 24.6, s: 4.2, side: "right", anat: "neck", shown: "Lighting up: neck muscles and upper trapezius" }
    }
  ],

  defaults: { treatment: "balinese", minutes: 90 },

  // Team: Ros first. More people can be added later with name + photo (they then show as circles next to her).
  // Decision 17.11.2026: no more questions to Ros about names and portraits, the snapshots below show the team.
  team: [
    { name: "Ros", role: "Founder, 26 years", photo: "assets/team_ros.webp" } // her WhatsApp profile picture, see tools/prep_ros_photos.py
  ],

  // Snapshots in the team section: Ros's own phone photos (WhatsApp 17.11.2026 and her Instagram),
  // cut square by tools/prep_ros_photos.py. No guest can be recognised on any of them.
  shots: [
    { src: "assets/shot_way.webp", caption: "On the way to a guest" },
    { src: "assets/shot_villa.webp", caption: "Evening visit at a villa" },
    { src: "assets/shot_work.webp", caption: "Ros at work" },
    { src: "assets/shot_two.webp", caption: "Two guests, two therapists" }
  ],

  // Shown in the preview banner (English, so Ros can read it too).
  // Everything else is confirmed by Ros (17.11.2026) or settled without her; these two are assumptions.
  todo: [
    "Prices for 90 and 120 minutes (60 minutes is confirmed by Ros)",
    "List of areas (Ros said: all areas of Bali)"
  ]
};
