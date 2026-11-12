# P8 Harum Manis — Laman Web Awam

Laman pemasaran + portal sistem inventori GAS.
Reka bentuk custom: hero gelap, produk krim, emerald & mango amber.
BM/EN, responsif, SEO, sedia untuk **GitHub + Vercel**.

## Live

- **Vercel (utama):** <https://p8-harum-manis.vercel.app/>
- **GitHub Pages (sandaran):** <https://qoryproject.github.io/p8-harum-manis-web/>
- **GitHub repo:** <https://github.com/qoryproject/p8-harum-manis-web>
- **Auto-deploy:** setiap `git push` ke `main` akan deploy semula ke Vercel
  secara automatik (projek Vercel `p8-harum-manis` ↔ repo `p8-harum-manis-web`).

## Struktur

```
site/
├── index.html          ← landing page
├── styles.css
├── script.js           ← BM/EN, filter produk, reveal, WhatsApp
├── config.js           ← URL sistem, WhatsApp, e-mel, domain
├── app.html            ← halaman pelancar sistem (buka GAS dalam tab baharu)
├── app.css
├── vercel.json         ← config Vercel
├── .gitignore
├── .vercelignore
├── manifest.webmanifest
├── robots.txt
├── sitemap.xml
├── assets/favicon.svg
├── assets/og-cover.png
└── assets/og-cover.html
```

---

## 1. Edit `config.js` sebelum push

```js
window.P8_CONFIG = {
  appUrl: 'https://script.google.com/macros/s/.../exec',
  siteUrl: 'https://p8-harum-manis.vercel.app',
  whatsapp: '60123456789',
  email: 'hello@p8harumanis.com',
  location: 'Chuping, Perlis, Malaysia'
};
```

- `appUrl` — URL Web App GAS Version 4.
- `whatsapp` — nombor tanpa `+`/sengkang.
- `email` — e-mel pesanan.
- `siteUrl` — domain Vercel selepas deploy.

Selepas deploy, kemas kini juga:

- `<link rel="canonical">` dalam `index.html`
- `og:url`, `og:image`, `twitter:*`
- `sitemap.xml`
- `robots.txt` (`Sitemap:`)

---

## 2. Push ke GitHub

Buat repo kosong di GitHub (tanpa README/Actions):

```
https://github.com/new
Nama cadangan: p8-harum-manis-web
Visibility: Public
```

Kemudian dari folder `site`:

```powershell
cd "C:\Users\User\OneDrive\Desktop\Project\New P8\p8-harum-manis-app\site"

git init
git add .
git commit -m "P8 Harum Manis public website"
git branch -M main
git remote add origin https://github.com/USERNAME/p8-harum-manis-web.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub anda.

Jika repo sudah ada README:

```powershell
git pull --rebase origin main
git push -u origin main
```

---

## 3. Deploy ke Vercel

### Cara paling mudah — import repo

1. Buka <https://vercel.com/new>.
2. Pilih **Import Git Repository** → `p8-harum-manis-web`.
3. Tetapan:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (repo ini memang folder site)
   - **Build Command:** kosongkan
   - **Output Directory:** `./`
4. Klik **Deploy**.
5. URL percuma: `https://p8-harum-manis-web.vercel.app`
6. Tukar nama projek di **Settings → General → Project Name** untuk URL yang lebih cantik.

Setiap `git push` ke `main` akan auto-deploy.

### Cara CLI

```powershell
npm install -g vercel
cd "C:\Users\User\OneDrive\Desktop\Project\New P8\p8-harum-manis-app\site"
vercel
vercel --prod
```

---

## 4. Domain

- **Percuma:** subdomain `*.vercel.app` (contoh `p8-harum-manis.vercel.app`).
- **Domain sendiri:** beli `.com`/`.my`, kemudian Vercel → **Settings → Domains** → tambah domain → ikut rekod DNS.
- Untuk domain sendiri, kemas kini `canonical`, `og:url`, `sitemap.xml`, `robots.txt`.

---

## 5. SEO — mudah dicari

1. Daftar di **Google Search Console**.
2. Tambah domain Vercel.
3. Hantar `sitemap.xml`.
4. Pastikan `canonical` dan `og:url` guna domain sebenar.
5. Letak link di Google Business Profile, Facebook, TikTok, WhatsApp Business.
6. Kata kunci: `Harumanis Perlis`, `P8 Harum Manis`, `serunding Harumanis`,
   `kordial Harumanis`, `inventori Harumanis`.

Laman sudah ada:

- `<title>` + meta description
- Open Graph + Twitter Card
- JSON-LD `Organization`
- `h1/h2` semantik, `alt` imej
- `robots.txt`, `sitemap.xml`
- Laman statik ringan (tiada framework)

---

## 6. Sistem GAS dalam laman

Butang **Buka Sistem** membuka URL `/exec` GAS dalam **tab baharu**.
Ini lebih stabil daripada iframe kerana:

- Chrome/Safari boleh menyekat Google login dalam iframe.
- Kamera lebih mudah dibenarkan dalam tab penuh.
- Tiada ralat “Sorry, unable to open the file at present” daripada Google Drive.

`app.html` ialah halaman pelancaran fallback dengan butang dan salinan URL.
`app.html` `noindex` dan disekat dalam `robots.txt`.

Jika anda mahu embed iframe juga, tambah semula iframe secara manual — tetapi
tab baharu adalah cara yang disyorkan untuk produksi.

---

## 7. Ujian tempatan

```powershell
# dari folder p8-harum-manis-app
powershell -ExecutionPolicy Bypass -File serve.ps1

# buka
http://localhost:8765/site/
```

---

## 8. Nota

- Harga produk adalah **harga runcit**; kos/komisen tidak dipaparkan.
- Tukar imej produk dengan foto sebenar di `assets/` dan kemas kini `src`.
- `assets/og-cover.png` ialah gambar 1200×630 untuk preview WhatsApp/Facebook.
- Jika URL GAS bertukar (deploy version baharu), kemas kini `config.js` dan push semula.
