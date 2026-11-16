(function () {
  'use strict';
  function get(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  Promise.all([get('/data/products.json'), get('/data/categories.json'), get('/data/brands.json')]).then(function (r) {
    start({ products: r[0], cats: r[1], brands: r[2] });
  }).catch(function () {
    document.getElementById('app').innerHTML = '<div class="wrap section"><h1>Catalogul nu s-a încărcat</h1><p>Reîncarcă pagina sau sună la <a href="tel:+37379663311">079 66 33 11</a>.</p></div>';
  });
  var start = (function (DATA) {
  'use strict';
  var P = DATA.products, CATS = DATA.cats, BR = DATA.brands;
  var byId = {}; P.forEach(function (p) { byId[p.id] = p; });
  var catById = {}; CATS.forEach(function (c) { catById[c.id] = c; });
  var app = document.getElementById('app');
  var state = { seg: localStorage.getItem('seg') || 'cabinet' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(price) { if (!price) return 0; return +String(price).replace('de la ', '').replace(/\./g, ''); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function priceHtml(p, cls) { return p.price ? '<span class="price ' + (cls || '') + '">' + esc(p.price) + ' MDL</span>' : '<span class="price req">Preț la cerere</span>'; }
  function brandName(b) { return (BR[b] && BR[b].label) || b; }
  function brandLogo(b) { return BR[b] && BR[b].logo; }
  function isDark(b) { return BR[b] && BR[b].dark; }
  function img(p) { return '/img/p/' + p.id + '.webp'; }
  function catProducts(id) { return P.filter(function (p) { return p.cat === id; }); }
  function segCats(seg) { return CATS.filter(function (c) { return c.seg === seg; }); }

  // ---------- cart ----------
  function getCart() { try { return JSON.parse(localStorage.getItem('cart') || '{}'); } catch (e) { return {}; } }
  function setCart(c) { try { localStorage.setItem('cart', JSON.stringify(c)); } catch (e) {} updateCount(); }
  function updateCount() { var c = getCart(), n = 0; var t = 0; for (var k in c) { n += c[k]; if (byId[k]) t += num(byId[k].price) * c[k]; } document.getElementById('cartCount').textContent = n; document.getElementById('cartTotal').textContent = t ? fmt(t) + ' MDL' : 'Coș'; }
  function addToCart(id, q) { var c = getCart(); c[id] = (c[id] || 0) + (q || 1); setCart(c); toast('Adăugat în coș: ' + byId[id].name); }
  var tt; function toast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2200); }

  // ---------- components ----------
  function card(p) {
    return '<article class="card">' +
      '<a class="card-img" href="#/p/' + p.id + '" tabindex="-1" aria-hidden="true"><img loading="lazy" src="' + img(p) + '" alt="" width="240" height="240"></a>' +
      '<div class="card-b"><span class="card-brand">' + esc(brandName(p.brand)) + '</span>' +
      '<h3 class="card-name"><a href="#/p/' + p.id + '">' + esc(p.name) + '</a></h3>' +
      (p.note ? '<p class="card-note">' + esc(p.note) + '</p>' : '') +
      '<div class="card-f">' + priceHtml(p) +
      (p.price ? '<button class="btn sm add" data-add="' + p.id + '"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h2l2.5 11h9L20 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>În coș</button>' : '<a class="btn sm ghost" href="#/p/' + p.id + '">Detalii</a>') +
      '</div></div></article>';
  }
  function brandTile(b, href, count) {
    var lg = brandLogo(b), dk = isDark(b);
    return '<a class="brand-tile' + (dk ? ' dk' : '') + '" href="' + href + '" aria-label="' + esc(brandName(b)) + '">' +
      (lg ? '<img loading="lazy" src="' + lg + '" alt="">' : '<b>' + esc(brandName(b)) + '</b>') +
      (count != null ? '<span>' + count + ' produse</span>' : '') + '</a>';
  }

  // ---------- views ----------
  var ICON = {
    truck: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    doc: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
    chat: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    tool: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6a4 4 0 015 5l-9 9-4-4 9-9"/><path d="M14 6l4 4"/></svg>'
  };
  function firstPhoto(catId) { var x = catProducts(catId).filter(function (p) { return p.photo; })[0]; return x ? img(x) : ''; }
  function home() {
    var seg = state.seg, cats = segCats(seg);
    var side = cats.map(function (c) { return '<a href="#/catalog?seg=' + seg + '&cat=' + c.id + '"><span>' + esc(c.name) + '</span><span>' + catProducts(c.id).length + '</span></a>'; }).join('');
    var hero = seg === 'cabinet'
      ? { id: 'shining-3d-aoralscan-3', tag: 'SHINING 3D · CABINET', h: 'Aoralscan 3 — scanare intraorală fără pulbere', p: 'Amprentă digitală rapidă pentru coroane, implanturi și ortodonție. Demonstrație în cabinetul tău.', price: 'La cerere', go: 'Vezi produsul' }
      : { id: 'hass-amber-mill-q', tag: 'HASS · LABORATOR', h: 'Amber® Mill — disilicat de litiu pentru frezare', p: 'Blocuri CAD/CAM pentru fațete, coroane și inlay-uri, în nuanțe multiple.', price: 'La cerere', go: 'Vezi produsul' };
    var hp = byId[hero.id];
    var b1 = byId['yeson-autoclav-22-l-clasa-b'], b2 = byId[seg === 'cabinet' ? 'shining-3d-aoralscan-elf' : 'shining-3d-accufab-cel'];
    var pops = cats.map(function (c) { return '<a class="pop" href="#/catalog?seg=' + seg + '&cat=' + c.id + '"><span>' + (firstPhoto(c.id) ? '<img loading="lazy" src="' + firstPhoto(c.id) + '" alt="">' : '') + '</span>' + esc(c.name) + '</a>'; }).join('');
    var feat = P.filter(function (p) { return p.seg === seg && p.price && p.photo; }).sort(function (a, b) { return num(a.price) - num(b.price); });
    var pick = []; var seen = {}; feat.forEach(function (p) { if (pick.length < 10 && !seen[p.cat + p.brand]) { seen[p.cat + p.brand] = 1; pick.push(p); } });
    feat.forEach(function (p) { if (pick.length < 10 && pick.indexOf(p) < 0) pick.push(p); });
    var brands = Object.keys(BR).filter(function (b) { return BR[b].logo; });
    app.innerHTML =
      '<div class="wrap shop"><nav class="shop-side" aria-label="Categorii ' + seg + '"><h2>' + (seg === 'cabinet' ? 'Pentru cabinet' : 'Pentru laborator') + '</h2>' + side +
      '<a class="all" href="#/catalog">Toate cele ' + CATS.length + ' categorii →</a></nav><div class="shop-main">' +
      '<a class="banner big" href="#/p/' + hp.id + '"><div class="bt"><span class="tag">' + hero.tag + '</span><h2>' + hero.h + '</h2><p>' + hero.p + '</p><div class="row"><span class="go">' + hero.go + '</span></div></div><img src="' + img(hp) + '" alt=""></a>' +
      '<a class="banner sm dk" href="#/catalog?seg=cabinet&cat=steril"><div class="bt"><span>ECHIPAMENTE</span><h3>Autoclave și sterilizare</h3><span>Cere ofertă cu instalare</span></div><img src="' + img(b1) + '" alt=""></a>' +
      '<a class="banner sm bl" href="#/p/' + b2.id + '"><div class="bt"><span>DIGITAL</span><h3>' + esc(b2.name) + '</h3><span>Demonstrație la cerere</span></div><img src="' + img(b2) + '" alt=""></a>' +
      '</div></div>' +
      '<section class="wrap"><div class="bens">' +
      '<div class="ben"><i>' + ICON.truck + '</i><div><b>Livrare în toată Moldova</b><span>Termenul îl confirmăm la comandă</span></div></div>' +
      '<div class="ben"><i>' + ICON.doc + '</i><div><b>Factură pe firmă</b><span>Pentru cabinete, clinici și laboratoare</span></div></div>' +
      '<div class="ben"><i>' + ICON.chat + '</i><div><b>Consultanță</b><span>079 66 33 11, luni–vineri 9–18</span></div></div>' +
      '<div class="ben"><i>' + ICON.tool + '</i><div><b>Instalare și service</b><span>Pentru echipamente</span></div></div></div></section>' +
      '<section class="wrap section"><div class="section-h"><h2>Categorii populare</h2><a class="link" href="#/catalog">Tot catalogul →</a></div><div class="pops">' + pops + '</div></section>' +
      '<section class="wrap section"><div class="section-h"><h2>Cele mai căutate pentru ' + (seg === 'cabinet' ? 'cabinet' : 'laborator') + '</h2><a class="link" href="#/catalog?seg=' + seg + '">Vezi toate →</a></div><div class="grid">' + pick.map(card).join('') + '</div></section>' +
      '<section class="wrap section"><div class="cta"><div><h2>Deschizi un cabinet sau un laborator?</h2><p>Facem lista de echipamente și consumabile, cu livrare și instalare.</p></div>' +
      '<div class="hero-cta"><a class="btn lime" href="#/contact">Cere ofertă</a><a class="btn dark-ghost" href="tel:+37379663311">079 66 33 11</a></div></div></section>' +
      '<section class="wrap section"><div class="section-h"><h2>Branduri în catalog</h2><a class="link" href="#/branduri">Toate brandurile →</a></div><div class="brands">' +
      brands.map(function (b) { return brandTile(b, '#/catalog?brand=' + encodeURIComponent(b)); }).join('') + '</div></section>';
  }

  function catalog(q) {
    var seg = q.seg || state.seg, term = (q.q || '').trim(), brand = q.brand || '';
    if (brand && !q.cat && !term) { // brand page: show across segments
      var bp = P.filter(function (p) { return p.brand === brand; });
      app.innerHTML = '<div class="wrap"><nav class="crumbs" aria-label="Ești aici"><a href="#/">Acasă</a><span aria-hidden="true">/</span><a href="#/branduri">Branduri</a><span aria-hidden="true">/</span><span>' + esc(brandName(brand)) + '</span></nav>' +
        '<div class="cat-layout"><div class="cat-main" style="flex-basis:100%"><div class="cat-title"><h1>' + esc(brandName(brand)) + '</h1><span class="mono muted">' + bp.length + ' produse</span></div>' +
        '<div class="grid">' + bp.map(card).join('') + '</div></div></div></div>';
      return;
    }
    var cats = segCats(seg), cat = catById[q.cat] && catById[q.cat].seg === seg ? catById[q.cat] : (q.cat ? catById[q.cat] : null);
    if (cat && cat.seg !== seg) { seg = cat.seg; cats = segCats(seg); }
    var list;
    if (term) {
      var t = term.toLowerCase();
      list = P.filter(function (p) { return (p.name + ' ' + p.brand + ' ' + brandName(p.brand) + ' ' + p.note + ' ' + catById[p.cat].name + ' ' + p.desc).toLowerCase().indexOf(t) >= 0; });
    } else {
      list = cat ? catProducts(cat.id) : P.filter(function (p) { return p.seg === seg; });
      if (brand) list = list.filter(function (p) { return p.brand === brand; });
    }
    var src = term ? [] : (cat ? catProducts(cat.id) : P.filter(function (p) { return p.seg === seg; }));
    var bset = []; src.forEach(function (p) { if (bset.indexOf(p.brand) < 0) bset.push(p.brand); });
    var base = '#/catalog?seg=' + seg + (cat ? '&cat=' + cat.id : '');
    var chips = term ? '' : '<div class="chips" role="group" aria-label="Filtru după brand">' +
      '<a class="chip txt" href="' + base + '" aria-pressed="' + (!brand) + '" style="text-decoration:none">Toate brandurile</a>' +
      bset.map(function (b) {
        var lg = brandLogo(b);
        return '<a class="chip' + (lg ? (isDark(b) ? ' dk' : '') : ' txt') + '" style="text-decoration:none" href="' + base + '&brand=' + encodeURIComponent(b) + '" aria-pressed="' + (brand === b) + '" aria-label="' + esc(brandName(b)) + '">' +
          (lg ? '<img src="' + lg + '" alt="">' : esc(brandName(b))) + '</a>';
      }).join('') + '</div>';
    var title = term ? 'Rezultate pentru „' + esc(term) + '”' : (cat ? esc(cat.name) : 'Tot catalogul pentru ' + (seg === 'cabinet' ? 'cabinet' : 'laborator'));
    app.innerHTML = '<div class="wrap cat-layout"><nav class="side" aria-label="Categorii"><p class="kicker">' + (seg === 'cabinet' ? 'Cabinet' : 'Laborator') + ' · ' + P.filter(function (p) { return p.seg === seg; }).length + ' produse</p>' +
      '<a href="#/catalog?seg=' + seg + '" style="text-decoration:none"><button type="button" aria-pressed="' + (!cat && !term) + '"><span>Toate categoriile</span><span></span></button></a>' +
      cats.map(function (c) { return '<a href="#/catalog?seg=' + seg + '&cat=' + c.id + '" style="text-decoration:none" tabindex="-1"><button type="button" aria-pressed="' + (cat && cat.id === c.id && !term) + '"><span>' + esc(c.name) + '</span><span>' + catProducts(c.id).length + '</span></button></a>'; }).join('') +
      '</nav><div class="cat-main"><div class="cat-title"><h1>' + title + '</h1><span class="mono muted">' + list.length + ' produse</span></div>' + chips +
      (list.length ? '<div class="grid">' + list.map(card).join('') + '</div>' : '<p class="empty">Nu am găsit nimic. Sună la <a href="tel:+37379663311">079 66 33 11</a> și îți spunem dacă putem aduce produsul.</p>') +
      '</div></div>';
    setSeg(seg, true);
  }

  function product(id) {
    var p = byId[id]; if (!p) { app.innerHTML = '<div class="wrap section"><h1>Produsul nu există</h1><p><a href="#/catalog">Înapoi la catalog</a></p></div>'; return; }
    var c = catById[p.cat], lg = brandLogo(p.brand);
    var rel = catProducts(p.cat).filter(function (x) { return x.id !== p.id; }).sort(function (a, b) { return (b.brand === p.brand) - (a.brand === p.brand); }).slice(0, 4);
    var subj = encodeURIComponent('Cerere ofertă: ' + brandName(p.brand) + ' ' + p.name);
    var body = encodeURIComponent('Bună ziua,\n\nDoresc o ofertă pentru: ' + brandName(p.brand) + ' ' + p.name + '\nLink: ' + location.href + '\n\nNume:\nTelefon:\nCompanie:\n');
    app.innerHTML = '<div class="wrap"><nav class="crumbs" aria-label="Ești aici"><a href="#/">Acasă</a><span aria-hidden="true">/</span><a href="#/catalog?seg=' + c.seg + '&cat=' + c.id + '">' + esc(c.name) + '</a><span aria-hidden="true">/</span><span>' + esc(p.name) + '</span></nav>' +
      '<div class="pp"><div class="pp-img"><img src="' + img(p) + '" alt="' + esc(brandName(p.brand) + ' ' + p.name) + '"></div><div class="pp-info">' +
      (lg ? '<div class="pp-logo-wrap' + (isDark(p.brand) ? ' dk' : '') + '"><img class="pp-logo" src="' + lg + '" alt="' + esc(brandName(p.brand)) + '"></div>' : '<p class="kicker">' + esc(brandName(p.brand)) + '</p>') +
      '<h1>' + esc(p.name) + '</h1><p class="pp-desc">' + esc(p.desc) + '</p>' +
      '<div class="buy"><div class="buy-row">' + priceHtml(p) + (p.price ? '<div class="qty"><button type="button" data-q="-1" aria-label="Scade cantitatea">−</button><output id="qty">1</output><button type="button" data-q="1" aria-label="Crește cantitatea">+</button></div>' : '') + '</div>' +
      (p.price ? '<button class="btn lime" data-addq="' + p.id + '">Adaugă în coș</button>' : '<a class="btn lime" href="mailto:dentonemd@gmail.com?subject=' + subj + '&body=' + body + '">Cere ofertă pe e-mail</a>') +
      '<a class="btn dark-ghost" href="tel:+37379663311">Sună: 079 66 33 11</a>' +
      '<small>' + (p.price ? 'Prețul include taxele. Disponibilitatea o confirmăm la comandă.' : 'Prețul și termenul de livrare le confirmăm în aceeași zi lucrătoare.') + '</small></div>' +
      '<dl class="specs"><div><dt>Brand</dt><dd>' + esc(brandName(p.brand)) + '</dd></div><div><dt>Categorie</dt><dd>' + esc(c.name) + '</dd></div><div><dt>Pentru</dt><dd>' + (c.seg === 'cabinet' ? 'Cabinet stomatologic' : 'Laborator dentar') + '</dd></div></dl>' +
      '</div></div>' +
      (rel.length ? '<section class="section" style="padding-top:24px"><div class="section-h"><h2>Din aceeași categorie</h2><a class="link" href="#/catalog?seg=' + c.seg + '&cat=' + c.id + '">Toată categoria →</a></div><div class="grid">' + rel.map(card).join('') + '</div></section>' : '') + '</div>';
    document.title = p.name + ' — ' + brandName(p.brand) + ' | DENT1';
  }

  function brandsPage() {
    var counts = {}; P.forEach(function (p) { counts[p.brand] = (counts[p.brand] || 0) + 1; });
    var bs = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    app.innerHTML = '<div class="wrap section"><div class="section-h"><h1 style="font-size:clamp(32px,4vw,52px)">Branduri</h1><span class="mono muted">' + bs.length + ' producători</span></div><div class="brands">' +
      bs.map(function (b) { return brandTile(b, '#/catalog?brand=' + encodeURIComponent(b), counts[b]); }).join('') + '</div></div>';
  }

  function cartPage() {
    var c = getCart(), ids = Object.keys(c).filter(function (k) { return byId[k]; });
    var total = 0, lines = ids.map(function (k) { var p = byId[k]; total += num(p.price) * c[k];
      return '<div class="cart-line"><img src="' + img(p) + '" alt=""><div><span class="card-brand">' + esc(brandName(p.brand)) + '</span><div><a href="#/p/' + p.id + '" style="font-weight:600">' + esc(p.name) + '</a></div>' + priceHtml(p) + '</div>' +
        '<div class="qty"><button type="button" data-cq="' + k + '" data-d="-1" aria-label="Scade">−</button><output>' + c[k] + '</output><button type="button" data-cq="' + k + '" data-d="1" aria-label="Crește">+</button></div></div>'; }).join('');
    app.innerHTML = '<div class="wrap two"><div class="panel"><h1 style="font-size:36px;margin-bottom:8px">Coș</h1>' +
      (ids.length ? lines + '<div class="cart-line" style="grid-template-columns:1fr auto"><strong>Total estimativ</strong><span class="price" style="font-size:22px">' + fmt(total) + ' MDL</span></div><p class="muted small">Prețurile „de la” depind de variantă; totalul final îl confirmăm la comandă.</p>'
        : '<p class="muted">Coșul e gol. <a href="#/catalog">Mergi la catalog</a>.</p>') + '</div>' +
      '<form class="panel" id="orderForm"><h2 style="font-size:26px;margin-bottom:16px">Trimite comanda</h2>' +
      '<div class="field"><label for="f1">Nume și prenume</label><input id="f1" name="nume" required autocomplete="name"></div>' +
      '<div class="field"><label for="f2">Telefon</label><input id="f2" name="tel" required autocomplete="tel" inputmode="tel"></div>' +
      '<div class="field"><label for="f3">Clinică / laborator</label><input id="f3" name="firma" autocomplete="organization"></div>' +
      '<div class="field"><label for="f4">Mesaj</label><textarea id="f4" name="msg" placeholder="Nuanțe, mărimi, termen dorit…"></textarea></div>' +
      '<button class="btn lime" type="submit"' + (ids.length ? '' : ' disabled') + '>Trimite pe e-mail</button>' +
      '<p class="muted small">Se deschide aplicația ta de e-mail cu comanda completată, adresată către dentonemd@gmail.com.</p></form></div>';
    var f = document.getElementById('orderForm');
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var d = new FormData(f);
      var txt = 'Comandă de pe site\n\n' + ids.map(function (k) { var p = byId[k]; return '- ' + brandName(p.brand) + ' ' + p.name + ' × ' + c[k] + (p.price ? ' (' + p.price + ' MDL)' : ' (preț la cerere)'); }).join('\n') +
        '\n\nTotal estimativ: ' + fmt(total) + ' MDL\n\nNume: ' + d.get('nume') + '\nTelefon: ' + d.get('tel') + '\nFirmă: ' + d.get('firma') + '\nMesaj: ' + d.get('msg');
      location.href = 'mailto:dentonemd@gmail.com?subject=' + encodeURIComponent('Comandă DENT1 — ' + d.get('nume')) + '&body=' + encodeURIComponent(txt);
    });
  }

  function contact() {
    app.innerHTML = '<div class="wrap two"><div><p class="kicker">Contact</p><h1 style="font-size:clamp(34px,4vw,56px);margin:10px 0 20px">Hai să vorbim despre ce îți trebuie.</h1>' +
      '<div class="contact-list"><a href="tel:+37379663311"><span>Telefon</span><span class="mono">079 66 33 11</span></a>' +
      '<a href="mailto:dentonemd@gmail.com"><span>E-mail</span><span>dentonemd@gmail.com</span></a>' +
      '<div><span>Adresă</span><span>Str. Nicolai Zelinski 7/1, Chișinău</span></div>' +
      '<div><span>Program</span><span>Luni–vineri, 9:00–18:00</span></div>' +
      '<div><span>Companie</span><span>DENT ONE GROUP SRL</span></div></div>' +
      '<p style="margin-top:20px"><a class="btn" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Strada Nicolai Zelinski 7/1, Chișinău') + '" rel="noopener" target="_blank">Deschide în Google Maps</a></p></div>' +
      '<form class="panel" id="msgForm"><h2 style="font-size:26px;margin-bottom:16px">Cere o ofertă</h2>' +
      '<div class="field"><label for="m1">Nume</label><input id="m1" name="nume" required autocomplete="name"></div>' +
      '<div class="field"><label for="m2">Telefon</label><input id="m2" name="tel" required autocomplete="tel" inputmode="tel"></div>' +
      '<div class="field"><label for="m3">Ce produse te interesează?</label><textarea id="m3" name="msg" required></textarea></div>' +
      '<button class="btn lime" type="submit">Trimite pe e-mail</button></form></div>';
    var f = document.getElementById('msgForm');
    f.addEventListener('submit', function (e) { e.preventDefault(); var d = new FormData(f);
      location.href = 'mailto:dentonemd@gmail.com?subject=' + encodeURIComponent('Cerere ofertă — ' + d.get('nume')) + '&body=' + encodeURIComponent(d.get('msg') + '\n\nNume: ' + d.get('nume') + '\nTelefon: ' + d.get('tel')); });
  }

  // ---------- router ----------
  function parse() {
    var h = location.hash.replace(/^#/, '') || '/', i = h.indexOf('?'), path = i < 0 ? h : h.slice(0, i), q = {};
    if (i >= 0) h.slice(i + 1).split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) q[a[0]] = decodeURIComponent((a[1] || '').replace(/\+/g, ' ')); });
    return { path: path, q: q };
  }
  function route() {
    var r = parse(); document.title = 'DENT1 — magazin dentar pentru cabinet și laborator';
    if (r.path === '/' || r.path === '') home();
    else if (r.path === '/catalog') catalog(r.q);
    else if (r.path.indexOf('/p/') === 0) product(r.path.slice(3));
    else if (r.path === '/branduri') brandsPage();
    else if (r.path === '/cos') cartPage();
    else if (r.path === '/contact') contact();
    else home();
    document.getElementById('searchInput').value = r.q.q || '';
    window.scrollTo(0, 0);
  }
  function setSeg(seg, quiet) {
    state.seg = seg; try { localStorage.setItem('seg', seg); } catch (e) {}
    document.querySelectorAll('.seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.seg === seg)); });
    document.getElementById('catNav').innerHTML = segCats(seg).map(function (c) { return '<a href="#/catalog?seg=' + seg + '&cat=' + c.id + '">' + esc(c.name) + '</a>'; }).join('');
    if (!quiet) { var r = parse(); if (r.path === '/catalog') location.hash = '#/catalog?seg=' + seg; else route(); }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-addq],[data-q],[data-cq],.seg button'); if (!t) return;
    if (t.dataset.add) { e.preventDefault(); addToCart(t.dataset.add, 1); }
    else if (t.dataset.addq) { addToCart(t.dataset.addq, +document.getElementById('qty').textContent); }
    else if (t.dataset.q) { var o = document.getElementById('qty'); o.textContent = Math.max(1, +o.textContent + +t.dataset.q); }
    else if (t.dataset.cq) { var c = getCart(); c[t.dataset.cq] = (c[t.dataset.cq] || 0) + +t.dataset.d; if (c[t.dataset.cq] <= 0) delete c[t.dataset.cq]; setCart(c); cartPage(); }
    else if (t.dataset.seg) setSeg(t.dataset.seg);
  });
  document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault(); var v = document.getElementById('searchInput').value.trim();
    location.hash = v ? '#/catalog?q=' + encodeURIComponent(v) : '#/catalog';
  });
  document.getElementById('footerCats').innerHTML = CATS.slice(0, 6).map(function (c) { return '<a href="#/catalog?seg=' + c.seg + '&cat=' + c.id + '">' + esc(c.name) + '</a>'; }).join('') + '<a href="#/catalog">Tot catalogul</a>';
  window.addEventListener('hashchange', route);
  setSeg(state.seg, true); updateCount(); route();
})
;
})();
