/* P8 Harum Manis — troli & pesanan web (auto tolak stok) */
(function () {
  'use strict';

  var CONFIG = window.P8_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var STORAGE = 'p8_cart_v1';
  var cart = [];

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'ms'; }
  function T(ms, en) { return lang() === 'en' ? en : ms; }
  function money(n) { return 'RM ' + Number(n || 0).toFixed(2); }

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE);
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch (e) { cart = []; }
  }

  function saveCart() {
    try { localStorage.setItem(STORAGE, JSON.stringify(cart)); } catch (e) {}
  }

  function count() { return cart.reduce(function (s, it) { return s + Number(it.qty || 0); }, 0); }
  function subtotal() { return cart.reduce(function (s, it) { return s + Number(it.harga || 0) * Number(it.qty || 0); }, 0); }
  function shippingInfo() {
    var s = window.P8_SHIPPING || {};
    var on = (typeof s.on === 'boolean') ? s.on : true;
    var fee = Number(s.fee);
    if (!isFinite(fee)) fee = Number(CONFIG.shippingFee || 8);
    return { on: on, fee: on ? fee : 0 };
  }

  function shipping() {
    var mode = ($('#checkoutForm [name="ambil"]') || {}).value || 'Penghantaran';
    if (mode === 'Ambil di depot') return 0;
    return shippingInfo().fee;
  }

  function updateShippingLabel() {
    var sel = $('#checkoutForm [name="ambil"]');
    if (!sel) return;
    var info = shippingInfo();
    var opt = sel.querySelector('option[value="Penghantaran"]');
    if (!opt) return;
    opt.textContent = info.on
      ? T('Penghantaran (RM ' + info.fee.toFixed(2) + ')', 'Delivery (RM ' + info.fee.toFixed(2) + ')')
      : T('Penghantaran (percuma)', 'Delivery (free)');
  }

  function addItem(sku, nama, harga) {
    var found = null;
    cart.forEach(function (it) { if (it.sku === sku) found = it; });
    if (found) found.qty = Math.min(50, Number(found.qty) + 1);
    else cart.push({ sku: sku, nama: nama, harga: Number(harga || 0), qty: 1 });
    saveCart();
    render();
    openCart();
    toast(T('Ditambah ke troli', 'Added to cart'), nama);
  }

  function setQty(sku, qty) {
    cart.forEach(function (it) { if (it.sku === sku) it.qty = Math.max(0, Math.min(50, qty)); });
    cart = cart.filter(function (it) { return it.qty > 0; });
    saveCart();
    render();
  }

  function render() {
    var badge = $('#cartCount');
    if (badge) {
      badge.textContent = String(count());
      badge.classList.toggle('empty', count() === 0);
    }
    var body = $('#cartBody');
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty"><span class="ms">shopping_bag</span><p>' +
        T('Troli anda kosong.', 'Your cart is empty.') + '</p></div>';
      var total0 = $('#cartTotal'); if (total0) total0.textContent = money(0);
      var co = $('#cartCheckout'); if (co) co.disabled = true;
      return;
    }
    body.innerHTML = cart.map(function (it) {
      return '<div class="cart-item" data-sku="' + it.sku + '">' +
        '<div class="cart-item-main"><b>' + it.nama + '</b><span>' + money(it.harga) + ' × ' + it.qty + '</span></div>' +
        '<div class="cart-qty">' +
        '<button type="button" data-qty="-1" aria-label="-"}>−</button>' +
        '<span>' + it.qty + '</span>' +
        '<button type="button" data-qty="1" aria-label="+">+</button>' +
        '</div>' +
        '<div class="cart-line">' + money(it.harga * it.qty) + '</div>' +
        '</div>';
    }).join('');
    $$('[data-qty]', body).forEach(function (b) {
      b.addEventListener('click', function () {
        var sku = b.closest('.cart-item').dataset.sku;
        var it = cart.filter(function (x) { return x.sku === sku; })[0];
        if (it) setQty(sku, Number(it.qty) + Number(b.dataset.qty));
      });
    });
    var totalEl = $('#cartTotal');
    if (totalEl) totalEl.textContent = money(subtotal());
    var coBtn = $('#cartCheckout');
    if (coBtn) coBtn.disabled = false;
  }

  function openCart() {
    var d = $('#cartDrawer'); var o = $('#cartOverlay');
    if (d) { d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); }
    if (o) o.classList.add('open');
  }

  function closeCart() {
    var d = $('#cartDrawer'); var o = $('#cartOverlay');
    if (d) { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); }
    if (o) o.classList.remove('open');
  }

  function openCheckout() {
    if (!cart.length) return;
    closeCart();
    var m = $('#checkoutModal');
    if (m) { m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); }
    updateCheckoutNote();
  }

  function closeCheckout() {
    var m = $('#checkoutModal');
    if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); }
  }

  function updateCheckoutNote() {
    var note = $('#checkoutSummary');
    if (!note) return;
    var ship = shipping();
    note.innerHTML = '<span>' + T('Subjumlah', 'Subtotal') + '</span><b>' + money(subtotal()) + '</b>' +
      '<span>' + T('Penghantaran', 'Shipping') + '</span><b>' + (ship ? money(ship) : T('Percuma', 'Free')) + '</b>' +
      '<span class="grand">' + T('Jumlah', 'Total') + '</span><b class="grand">' + money(subtotal() + ship) + '</b>';
  }

  function apiOrder(payload) {
    return fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: payload.token, data: payload.data })
    }).then(function (r) { return r.json(); })
      .catch(function () {
        return { success: false, message: T('Sambungan ke sistem gagal.', 'Could not reach the system.') };
      });
  }

  function submitOrder(form) {
    var btn = $('#checkoutSubmit');
    var data = {
      token: CONFIG.orderToken || '',
      nama: form.nama.value.trim(),
      telefon: form.telefon.value.trim(),
      email: form.email.value.trim(),
      alamat: form.alamat.value.trim(),
      ambil: form.ambil.value,
      nota: form.nota.value.trim(),
      items: cart.map(function (it) { return { sku: it.sku, qty: it.qty }; })
    };
    if (!data.items.length) { toast(T('Troli kosong', 'Cart is empty'), '', true); return; }
    if (btn) { btn.disabled = true; btn.textContent = T('Menghantar…', 'Sending…'); }

    apiOrder({ token: data.token, data: data }).then(function (res) {
      if (btn) { btn.disabled = false; btn.textContent = T('Hantar Pesanan', 'Place Order'); }
      if (!res || res.success !== true) {
        toast(T('Pesanan gagal', 'Order failed'), (res && res.message) || T('Cuba lagi.', 'Try again.'), true);
        return;
      }
      var order = res.data || {};
      cart = [];
      saveCart();
      render();
      closeCheckout();
      showSuccess(order);
      refreshProducts();
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = T('Hantar Pesanan', 'Place Order'); }
      toast(T('Ralat sambungan', 'Connection error'), '', true);
    });
  }

  function showSuccess(order) {
    var m = $('#orderSuccess');
    if (!m) return;
    var bank = order.bayar || {};
    var bankName = bank.bankName || CONFIG.bankName || '';
    var bankAccount = bank.bankAccount || CONFIG.bankAccount || '';
    var bankHolder = bank.bankHolder || CONFIG.bankHolder || '';
    var wa = String(CONFIG.whatsapp || '').replace(/[^0-9]/g, '');
    var text = T('Hai P8, saya sudah buat pesanan ', 'Hi P8, I placed order ') + order.orderId + T(' berjumlah ', ' totalling ') + money(order.total) + '.';
    m.innerHTML =
      '<div class="p8-modal-card order-success">' +
      '<header><h3>' + T('Pesanan diterima', 'Order received') + '</h3>' +
      '<button type="button" id="successClose"><span class="ms">close</span></button></header>' +
      '<div class="order-body">' +
      '<p class="order-id">' + order.orderId + '</p>' +
      '<p class="order-total">' + money(order.total) + ' · ' + (order.items || []).length + ' ' + T('item', 'items') + '</p>' +
      '<div class="order-bank">' +
      '<h4>' + T('Arahan bayaran', 'Payment instructions') + '</h4>' +
      (CONFIG.payQr
        ? '<div class="order-qr">' +
            '<div class="order-qr-head"><span class="ms">qr_code_2</span><b>' + (CONFIG.payMethod || 'DuitNow QR') + '</b></div>' +
            '<img src="' + CONFIG.payQr + '" alt="DuitNow QR">' +
            '<p class="order-qr-name">' + (CONFIG.payName || '') + '</p>' +
            '<p class="order-qr-amount">' + money(order.total) + '</p>' +
            '<p class="order-qr-hint">' + T('Imbas dengan mana-mana aplikasi bank (GXBank, Maybank, CIMB, Touch ’n Go…)', 'Scan with any banking app (GXBank, Maybank, CIMB, Touch ’n Go…)') + '</p>' +
            '<a class="order-qr-dl" href="' + CONFIG.payQr + '" download="P8-DuitNow-QR.jpg"><span class="ms">download</span> ' + T('Simpan QR', 'Save QR') + '</a>' +
          '</div>'
        : bankAccount
          ? '<p><span>' + T('Bank', 'Bank') + '</span><b>' + (bankName || '—') + '</b></p>' +
            '<p><span>' + T('No. akaun', 'Account no.') + '</span><b>' + bankAccount + '</b></p>' +
            '<p><span>' + T('Nama akaun', 'Account name') + '</span><b>' + (bankHolder || '—') + '</b></p>'
          : '<p class="muted">' + T('Admin akan hubungi anda melalui WhatsApp untuk arahan bayaran.', 'Admin will contact you on WhatsApp with payment details.') + '</p>') +
      '</div>' +
      '<p class="order-note">' + T('Stok telah ditolak. Pesanan akan dibatalkan automatik jika tiada bayaran dalam ' +
        (order.holdHours || 24) + ' jam.', 'Stock has been deducted. The order is cancelled automatically if unpaid within ' +
        (order.holdHours || 24) + ' hours.') + '</p>' +
      '<a class="order-wa" ' + (wa ? 'href="https://wa.me/' + wa + '?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener"' : 'href="#hubungi"') + '>' +
      '<span class="ms">chat</span> ' + T('Hantar bukti bayaran', 'Send payment proof') + '</a>' +
      '<button type="button" id="successCloseBtn" class="order-close-btn">' + T('Tutup', 'Close') + '</button>' +
      '</div></div>';
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    var closeFn = function () {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    };
    var close = $('#successClose', m);
    if (close) close.addEventListener('click', closeFn);
    var closeBtn = $('#successCloseBtn', m);
    if (closeBtn) closeBtn.addEventListener('click', closeFn);
    m.addEventListener('click', function (e) { if (e.target === m) closeFn(); });
  }

  function refreshProducts() {
    if (typeof window.p8RefreshProducts === 'function') window.p8RefreshProducts();
  }

  function toast(title, message, isError) {
    var host = $('#p8Toast');
    if (!host) {
      host = document.createElement('div');
      host.id = 'p8Toast';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'p8-toast' + (isError ? ' error' : '');
    el.innerHTML = '<b>' + (title || '') + '</b>' + (message ? '<span>' + message + '</span>' : '');
    host.appendChild(el);
    setTimeout(function () { el.classList.add('in'); }, 10);
    setTimeout(function () {
      el.classList.remove('in');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 4200);
  }

  function mountBuyButtons() {
    $$('#productGrid .product-card[data-sku]').forEach(function (card) {
      var sku = card.dataset.sku;
      if (!sku) return;
      var name = (card.querySelector('h3') || {}).textContent || '';
      var priceText = (card.querySelector('.price') || {}).textContent || '0';
      var price = Number(String(priceText).replace(/[^0-9.]/g, '')) || 0;
      var foot = card.querySelector('.product-foot');
      if (!foot) return;
      var out = card.classList.contains('is-out');
      var btn = $('.js-buy', card);
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'js-buy';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          if (btn.disabled) return;
          addItem(sku, name.trim(), price);
        });
        foot.appendChild(btn);
      }
      var html = out
        ? '<span class="ms" aria-hidden="true">block</span>' + T('Habis', 'Sold out')
        : '<span class="ms" aria-hidden="true">add_shopping_cart</span>' + T('Beli', 'Buy');
      btn.disabled = out;
      btn.classList.toggle('is-disabled', out);
      if (btn.innerHTML !== html) btn.innerHTML = html;
    });
  }

  function init() {
    loadCart();
    render();
    mountBuyButtons();
    updateShippingLabel();
    window.addEventListener('p8:shipping', function () {
      updateShippingLabel();
      updateCheckoutNote();
    });

    var fab = $('#cartFab');
    if (fab) fab.addEventListener('click', openCart);
    var close = $('#cartClose');
    if (close) close.addEventListener('click', closeCart);
    var overlay = $('#cartOverlay');
    if (overlay) overlay.addEventListener('click', closeCart);
    var co = $('#cartCheckout');
    if (co) co.addEventListener('click', openCheckout);
    var cc = $('#checkoutClose');
    if (cc) cc.addEventListener('click', closeCheckout);
    var cancelBtn = $('#checkoutCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeCheckout);

    var form = $('#checkoutForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitOrder(form);
      });
      var mode = form.querySelector('[name="ambil"]');
      if (mode) mode.addEventListener('change', updateCheckoutNote);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeCart(); closeCheckout(); }
    });

    // Butang Beli perlu dipasang semula selepas kad disinkronkan
    var grid = $('#productGrid');
    var mo = null;
    if (grid && 'MutationObserver' in window) {
      mo = new MutationObserver(function () {
        mo.disconnect();
        mountBuyButtons();
        mo.observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      });
      mo.observe(grid, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
    $$('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setTimeout(function () { mountBuyButtons(); render(); }, 60); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
