/* Tstore.ge — პროდუქტის გვერდის ლოგიკა */

/* შეკვეთა იგზავნება Cloudflare Function-ზე (/api/order) → Telegram
   (გოგას პირადი ჩანაწერისთვის), შემდეგ კლიენტს Messenger ეხსნება,
   სადაც კომუნიკაცია გრძელდება. */
const ORDER_ENDPOINT = "/api/order";
const MESSENGER_URL  = "https://m.me/61556465853536";

/* გალერეა */
document.querySelectorAll('.thumb').forEach(t => {
  t.addEventListener('click', () => {
    if (t.classList.contains('noimg')) return;
    document.querySelectorAll('.thumb').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const main = document.querySelector('#mainImg img');
    main.style.display = '';
    document.getElementById('mainImg').classList.remove('noimg');
    main.src = t.dataset.src;
  });
});

/* მოდალი */
function openOrder() {
  document.getElementById('orderModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeOrder() {
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('orderModal').addEventListener('click', e => {
  if (e.target.id === 'orderModal') closeOrder();
});

/* რაოდენობა */
function qty(d) {
  const el = document.getElementById('ordQty');
  el.textContent = Math.max(1, parseInt(el.textContent) + d);
}

/* შეკვეთის გაგზავნა */
async function submitOrder(slug, model, price) {
  const gv = id => (document.getElementById(id) && document.getElementById(id).value) ? document.getElementById(id).value.trim() : '';
  const name    = gv('ordName');
  const surname = gv('ordSurname');
  const phone   = gv('ordPhone');
  const address = gv('ordAddress');
  const quantity = parseInt(document.getElementById('ordQty').textContent);
  const msg = document.getElementById('ordMsg');
  const btn = document.getElementById('ordSubmit');
  msg.className = 'modal-msg';
  msg.innerHTML = '';

  /* ვალიდაცია */
  if (!name || !surname) { return fail(msg, 'გთხოვ, მიუთითე სახელი და გვარი'); }
  if (phone.replace(/\D/g, '').length < 9) { return fail(msg, 'გთხოვ, მიუთითე სწორი ტელეფონის ნომერი'); }
  if (!address) { return fail(msg, 'გთხოვ, მიუთითე სრული მისამართი'); }

  const total = price * quantity;
  btn.disabled = true;
  btn.textContent = 'იგზავნება…';

  /* Messenger ვხსნით მაშინვე (მომხმარებლის დაჭერის კონტექსტში, რომ ბრაუზერმა არ დაბლოკოს) */
  const mWin = window.open(MESSENGER_URL, '_blank');

  /* შეკვეთას ვაგზავნით Telegram-ში (ფონურად) */
  try {
    await fetch(ORDER_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ source:'tstore.ge', slug, model, price, quantity, name, surname, phone, address, total })
    });
  } catch (e) { /* Messenger ისედაც გაიხსნა — კომუნიკაცია იქ გაგრძელდება */ }

  /* წარმატების ეკრანი — კონტაქტი Messenger-ზე */
  msg.classList.add('ok');
  msg.innerHTML =
    '✓ შეკვეთა მიღებულია!' +
    '<div style="font-size:13px;color:#555;margin:6px 0 12px;line-height:1.5">' +
    'Messenger გაიხსნა — მოგვწერე იქ ერთი შეტყობინება დასადასტურებლად და მიწოდებას მოვაგვარებთ.' +
    '</div>';
  const a = document.createElement('a');
  a.href = MESSENGER_URL;
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = '<i class="ti ti-brand-messenger"></i> გააგრძელე Messenger-ში';
  a.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#fff;padding:14px;border-radius:10px;text-decoration:none;font-weight:600;';
  msg.appendChild(a);
  btn.style.display = 'none';
}

function fail(msg, text) {
  msg.textContent = text;
  msg.classList.add('err');
}
