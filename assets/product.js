/* Tstore.ge — პროდუქტის გვერდის ლოგიკა */

/* ───────────────────────────────────────────────
   შეკვეთების მიღება:
   • ნაგულისხმევად: შეკვეთა იკოპირება და Messenger იხსნება,
     სადაც მომხმარებელი მონაცემებს ჩასვამს და გააგზავნის.
   • სურვილისამებრ: ჩასვი Make.com Webhook-ის URL ქვემოთ —
     მაშინ შეკვეთა ავტომატურადაც გაიგზავნება (Messenger-ის გვერდით).
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

/* ტექსტის კოპირება (clipboard + fallback) */
function copyText(t) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t);
      return;
    }
  } catch (e) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = t;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch (e) {}
}

/* შეკვეთის გაგზავნა */
async function submitOrder(slug, model, price) {
  const name    = (document.getElementById('ordName')    || {}).value?.trim() || '';
  const surname = (document.getElementById('ordSurname') || {}).value?.trim() || '';
  const phone   = (document.getElementById('ordPhone')   || {}).value?.trim() || '';
  const address = (document.getElementById('ordAddress') || {}).value?.trim() || '';
  const quantity = parseInt(document.getElementById('ordQty').textContent);
  const msg = document.getElementById('ordMsg');
  msg.className = 'modal-msg';
  msg.innerHTML = '';

  /* ვალიდაცია */
  if (!name || !surname) {
    msg.textContent = 'გთხოვ, მიუთითე სახელი და გვარი';
    msg.classList.add('err'); return;
  }
  if (phone.replace(/\D/g, '').length < 9) {
    msg.textContent = 'გთხოვ, მიუთითე სწორი ტელეფონის ნომერი';
    msg.classList.add('err'); return;
  }
  if (!address) {
    msg.textContent = 'გთხოვ, მიუთითე სრული მისამართი';
    msg.classList.add('err'); return;
  }

  const total = price * quantity;
  const orderText =
    '🛒 ახალი შეკვეთა — ' + model + '\n' +
    '👤 ' + name + ' ' + surname + '\n' +
    '📞 ' + phone + '\n' +
    '📍 ' + address + '\n' +
    '🔢 რაოდენობა: ' + quantity + ' ცალი\n' +
    '💰 ჯამი: ' + total + ' ₾';

  /* სურვილისამებრ — Make.com Webhook (თუ მითითებულია) */
  if (ORDER_WEBHOOK_URL) {
    try {
      await fetch(ORDER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'tstore.ge', model, slug, price, quantity,
          name, surname, phone, address, total,
          time: new Date().toISOString()
        })
      });
    } catch (e) { /* ვაგრძელებთ Messenger-ით */ }
  }

  /* კოპირება + Messenger */
  copyText(orderText);
  window.open(MESSENGER_URL, '_blank');

  msg.classList.add('ok');
  msg.innerHTML = '✓ შეკვეთა დაკოპირდა და Messenger გაიხსნა — ჩასვი (Paste) და გააგზავნე.' +
    '<div style="font-size:12px;opacity:.75;margin-top:6px">თუ ავტომატურად არ ჩაისვა, ქვემოთ ხელით დააკოპირე:</div>';
  const pre = document.createElement('textarea');
  pre.value = orderText;
  pre.readOnly = true;
  pre.onclick = function(){ this.select(); };
  pre.style.cssText = 'width:100%;margin-top:8px;min-height:104px;border:1px solid #e5e5e5;border-radius:8px;padding:10px;font-size:13px;font-family:inherit;resize:vertical;';
  msg.appendChild(pre);
}
