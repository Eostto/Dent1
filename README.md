# DENT1 — site nou

Site static (HTML, CSS, JavaScript simplu, fără build) pentru magazinul DENT1: catalog de produse pentru cabinete stomatologice și laboratoare dentare.

## Structură
- `index.html` — pagina (navigarea se face cu `#/catalog`, `#/p/<id>`, `#/branduri`, `#/cos`, `#/contact`)
- `assets/style.css` — design
- `assets/app.js` — catalog, căutare, coș (salvat în browser), formulare care trimit pe e-mail
- `data/products.json` — toate produsele (un obiect pe produs)
- `data/categories.json` — categoriile
- `data/brands.json` — brandurile și logourile

## Cum adaugi un produs
Adaugă un obiect nou în `data/products.json`:

```json
{
 "id": "brand-nume-produs",
 "seg": "cabinet",
 "cat": "steril",
 "sub": "autoclav",
 "brand": "YESON",
 "name": "Numele produsului",
 "note": "Descriere scurtă (apare pe card)",
 "price": "12.500",
 "photo": true,
 "desc": "Descrierea completă de pe pagina produsului."
}
```

- `seg`: `cabinet` sau `laborator`
- `cat`: un `id` din `data/categories.json`
- `sub`: tipul produsului, un `id` din lista `subs` a categoriei (ex. `autoclav`, `sigil`)
- ordinea din fișier = ordinea „Recomandate” de pe site
- `brand`: o cheie din `data/brands.json`
- `price`: gol (`""`) înseamnă „Preț la cerere”; „de la 290” e acceptat
- poza: `img/p/<id>.webp`
- `img/p/` — pozele produselor, `img/brands/` — logourile producătorilor

## Rulare locală
Deschide un terminal în acest folder și rulează `python3 -m http.server 8000`, apoi intră pe http://localhost:8000.

## Publicare
Fiecare commit pe ramura `main` se publică automat pe Vercel.
