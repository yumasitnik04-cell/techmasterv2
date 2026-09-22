// ==================== КОРЗИНА ====================
const Cart = {
  get() { return JSON.parse(localStorage.getItem('cart') || '[]'); },
  save(items) {
    localStorage.setItem('cart', JSON.stringify(items));
    Cart.updateCount();
  },
  add(productId, qty = 1) {
    const items = Cart.get();
    const ex = items.find(i => i.id === productId);
    if (ex) ex.qty += qty;
    else items.push({ id: productId, qty });
    Cart.save(items);
    showToast('✓ Товар добавлен в корзину');
  },
  remove(id) { Cart.save(Cart.get().filter(i => i.id !== id)); },
  setQty(id, qty) {
    const items = Cart.get();
    const it = items.find(i => i.id === id);
    if (it) it.qty = Math.max(1, qty);
    Cart.save(items);
  },
  clear() { Cart.save([]); },
  count() { return Cart.get().reduce((s, i) => s + i.qty, 0); },
  total() {
    return Cart.get().reduce((s, i) => {
      const p = PRODUCTS.find(x => x.id === i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  },
  updateCount() {
    const c = Cart.count();
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = c);
  }
};

// ==================== СРАВНЕНИЕ ====================
const Compare = {
  get() { return JSON.parse(localStorage.getItem('compare') || '[]'); },
  save(list) { localStorage.setItem('compare', JSON.stringify(list)); },
  add(id) {
    const list = Compare.get();
    if (list.includes(id)) return showToast('Уже в сравнении');
    if (list.length >= 4) return showToast('Максимум 4 товара');
    list.push(id);
    Compare.save(list);
    showToast('✓ Добавлено к сравнению');
  },
  remove(id) { Compare.save(Compare.get().filter(i => i !== id)); },
  clear() { Compare.save([]); }
};

// ==================== УТИЛИТЫ ====================
const formatPrice = n => n.toLocaleString('ru-RU') + ' ₽';
const getCatIcon = cat => (CATEGORIES[cat]?.icon || '📦');

function showToast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ==================== УНИВЕРСАЛЬНЫЙ РЕНДЕР КАРТИНКИ ====================
// Если p.img — путь к файлу (.webp/.jpg/.png) → рисуем <img>
// Если p.img — эмодзи → рисуем как текст
function renderProductImage(p, size = 'card') {
  const isPath = p.img && (p.img.includes('/') || /\.(webp|jpg|jpeg|png|svg|gif)$/i.test(p.img));

  if (isPath) {
    const imgSize =
      size === 'card'    ? 'max-width:90%; max-height:90%' :
      size === 'page'    ? 'max-width:80%; max-height:80%' :
      size === 'cart'    ? 'max-width:70px; max-height:70px' :
      size === 'compare' ? 'max-width:110px; max-height:90px' :
                           'max-width:100px; max-height:100px';
    return `<img src="${p.img}" alt="${p.name}" style="${imgSize}; object-fit:contain;" onerror="this.parentNode.textContent='📦';">`;
  }

  const emojiSize =
    size === 'card'    ? '72px' :
    size === 'page'    ? '200px' :
    size === 'cart'    ? '36px' :
    size === 'compare' ? '52px' : '60px';
  return `<span style="font-size:${emojiSize};">${p.img || '📦'}</span>`;
}

// ==================== РЕНДЕР КАРТОЧКИ ТОВАРА ====================
function productCardHTML(p) {
  return `
    <div class="product-card">
      <a href="product.html?id=${p.id}" class="product-card__img" style="text-decoration:none;">
        ${renderProductImage(p, 'card')}
      </a>
      <div class="product-card__body">
        <div class="product-card__brand">${p.brand}</div>
        <a href="product.html?id=${p.id}" class="product-card__title">${p.name}</a>
        <div class="product-card__price">${formatPrice(p.price)}</div>
        <div class="product-card__actions">
          <button class="btn btn--primary btn--sm" onclick="Cart.add(${p.id})">В корзину</button>
          <button class="btn btn--outline btn--sm" onclick="Compare.add(${p.id})" title="Сравнить">⇄</button>
        </div>
      </div>
    </div>
  `;
}

// ==================== ОБЩАЯ ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCount();

  // Категории на главной
  const catGrid = document.getElementById('categoriesGrid');
  if (catGrid) {
    catGrid.innerHTML = Object.entries(CATEGORIES).map(([k, v]) => `
      <a href="catalog.html?cat=${k}" class="category-card">
        <div class="category-card__icon">${v.icon}</div>
        <div class="category-card__name">${v.name}</div>
      </a>
    `).join('');
  }

  // Популярные товары
  const popular = document.getElementById('popularProducts');
  if (popular) {
    popular.innerHTML = PRODUCTS.slice(0, 12).map(productCardHTML).join('');
  }

  // Новинки (смартфоны + ноутбуки + часы)
  const newGrid = document.getElementById('newProducts');
  if (newGrid) {
    const items = [...PRODUCTS]
      .filter(p => ['smartphone', 'laptop', 'smartwatch'].includes(p.category))
      .sort(() => .5 - Math.random())
      .slice(0, 8);
    newGrid.innerHTML = items.map(productCardHTML).join('');
  }

  // Поиск
  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        location.href = `catalog.html?q=${encodeURIComponent(search.value)}`;
      }
    });
  }
});