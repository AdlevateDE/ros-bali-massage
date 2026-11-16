/* Languages. English is the page as written in index.html / config.js / app.js / film.js.
   Bahasa Indonesia lives here in one place:
     site  = replaces texts from config.js (zones, massages, facts, to-do list)
     html  = replaces fixed texts of the page, found by a CSS selector
     attr  = replaces attributes (placeholders, labels)
     ui    = replaces texts the scripts write, looked up by their English wording via T("...")
   Which language shows: ?lang=id / ?lang=en in the address, else the last choice, else the phone's language. */
(() => {
  'use strict';
  const S = window.SITE;

  const ID = {
    site: {
      facts: {
        brings: 'minyak, handuk, dan matras',
        hours: 'Setiap hari, 09.00–21.00',
        payment: 'tunai rupiah atau QRIS',
        cancel: '2 jam'
      },
      zones: {
        head: { label: 'Kepala', fibres: 'Kulit kepala dan pelipis', line: 'Jet lag dan terlalu lama menatap layar terasa di sini.' },
        neck: { label: 'Leher & bahu', fibres: 'Trapezius', line: 'Naik motor, laptop, ransel berat.' },
        upper: { label: 'Punggung atas', fibres: 'Rhomboid dan latissimus', line: 'Mendayung saat berselancar, membawa papan, membungkuk di meja.' },
        lower: { label: 'Punggung bawah', fibres: 'Erector spinae', line: 'Penerbangan panjang dan kasur hotel yang terlalu empuk.' },
        arms: { label: 'Lengan & tangan', fibres: 'Otot lengan bawah', line: 'Berselancar, panjat tebing, mengetik.' },
        legs: { label: 'Paha & betis', fibres: 'Hamstring dan betis', line: 'Mendaki gunung, jalan jauh, latihan kaki.' },
        feet: { label: 'Telapak kaki', fibres: 'Fasia plantar', line: 'Seharian pakai sandal jepit di aspal panas.' }
      },
      treatments: {
        balinese: { name: 'Pijat Bali', blurb: 'Usapan panjang, tekanan telapak tangan dan ibu jari, minyak kelapa hangat. Pijat seluruh tubuh yang klasik.', shown: 'Menyala: otot punggung panjang dan latissimus' },
        deep: { name: 'Deep tissue', blurb: 'Tekanan pelan dan kuat pada simpul otot di punggung, bahu, dan kaki. Cocok setelah berselancar atau penerbangan panjang.', shown: 'Menyala: serat trapezius dan simpul otot di belikat' },
        feet: { name: 'Refleksi kaki', blurb: 'Titik-titik tekan di telapak kaki dan betis. Cocok setelah seharian berjalan.', shown: 'Menyala: otot betis dan tendon Achilles' },
        head: { name: 'Kepala, leher & bahu', blurb: 'Untuk leher kaku karena kerja di meja dan bahu pegal karena naik motor. Rambut tidak kena minyak kecuali Anda minta.', shown: 'Menyala: otot leher dan trapezius atas' }
      },
      teamRoles: { 'Founder, 26 years': 'Pendiri, 26 tahun' },
      todo: [
        'Harga asli per jenis pijat dan durasi (ini harga pasaran)',
        'Jenis pijat apa saja yang benar-benar ditawarkan tim',
        'Area yang dilayani tim',
        'Jam buka, cara bayar, aturan pembatalan',
        'Matras atau meja pijat? Bisa dua orang bersamaan?',
        'Nama dan foto 8 terapis',
        'Ejaan nama: Ros atau Ross?'
      ]
    },

    html: [
      ['#draftbar summary strong', 'Pratinjau'],
      ['h1', 'Ketuk bagian yang <em>pegal.</em>'],
      ['.proof li:nth-child(1) span', 'tahun pengalaman pijat'],
      ['.proof li:nth-child(2) span', 'terapis dalam tim'],
      ['.lede', 'Ros dan timnya datang ke vila atau hotel Anda. Tunjukkan bagian yang pegal, pilih waktu, kirim satu pesan WhatsApp.'],
      ['.comes', 'Melayani area <span id="hero-areas"></span>'],
      ['.hero__cta .btn--wa span', 'Pesan lewat WhatsApp'],
      ['.hero__cta .btn--ghost', 'Lihat jenis pijat'],
      ['#zoom-back', '← Seluruh tubuh'],
      ['#zoom-book', 'Pesan ↓'],
      ['#statement', 'Ros sudah memijat selama <span data-bind="years">26</span> tahun. Sekarang ia memimpin tim berisi <span data-bind="teamSize">8</span> terapis. Anda kirim pesan, salah satu dari mereka datang ke tempat Anda membawa minyak, handuk, dan matras. Anda cukup menunggu di tempat.'],
      ['.scene--intro h2', 'Menu singkat, <em>memang sengaja.</em>'],
      ['.scene--intro p', 'Empat jenis pijat. Masing-masing untuk bagian tubuh yang berbeda.'],
      ['.team__head h2', '<span data-bind="years">26</span> tahun pengalaman di tangannya. <em>Tujuh terapis lain di sisinya.</em>'],
      ['.team__head p', 'Satu nomor WhatsApp untuk seluruh tim. Kalau cocok dengan salah satu terapis, sebut namanya saat memesan lagi.'],
      ['.book__head h2', 'Susun pesanan Anda.'],
      ['.book__head p', 'Pesanan dikirim sebagai satu pesan WhatsApp. Tidak ada yang terkirim sebelum Anda menekan kirim.'],
      ['#q-zones', 'Bagian mana yang perlu dipijat?'],
      ['#q-treat', 'Pijat yang mana?'],
      ['#q-len', 'Berapa lama?'],
      ['#q-press', 'Tekanan'],
      ['#q-when', 'Kapan?'],
      ['label[for="f-place"]', 'Anda menginap di mana?'],
      ['#q-people', 'Berapa orang?'],
      ['label[for="f-note"]', 'Ada yang perlu kami ketahui?'],
      ['.chat__who small', 'Pratinjau WhatsApp'],
      ['#ticket-send span', 'Kirim lewat WhatsApp'],
      ['.send__fine', 'Membuka WhatsApp dengan teks ini. Anda masih bisa mengubahnya di sana.'],
      ['.steps h2', 'Dari pesan <em>sampai pijat</em>'],
      ['.steps__list li:nth-child(1)', '<strong>Anda kirim pesan.</strong> Belum ada yang dipesan.'],
      ['.steps__list li:nth-child(2)', '<strong>Tim membalas dengan waktu.</strong> Kalau jam itu sudah terisi, Anda ditawari jam terdekat.'],
      ['.steps__list li:nth-child(3)', '<strong>Terapis datang ke tempat Anda</strong> membawa <span data-bind="facts.brings"></span>. Anda cukup siapkan kasur, daybed, atau sedikit lantai kosong.'],
      ['.steps__list li:nth-child(4)', '<strong>Bayar setelah pijat,</strong> <span data-bind="facts.payment"></span>.'],
      ['.faq h2', 'Perlu <em>diketahui</em>'],
      ['.faq details:nth-of-type(1) summary', 'Apa yang perlu saya siapkan?'],
      ['.faq details:nth-of-type(1) p', 'Tempat yang tenang dan cukup untuk berbaring: kasur, daybed, atau sedikit lantai kosong. Sisanya dibawa terapis.'],
      ['.faq details:nth-of-type(2) summary', 'Bisakah dua orang dipijat bersamaan?'],
      ['.faq details:nth-of-type(2) p', 'Bisa. Dua terapis datang bersama, jadi tidak ada yang menunggu. Pilih 2 orang saat memesan.'],
      ['.faq details:nth-of-type(3) summary', 'Apakah Ros sendiri yang datang?'],
      ['.faq details:nth-of-type(3) p', 'Kadang Ros, kadang salah satu dari tujuh rekannya. Kalau ingin terapis tertentu, tulis namanya di pesan Anda dan tim akan mengusahakannya.'],
      ['.faq details:nth-of-type(4) summary', 'Bagaimana cara membayar?'],
      ['.faq details:nth-of-type(4) p', 'Setelah pijat, <span data-bind="facts.payment"></span>.'],
      ['.faq details:nth-of-type(5) summary', 'Apakah transportasi sudah termasuk?'],
      ['.faq details:nth-of-type(5) p', 'Mungkin ada biaya transportasi, tergantung jarak lokasi Anda. Tim mengonfirmasi jumlahnya lewat WhatsApp sebelum Anda memesan.'],
      ['.faq details:nth-of-type(6) summary', 'Apakah hotel saya mengizinkan?'],
      ['.faq details:nth-of-type(6) p', 'Vila dan guesthouse biasanya mengizinkan. Beberapa resor tidak mengizinkan terapis dari luar. Kalau ragu, tanyakan ke resepsionis sebelum memesan.'],
      ['.faq details:nth-of-type(7) summary', 'Bagaimana kalau saya perlu membatalkan?'],
      ['.faq details:nth-of-type(7) p', 'Kirim WhatsApp secepat mungkin. Tidak ada biaya jika dibatalkan paling lambat <span data-bind="facts.cancel"></span> sebelumnya.'],
      ['.faq details:nth-of-type(8) summary', 'Apakah ini pijat profesional?'],
      ['.faq details:nth-of-type(8) p', 'Ya. Hanya pijat terapi, dengan kain penutup yang sopan. Permintaan lain akan mengakhiri pesanan.'],
      ['.where__note', 'Mungkin ada biaya transportasi, tergantung jarak lokasi Anda. Tim mengonfirmasi jumlahnya lewat WhatsApp sebelum Anda memesan.'],
      ['#ticket-transport', 'Mungkin ada biaya transportasi. Jumlahnya dikonfirmasi lewat WhatsApp.'],
      ['.foot__big', 'Punggung pegal? <a class="js-wa" data-wa="hello" href="#book"><em>Hubungi <span data-bind="brand.short">Ros</span>.</em></a>'],
      ['.foot__meta p:nth-child(3)', '<a href="#massages">Jenis pijat</a><br><a href="#book">Pemesanan</a>'],
      ['#dock .btn span', 'Pesan lewat WhatsApp']
    ],

    attr: [
      ['#f-place', 'placeholder', 'Nama vila atau hotel'],
      ['#f-note', 'placeholder', 'Hamil, cedera, alergi'],
      ['#f-date', 'aria-label', 'Tanggal'],
      ['#f-area', 'aria-label', 'Area'],
      ['.send', 'aria-label', 'Pesan Anda'],
      ['#massages', 'aria-label', 'Jenis pijat'],
      ['#cam img', 'alt', 'Sosok dari belakang, untuk memilih bagian tubuh']
    ],

    ui: {
      // hero
      ', zoom in': ', perbesar',
      'Fibres: ': 'Serat: ',
      'Loosened. It is in your booking.': 'Sudah lemas. Masuk ke pesanan Anda.',
      'Press and hold to loosen the knot.': 'Tekan dan tahan untuk melemaskan simpul otot.',
      'Take it out': 'Hapus',
      'Add to my massage': 'Tambahkan ke pijat saya',
      'Whole body': 'Seluruh tubuh',
      'Your pick: ': 'Pilihan Anda: ',
      'We would suggest: ': 'Saran kami: ',
      'Tap a spot. The view moves in, right down to the muscle fibres. ': 'Ketuk satu titik. Tampilan mendekat sampai ke serat otot. ',
      'Book this ↓': 'Pesan ini ↓',
      'Or book straight away ↓': 'Atau langsung pesan ↓',
      ' and nearby': ' dan sekitarnya',
      // builder
      ' min': ' menit',
      'Gentle': 'Lembut', 'Medium': 'Sedang', 'Firm': 'Kuat',
      'Today': 'Hari ini', 'Tomorrow': 'Besok', 'Pick a date': 'Pilih tanggal',
      'Morning': 'Pagi', 'Afternoon': 'Siang', 'Evening': 'Sore/malam',
      'Area': 'Area', 'Somewhere else': 'Tempat lain',
      'Choose this': 'Pilih ini',
      'Photo': 'Foto', 'Name': 'Nama',
      // message
      'Hi {name}! I would like to book a massage.': 'Halo {name}! Saya ingin memesan pijat.',
      'Hi {name}! I found you on your website. Do you have time for a massage?': 'Halo {name}! Saya menemukan Anda lewat website. Apakah ada waktu untuk pijat?',
      'Massage: ': 'Pijat: ', 'Pressure: ': 'Tekanan: ', 'Focus: ': 'Fokus: ', 'When: ': 'Waktu: ', 'Where: ': 'Lokasi: ', 'People: ': 'Jumlah orang: ', 'Note: ': 'Catatan: ',
      'whole body': 'seluruh tubuh', 'time flexible': 'jam fleksibel', 'Date to be agreed': 'Tanggal menyusul',
      'for {n} people, ': 'untuk {n} orang, ',
      'paid after the massage, ': 'bayar setelah pijat, ',
      // transport: no fixed fee on the page, the visitor asks the team to confirm it
      'Massage price: ': 'Harga pijat: ',
      'Transport: ': 'Transportasi: ', 'please confirm if a fee applies': 'mohon konfirmasi jika ada biaya',
      // preview bar
      ' details are still examples (dashed boxes). Tap for the list.': ' hal masih contoh (kotak putus-putus). Ketuk untuk daftarnya.',
      'Preview: WhatsApp opens here once the number is set.': 'Pratinjau: WhatsApp terbuka di sini setelah nomornya diisi.',
      'WhatsApp is not available right now.': 'WhatsApp sedang tidak tersedia.',
      // film labels
      'Long back muscles': 'Otot punggung panjang', 'Lats': 'Latissimus', 'Trapezius': 'Trapezius', 'Knot': 'Simpul otot',
      'Calf muscle': 'Otot betis', 'Achilles tendon': 'Tendon Achilles', 'Upper trapezius': 'Trapezius atas', 'Neck muscles': 'Otot leher'
    }
  };

  /* ---------- which language ---------- */
  let lang = 'en';
  try {
    const q = new URLSearchParams(location.search).get('lang');
    let saved = null;
    try { saved = localStorage.getItem('ros_lang'); } catch (e) { /* storage blocked: fine */ }
    const pick = q || saved || ((navigator.language || '').toLowerCase().startsWith('id') ? 'id' : 'en');
    lang = pick === 'id' ? 'id' : 'en';
    if (q) { try { localStorage.setItem('ros_lang', lang); } catch (e) { /* fine */ } }
  } catch (e) { /* keep English */ }

  const missing = [];
  window.LANG = lang;
  window.I18N_MISSING = missing;
  window.DATE_LOCALE = lang === 'id' ? 'id-ID' : 'en-GB';
  // T("English text", {name: "Ros"}) -> the text in the current language
  window.T = (text, vars) => {
    let out = text;
    if (lang === 'id') {
      if (Object.prototype.hasOwnProperty.call(ID.ui, text)) out = ID.ui[text]; else missing.push(text);
    }
    if (vars) Object.keys(vars).forEach(k => { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  };

  /* ---------- language switch in the top bar ---------- */
  document.querySelectorAll('#lang a').forEach(a => {
    if (a.dataset.lang === lang) a.setAttribute('aria-current', 'true');
    a.addEventListener('click', e => {
      e.preventDefault();
      if (a.dataset.lang === lang) return;
      let stored = false;
      try { localStorage.setItem('ros_lang', a.dataset.lang); stored = true; } catch (err) { /* fine */ }
      const url = new URL(location.href);
      if (stored && !/^https?:$/.test(location.protocol)) { location.reload(); return; }
      url.searchParams.set('lang', a.dataset.lang);
      url.hash = '';
      location.href = url.toString();
    });
  });

  if (lang !== 'id') return;
  document.documentElement.lang = 'id';

  /* ---------- config texts ---------- */
  Object.assign(S.facts, ID.site.facts);
  S.zones.forEach(z => { if (ID.site.zones[z.id]) Object.assign(z, ID.site.zones[z.id]); else missing.push('zone ' + z.id); });
  S.treatments.forEach(t => {
    const tr = ID.site.treatments[t.id];
    if (!tr) { missing.push('treatment ' + t.id); return; }
    t.name = tr.name; t.blurb = tr.blurb; t.film.shown = tr.shown;
  });
  S.team.forEach(m => { if (m.role && ID.site.teamRoles[m.role]) m.role = ID.site.teamRoles[m.role]; });
  S.todo = ID.site.todo;

  /* ---------- fixed page texts ---------- */
  ID.html.forEach(([sel, html]) => {
    const n = document.querySelector(sel);
    if (n) n.innerHTML = html; else missing.push('selector ' + sel);
  });
  ID.attr.forEach(([sel, name, value]) => {
    const n = document.querySelector(sel);
    if (n) n.setAttribute(name, value); else missing.push('selector ' + sel);
  });
})();
