document.addEventListener('DOMContentLoaded', () => {
  const id = +new URLSearchParams(location.search).get('id');
  const p = PRODUCTS.find(x => x.id === id);
  const container = document.getElementById('productContainer');

  if (!p) {
    container.innerHTML = '<h2 style="padding:60px 0;">Товар не найден</h2>';
    return;
  }

  const specsRows = Object.entries(p.specs).map(([k, v]) =>
    `<tr><td>${k}</td><td>${v}</td></tr>`
  ).join('');

  container.innerHTML = `
    <div class="product-page">
      <div class="product-page__image">
        ${renderProductImage(p, 'page')}
      </div>
      <div>
        <div class="product-page__brand">${p.brand}</div>
        <h1 class="product-page__title">${p.name}</h1>
        <div style="color:#6b7280; font-size:14px;">Категория: ${CATEGORIES[p.category]?.name || p.category}</div>
        <div class="product-page__price">${formatPrice(p.price)}</div>
        <div class="product-page__actions">
          <button class="btn btn--primary" onclick="Cart.add(${p.id})">🛒 Добавить в корзину</button>
          <button class="btn btn--outline" onclick="Compare.add(${p.id})">⇄ Сравнить</button>
        </div>

        <h3 style="margin-top:25px; margin-bottom:12px; font-size:19px;">Характеристики</h3>
        <table class="specs-table">${specsRows}</table>
      </div>
    </div>
  `;
});