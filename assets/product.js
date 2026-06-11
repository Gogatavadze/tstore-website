/* Tstore.ge — პროდუქტის გვერდის ლოგიკა */

/* ───────────────────────────────────────────────
   შეკვეთების მიღება:
   1) Make.com-ში შექმენი სცენარი Webhook ტრიგერით
   2) ჩასვი Webhook-ის URL ქვემოთ, ბრჭყალებში
   3) ცარიელად დატოვების შემთხვევაში ღილაკი
      მომხმარებელს Messenger-ზე გადაამისამართებს
─────────────────────────────────────────────── */
const ORDER_WEBHOOK_URL = "";  // ← მაგ: "https://hook.eu2.make.com/xxxxxxxx"
const MESSENGER_URL = "https://m.me/61556465853536";

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
  const phone = document.getElementById('ordPhone').value.trim();
  const name = document.getElementById('ordName').value.trim();
  const quantity = parseInt(document.getElementById('ordQty').textContent);
  const msg = document.getElementById('ordMsg');
  msg.className = 'modal-msg';

  if (phone.replace(/\D/g, '').length < 9) {
    msg.textContent = 'გთხოვ, მიუთითე სწორი ტელეფონის ნომერი';
    msg.classList.add('err');
    return;
  }

  if (!ORDER_WEBHOOK_URL) {
    // Webhook არ არის მითითებული — Messenger-ზე გადამისამართება
    window.open(MESSENGER_URL, '_blank');
    msg.textContent = 'გადადი Messenger-ში და მოგვწერე — მალე გიპასუხებთ!';
    msg.classList.add('ok');
    return;
  }

  const btn = document.getElementById('ordSubmit');
  btn.disabled = true;
  btn.textContent = 'იგზავნება…';

  try {
    const res = await fetch(ORDER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'tstore.ge',
        model: model,
        slug: slug,
        price: price,
        quantity: quantity,
        name: name,
        phone: phone,
        total: price * quantity,
        time: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error();
    msg.textContent = '✓ შეკვეთა მიღებულია! მალე დაგიკავშირდებით.';
    msg.classList.add('ok');
    btn.textContent = '✓ გაგზავნილია';
  } catch (e) {
    msg.textContent = 'შეცდომა გაგზავნისას — სცადე ზარი ან Messenger';
    msg.classList.add('err');
    btn.disabled = false;
    btn.textContent = 'შეკვეთის გაგზავნა';
  }
}
