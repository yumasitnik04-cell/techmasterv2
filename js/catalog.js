// js/catalog.js
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const state = {
    category: params.get('cat') || '',
    query: params.get('q') || '',
    minPrice: 0,
    maxPrice: Infinity,
    brands: [],
    sort: 'default'
  };

  // Категории (чекбоксы)
  const catFilters = document.getElementById('catFilters');
  catFilters.innerHTML = Object.entries(CATEGORIES).map(([k, v]) => `
    <label><input type="checkbox" value="${k}" ${state.category === k ? 'checked' : ''}> ${v.name}</label>
  `).join('');

  // Бренды
  const brands = [...new Set(PRODUCTS.map(p => p.brand))].sort();
  document.getElementById('brandFilters').innerHTML = brands.map(b => `
    <label><input type="checkbox" value="${b}"> ${b}</label>
  `).join('');

  // Заголовок
  if (state.category && CATEGORIES[state.category]) {
    document.getElementById('catalogTitle').textContent = CATEGORIES[state.category].name;
  }
  if (state.query) {
    document.getElementById('catalogTitle').textContent = `Поиск: "${state.query}"`;
    document.getElementById('searchInput').value = state.query;
  }

  function readFilters() {
    state.category = [...document.querySelectorAll('#catFilters input:checked')].map(i => i.value);
    state.brands = [...document.querySelectorAll('#brandFilters input:checked')].map(i => i.value);
    state.minPrice = +document.getElementById('minPrice').value || 0;
    state.maxPrice = +document.getElementById('maxPrice').value || Infinity;
    state.sort = document.getElementById('sortSelect').value;
  }

  function render() {
    let list = PRODUCTS.slice();

    // Фильтр по категориям
    if (state.category.length) {
      list = list.filter(p => state.category.includes(p.category));
    }
    // Поиск
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    // Бренд
    if (state.brands.length) {
      list = list.filter(p => state.brands.includes(p.brand));
    }
    // Цена
    list = list.filter(p => p.price >= state.minPrice && p.price <= state.maxPrice);

    // Сортировка
    switch (state.sort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name':       list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    const grid = document.getElementById('catalogProducts');
    const empty = document.getElementById('emptyMsg');
    if (list.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      grid.innerHTML = list.map(productCardHTML).join('');
    }
  }

  document.getElementById('applyBtn').addEventListener('click', () => {
    readFilters();
    render();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('#catFilters input, #brandFilters input').forEach(i => i.checked = false);
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    state.category = [];
    state.brands = [];
    state.minPrice = 0;
    state.maxPrice = Infinity;
    render();
  });

  document.getElementById('sortSelect').addEventListener('change', () => {
    state.sort = document.getElementById('sortSelect').value;
    render();
  });

  // Первоначальный рендер
  readFilters();
  render();
});