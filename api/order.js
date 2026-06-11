export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, wilaya, baladiya, product } = req.body;

  if (!name || !phone || !wilaya || !baladiya || !product) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Bot not configured' });
  }

  const now = new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' });

  const message =
    `🛍 <b>طلب جديد!</b>\n\n` +
    `📦 <b>المنتج:</b> ${product}\n` +
    `👤 <b>الاسم:</b> ${name}\n` +
    `📞 <b>الهاتف:</b> ${phone}\n` +
    `🗺 <b>الولاية:</b> ${wilaya}\n` +
    `🏘 <b>البلدية:</b> ${baladiya}\n\n` +
    `⏰ <b>التوقيت:</b> ${now}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Telegram error:', tgData);
      return res.status(500).json({ error: 'Telegram send failed' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
