/**
 * Proxy produk — laman web tidak lagi memanggil script.google.com terus.
 * Data diambil dari API awam Apps Script di sebelah server Vercel.
 */
const GAS_URL = process.env.P8_API_URL ||
  'https://script.google.com/macros/s/AKfycbwr7XU1PvjtsIgoPdqv30mZRAt3vaVXHXfuoieSEPg0hHWbARzq_rgdYJERbvoN_-gt/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const target = GAS_URL + '?api=products&callback=cb&t=' + Date.now();
    const r = await fetch(target, {
      headers: { 'User-Agent': 'P8-Site/1.0' },
      redirect: 'follow'
    });
    const text = await r.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end < 0) throw new Error('Respons sistem tidak sah');
    const json = JSON.parse(text.slice(start, end + 1));
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    res.status(200).json(json);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ ok: false, message: String((err && err.message) || err) });
  }
};
