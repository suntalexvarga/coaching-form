# Formular Alex Varga

Formular multi-step (stil typeform) care replică Google Form-ul „Primul pas către tine".
La final, utilizatorul își scrie numele și este redirecționat către WhatsApp
(0754 404 004) cu un mesaj precompletat conținând toate răspunsurile — el doar apasă Send.

Site 100% static, fără backend, fără bază de date. Răspunsurile nu se salvează
nicăieri — ajung doar în mesajul WhatsApp.

## Configurare

Totul se schimbă din [lib/config.ts](lib/config.ts):

- `whatsappNumber` — numărul WhatsApp în format internațional, fără `+`
  (0754404004 → `40754404004`)
- `brandName` / `brandTld` — logo-ul din header
- `formTitle` / `formDescription` — textele de pe primul ecran

Întrebările sunt definite în [components/FormWizard.tsx](components/FormWizard.tsx)
în array-ul `STEPS`.

## Rulare locală

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy pe Vercel (recomandat)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Apoi domeniul custom: Vercel Dashboard → proiect → Settings → Domains → Add,
și pui la registrarul domeniului un CNAME către `cname.vercel-dns.com`
(sau A record `76.76.21.21` pentru domeniul rădăcină). Gratuit, cu HTTPS automat.

Alternativ: proiectul are `output: "export"` (folderul `out/` după `npm run build`),
deci merge identic și pe Netlify sau Cloudflare Pages.
