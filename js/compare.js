function renderCompare() {
  const ids = Compare.get();
  const wrap = document.getElementById('compareContent');

  if (!ids.length) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:80px;">⇄</div>
        <p style="margin:15px 0;">Список сравнения пуст</p>
        <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  const products = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  if (!products.length) {
    wrap.innerHTML = '<p>Товары не найдены</p>';
    return;
  }

  const allSpecs = new Set();
  products.forEach(p => Object.keys(p.specs || {}).forEach(k => allSpecs.add(k)));

  const headRow = `
    <tr>
      <th>Характеристика</th>
      ${products.map(p => `
        <th style="text-align:center; min-width:200px;">
          <div style="margin-bottom:10px; min-height:90px; display:flex; align-items:center; justify-content:center;">
            ${renderProductImage(p, 'compare')}
          </div>
          <div style="font-weight:700; font-size:14px; margin-bottom:5px;">${p.name}</div>
          <div style="color:#0f1a2e; font-weight:800;">${formatPrice(p.price)}</div>
          <div style="margin-top:10px; display:flex; gap:5px; justify-content:center;">
            <button class="btn btn--primary btn--sm" onclick="Cart.add(${p.id})">В корзину</button>
            <button class="btn btn--danger btn--sm" onclick="removeFromCompare(${p.id})">×</button>
          </div>
        </th>
      `).join('')}
    </tr>
  `;

  const brandRow = `
    <tr><th>Бренд</th>${products.map(p => `<td>${p.brand}</td>`).join('')}</tr>
  `;

  const specRows = [...allSpecs].map(key => `
    <tr>
      <th>${key}</th>
      ${products.map(p => `<td>${p.specs?.[key] || '—'}</td>`).join('')}
    </tr>
  `).join('');

  wrap.innerHTML = `
    <table class="compare-table">
      <thead>${headRow}</thead>
      <tbody>${brandRow}${specRows}</tbody>
    </table>
    <div style="text-align:right; margin-top:20px;">
      <button class="btn btn--outline" onclick="clearCompare()">Очистить сравнение</button>
    </div>
  `;
}

function removeFromCompare(id) {
  Compare.remove(id);
  renderCompare();
}

function clearCompare() {
  Compare.clear();
  renderCompare();
  showToast('Список сравнения очищен');
}

renderCompare();