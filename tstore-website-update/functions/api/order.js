/* Cloudflare Pages Function — POST /api/order
   შეკვეთას იღებს საიტიდან და აგზავნის Telegram-ში.
   Token და Chat ID ინახება Cloudflare-ის Environment Variables-ში
   (TG_TOKEN, TG_CHAT) — საიტის კოდში არ ჩანს. */

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const d = await request.json();
    const token = env.TG_TOKEN;
    const chat  = env.TG_CHAT;
    if (!token || !chat) {
      return json({ ok:false, error:'not_configured' }, 500);
    }

    const esc = (v) => String(v == null ? '' : v);
    const text =
      '🛒 ახალი შეკვეთა — ' + esc(d.model) + '\n' +
      '👤 ' + esc(d.name) + ' ' + esc(d.surname) + '\n' +
      '📞 ' + esc(d.phone) + '\n' +
      '📍 ' + esc(d.address) + '\n' +
      '🔢 რაოდენობა: ' + esc(d.quantity || 1) + ' ცალი\n' +
      '💰 ჯამი: ' + esc(d.total) + ' ₾\n' +
      '🕐 ' + new Date().toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi' });

    const tg = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true })
    });

    if (!tg.ok) {
      return json({ ok:false, error:'telegram_failed' }, 502);
    }
    return json({ ok:true });
  } catch (e) {
    return json({ ok:false, error:'bad_request' }, 400);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}
