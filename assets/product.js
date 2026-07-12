/* Tstore.ge — პროდუქტის გვერდის ლოგიკა */

/* შეკვეთა იგზავნება Cloudflare Function-ზე (/api/order),
   რომელიც შემდეგ Telegram-ში აგზავნის შეტყობინებას.
   კლიენტს არაფრის კოპირება არ სჭირდება. */
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
  const gv = id => (document.getElementById(id) || {}).value ? document.getElementById(id).value.trim() : '';
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

  try {
    const res = await fetch(ORDER_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ source:'tstore.ge', slug, model, price, quantity, name, surname, phone, address, total })
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || 'failed');

    msg.classList.add('ok');
    msg.textContent = '✓ შეკვეთა მიღებულია! მალე დაგიკავშირდებით ნომერზე ' + phone + '.';
    btn.textContent = '✓ გაგზავნილია';
  } catch (e) {
    msg.classList.add('err');
    msg.innerHTML = 'ვერ გაიგზავნა. სცადე ხელახლა ან მოგვწერე პირდაპირ: ' +
      '<a href="' + MESSENGER_URL + '" target="_blank" rel="noopener" style="color:var(--accent);font-weight:500">Messenger</a>';
    btn.disabled = false;
    btn.textContent = 'შეკვეთის გაგზავნა';
  }
}

function fail(msg, text) {
  msg.textContent = text;
  msg.classList.add('err');
}
