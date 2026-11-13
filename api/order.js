/**
 * Proxy pesanan — menerima pesanan dari troli laman dan menghantar ke sistem.
 */
const GAS_URL = process.env.P8_API_URL ||
  'https://script.google.com/macros/s/AKfycbwr7XU1PvjtsIgoPdqv30mZRAt3vaVXHXfuoieSEPg0hHWbARzq_rgdYJERbvoN_-gt/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    let token = '';
    let data = {};
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      token = body.token || '';
      data = body.data || {};
    } else {
      const q = req.query || {};
      token = q.token || '';
      try { data = JSON.parse(q.data || '{}'); } catch (e) { data = {}; }
    }
    if (!data.token) data.token = token;

    const url = GAS_URL + '?api=order&callback=cb&t=' + Date.now() +
      '&token=' + encodeURIComponent(token) +
      '&data=' + encodeURIComponent(JSON.stringify(data));

    const r = await fetch(url, { headers: { 'User-Agent': 'P8-Site/1.0' }, redirect: 'follow' });
    const text = await r.text();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end < 0) throw new Error('Respons sistem tidak sah');
    res.status(200).json(JSON.parse(text.slice(start, end + 1)));
  } catch (err) {
    res.status(502).json({ success: false, message: String((err && err.message) || err) });
  }
};
