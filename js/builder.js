// js/builder.js
const BUILD_STEPS = [
  { key: 'cpu',         label: 'Процессор',          cat: 'cpu' },
  { key: 'motherboard', label: 'Материнская плата',  cat: 'motherboard' },
  { key: 'gpu',         label: 'Видеокарта',         cat: 'gpu' },
  { key: 'ram',         label: 'Оперативная память', cat: 'ram' },
  { key: 'storage',     label: 'Накопитель',         cat: 'storage' },
  { key: 'psu',         label: 'Блок питания',       cat: 'psu' },
  { key: 'case',        label: 'Корпус',             cat: 'case' },
  { key: 'cooler',      label: 'Охлаждение',         cat: 'cooler' }
];

let build = JSON.parse(localStorage.getItem('build') || '{}');
let currentStepKey = null;

function saveBuild() {
  localStorage.setItem('build', JSON.stringify(build));
}

function renderSteps() {
  const container = document.getElementById('builderSteps');
  container.innerHTML = BUILD_STEPS.map(step => {
    const product = build[step.key] ? PRODUCTS.find(p => p.id === build[step.key]) : null;
    return `
      <div class="builder-step ${product ? 'filled' : ''}">
        <div class="builder-step__info">
          <div class="builder-step__label">${step.label}</div>
          <div class="builder-step__name ${product ? '' : 'empty'}">
            ${product ? product.name : 'Не выбрано'}
          </div>
        </div>
        ${product ? `<div class="builder-step__price">${formatPrice(product.price)}</div>` : ''}
        <div class="builder-step__btns">
          <button class="btn btn--primary btn--sm" onclick="openModal('${step.key}')">
            ${product ? 'Заменить' : 'Выбрать'}
          </button>
          ${product ? `<button class="btn btn--danger btn--sm" onclick="removeStep('${step.key}')">×</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function openModal(key) {
  currentStepKey = key;
  const step = BUILD_STEPS.find(s => s.key === key);
  const products = PRODUCTS.filter(p => p.category === step.cat);

  document.getElementById('modalTitle').textContent = `Выбрать: ${step.label}`;
  document.getElementById('modalBody').innerHTML = products.map(p => `
    <div class="modal__item">
      <div class="modal__item-info">
        <div class="modal__item-title">${p.brand} — ${p.name}</div>
        <div class="modal__item-price">${formatPrice(p.price)}</div>
      </div>
      <button class="btn btn--primary btn--sm" onclick="selectProduct(${p.id})">Выбрать</button>
    </div>
  `).join('');

  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function selectProduct(id) {
  build[currentStepKey] = id;
  saveBuild();
  closeModal();
  renderAll();
}

function removeStep(key) {
  delete build[key];
  saveBuild();
  renderAll();
}

function renderSummary() {
  const listEl = document.getElementById('summaryList');
  let total = 0;
  const rows = BUILD_STEPS.map(s => {
    const p = build[s.key] ? PRODUCTS.find(x => x.id === build[s.key]) : null;
    if (p) total += p.price;
    return `<div class="builder-summary__row">
      <span>${s.label}</span>
      <span>${p ? formatPrice(p.price) : '—'}</span>
    </div>`;
  }).join('');
  listEl.innerHTML = rows;
  document.getElementById('totalPrice').textContent = formatPrice(total);
}

// ==================== ПРОВЕРКА СОВМЕСТИМОСТИ ====================
function checkCompatibility() {
  const msg = document.getElementById('compatMsg');
  const errors = [];
  const warnings = [];

  const cpu = build.cpu ? PRODUCTS.find(p => p.id === build.cpu) : null;
  const mb  = build.motherboard ? PRODUCTS.find(p => p.id === build.motherboard) : null;
  const ram = build.ram ? PRODUCTS.find(p => p.id === build.ram) : null;
  const psu = build.psu ? PRODUCTS.find(p => p.id === build.psu) : null;
  const gpu = build.gpu ? PRODUCTS.find(p => p.id === build.gpu) : null;

  // Сокет CPU ↔ материнка
  if (cpu && mb && cpu.socket && mb.socket && cpu.socket !== mb.socket) {
    errors.push(`❌ Сокет процессора (${cpu.socket}) не совпадает с материнской платой (${mb.socket})`);
  }
  // Тип RAM ↔ материнка
  if (mb && ram) {
    const mbRamType = (mb.specs?.RAM || '').includes('DDR5') ? 'DDR5'
                    : (mb.specs?.RAM || '').includes('DDR4') ? 'DDR4' : null;
    if (mbRamType && ram.ramType && mbRamType !== ram.ramType) {
      errors.push(`❌ Материнская плата поддерживает ${mbRamType}, а память — ${ram.ramType}`);
    }
  }
  // Мощность БП
  if (psu && cpu && gpu) {
    const need = (cpu.tdp || 0) + (gpu.tdp || 0) + 150;
    if (psu.power && psu.power < need) {
      errors.push(`❌ Мощности БП (${psu.power} Вт) недостаточно. Рекомендуется от ${need} Вт`);
    } else if (psu.power && psu.power < need + 100) {
      warnings.push(`⚠️ БП близок к пределу (${psu.power} Вт). Рекомендуется запас +100 Вт`);
    }
  }

  if (errors.length) {
    msg.className = 'compat-error';
    msg.innerHTML = errors.join('<br>');
  } else if (warnings.length) {
    msg.className = 'compat-warning';
    msg.innerHTML = warnings.join('<br>');
  } else if (Object.keys(build).length >= 3) {
    msg.className = 'compat-ok';
    msg.innerHTML = '✅ Все выбранные комплектующие совместимы';
  } else {
    msg.className = '';
    msg.innerHTML = '';
  }
}

function renderAll() {
  renderSteps();
  renderSummary();
  checkCompatibility();
}

// ==================== ДОБАВИТЬ СБОРКУ В КОРЗИНУ ====================
document.getElementById('addBuildToCart').addEventListener('click', () => {
  const ids = Object.values(build);
  if (!ids.length) return showToast('Сборка пуста');
  ids.forEach(id => Cart.add(id));
  showToast(`✓ Добавлено ${ids.length} комплектующих`);
});

document.getElementById('clearBuild').addEventListener('click', () => {
  if (!confirm('Очистить сборку?')) return;
  build = {};
  saveBuild();
  renderAll();
});

// Закрытие модалки по клику на оверлей
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target.id === 'modalOverlay') closeModal();
});

// Инициализация
renderAll();