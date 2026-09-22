function renderCart() {
  const items = Cart.get();
  const wrap = document.getElementById('cartContent');

  if (!items.length) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:80px;">🛒</div>
        <p style="margin:15px 0;">Ваша корзина пуста</p>
        <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  const rows = items.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return '';
    return `
      <tr>
        <td style="text-align:center;">
          ${renderProductImage(p, 'cart')}
        </td>
        <td>
          <a href="product.html?id=${p.id}" style="font-weight:600; text-decoration:none; color:#1a1a2e;">
            ${p.name}
          </a>
          <div style="font-size:12px; color:#6b7280; margin-top:3px;">${p.brand}</div>
        </td>
        <td>${formatPrice(p.price)}</td>
        <td>
          <div class="cart-qty">
            <button onclick="changeQty(${p.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </td>
        <td style="font-weight:700;">${formatPrice(p.price * item.qty)}</td>
        <td>
          <button class="btn btn--danger btn--sm" onclick="removeItem(${p.id})">Удалить</button>
        </td>
      </tr>
    `;
  }).join('');

  wrap.innerHTML = `
    <div class="cart-wrapper">
      <table class="cart-table">
        <thead>
          <tr>
            <th></th><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th><th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="cart-total">
      <div>Итого к оплате:</div>
      <div class="cart-total__sum">${formatPrice(Cart.total())}</div>
      <button class="btn btn--primary" style="padding:14px 40px;" onclick="checkout()">Оформить заказ</button>
      <button class="btn btn--outline" style="margin-left:10px;" onclick="clearCart()">Очистить корзину</button>
    </div>
  `;
}

function changeQty(id, delta) {
  const items = Cart.get();
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) Cart.remove(id);
  else Cart.save(items);
  renderCart();
}

function removeItem(id) {
  Cart.remove(id);
  renderCart();
  showToast('Товар удалён');
}

function clearCart() {
  if (!confirm('Очистить корзину?')) return;
  Cart.clear();
  renderCart();
  showToast('Корзина очищена');
}

function checkout() {
  if (!Cart.get().length) return;
  alert('✓ Заказ оформлен!\n\nСумма: ' + formatPrice(Cart.total()) + '\n\nМенеджер свяжется с вами.');
  Cart.clear();
  renderCart();
}

renderCart();