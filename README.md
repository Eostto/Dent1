# DENT1 — site nou

Site static (HTML, CSS, JavaScript simplu, fără build) pentru magazinul DENT1: catalog de produse pentru cabinete stomatologice și laboratoare dentare.

## Structură
- `index.html` — pagina (navigarea se face cu `#/catalog`, `#/p/<id>`, `#/branduri`, `#/cos`, `#/contact`)
- `assets/style.css` — design
- `assets/app.js` — catalog, căutare, coș (salvat în browser), formulare care trimit pe e-mail
- `assets/data.js` — toate produsele, categoriile și brandurile
- `img/p/` — pozele produselor, `img/brands/` — logourile producătorilor

## Rulare locală
Deschide un terminal în acest folder și rulează `python3 -m http.server 8000`, apoi intră pe http://localhost:8000.

## Publicare
Fiecare commit pe ramura `main` se publică automat pe Vercel.
