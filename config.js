/* All facts of the site live here. Change a value, save, reload.
   Everything listed under "todo" is a placeholder until Ros confirms it. */
window.SITE = {
  // true = draft banner on top, placeholders marked, WhatsApp buttons do not open a chat
  draft: true,

  brand: { name: "Ros Bali Massage", short: "Ros", tagline: "Bali Massage" },

  // Digits only, with country code, no plus sign. Example: "6281234567890". Empty = not set yet.
  whatsapp: { number: "6289676872702", display: "+62 896-7687-2702" },

  instagram: "",

  currency: "Rp",

  // The two headline facts (from Ros, 16.11.2026)
  years: 26,
  teamSize: 8,

  // Areas the team travels to (first one is shown biggest)
  areas: ["Canggu", "Pererenan", "Berawa", "Seminyak", "Umalas"],

  facts: {
    brings: "oil, towels and a mat",
    hours: "Daily, 9:00 to 21:00",
    payment: "cash in rupiah or QRIS",
    cancel: "2 hours",
    transport: "A little further out can cost a small transport fee. You hear it before you book."
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
  treatments: [
    {
      id: "balinese",
      name: "Balinese massage",
      blurb: "Long strokes, palm and thumb pressure, warm coconut oil. The classic full-body massage.",
      prices: { 60: 250000, 90: 350000, 120: 450000 },
      // film: where the camera looks (x / y in percent of the picture, s = zoom), which side the text sits on,
      // which anatomy lights up (back, blade, calves, neck)
      film: { x: 50, y: 36.5, s: 2.35, side: "left", anat: "back", shown: "Lighting up: the long back muscles and the lats" }
    },
    {
      id: "deep",
      name: "Deep tissue",
      blurb: "Slow, firm work on knots in the back, shoulders and legs. Good after surfing or a long flight.",
      prices: { 60: 280000, 90: 390000, 120: 500000 },
      film: { x: 57, y: 31.8, s: 4.6, side: "right", anat: "blade", shown: "Lighting up: trapezius fibres and a knot at the shoulder blade" }
    },
    {
      id: "feet",
      name: "Foot reflexology",
      blurb: "Pressure points on feet and calves. Good after a day of walking.",
      prices: { 60: 220000, 90: 320000 },
      film: { x: 50, y: 79.5, s: 3.6, side: "left", anat: "calves", shown: "Lighting up: calf muscles and Achilles tendons",
              phone: { y: 81, s: 3.2 } } // phones: a bit further back, so the feet stay above the text
    },
    {
      id: "head",
      name: "Head, neck & shoulders",
      blurb: "For desk necks and scooter shoulders. No oil in your hair unless you ask.",
      prices: { 60: 230000, 90: 330000 },
      film: { x: 50, y: 24.6, s: 4.2, side: "right", anat: "neck", shown: "Lighting up: neck muscles and upper trapezius" }
    }
  ],

  defaults: { treatment: "balinese", minutes: 90 },

  // Team: Ros first. Add name + photo per person; empty entries show as placeholders in the draft only.
  team: [
    { name: "Ros", role: "Founder, 26 years", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" },
    { name: "", role: "", photo: "" }
  ],

  // Shown in the preview banner (English, so Ros can read it too)
  todo: [
    "Real prices per massage and length (these are typical market prices)",
    "Which massages the team really offers",
    "Areas, and whether travel costs extra",
    "Opening times, payment, cancellation rule",
    "Mat or table? Two people at the same time?",
    "Names and photos of the 8 therapists",
    "Spelling: Ros or Ross?"
  ]
};
