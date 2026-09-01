/* ==========================================================================
   イタリア新婚旅行ガイドポータル 共通JavaScript (app.js)
   鈴木 健太・めぐみ 様 (HIS Tour OI-KMI2811: 2026年11月15日〜22日)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initChecklist();
  initCalculator();
  initSpeech();
  initSearch();
  initEmergencyModal();
});

/* 1. Interactive Checklist with localStorage */
function initChecklist() {
  const checkItems = document.querySelectorAll('.check-item input[type="checkbox"]');
  const progressFill = document.querySelector('.checklist-progress-fill');
  const progressText = document.querySelector('.checklist-progress-text');
  const storageKey = 'italy_honeymoon_checklist_v2';
  
  if (checkItems.length === 0) return;

  // Load saved state
  let savedState = {};
  try {
    savedState = JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch (e) {
    savedState = {};
  }

  function updateProgress() {
    let total = checkItems.length;
    let checkedCount = 0;
    
    checkItems.forEach(cb => {
      const id = cb.dataset.id || cb.id || cb.name;
      if (savedState[id]) {
        cb.checked = true;
      }
      if (cb.checked) {
        checkedCount++;
        cb.closest('.check-item')?.classList.add('checked');
      } else {
        cb.closest('.check-item')?.classList.remove('checked');
      }
    });

    const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    if (progressFill) progressFill.style.width = percent + '%';
    if (progressText) progressText.textContent = `準備完了: ${checkedCount} / ${total} 項目 (${percent}%)`;
  }

  checkItems.forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.id || cb.id || cb.name;
      savedState[id] = cb.checked;
      try {
        localStorage.setItem(storageKey, JSON.stringify(savedState));
      } catch (e) {}
      updateProgress();
    });
  });

  const selectAllBtn = document.getElementById('btn-select-all');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      checkItems.forEach(cb => {
        cb.checked = true;
        const id = cb.dataset.id || cb.id || cb.name;
        savedState[id] = true;
      });
      localStorage.setItem(storageKey, JSON.stringify(savedState));
      updateProgress();
    });
  }

  const resetAllBtn = document.getElementById('btn-reset-all');
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      if (confirm('チェックリストをすべてリセットしますか？')) {
        checkItems.forEach(cb => {
          cb.checked = false;
          const id = cb.dataset.id || cb.id || cb.name;
          savedState[id] = false;
        });
        localStorage.setItem(storageKey, JSON.stringify(savedState));
        updateProgress();
      }
    });
  }

  updateProgress();
}

/* 2. Real-time Currency & Tip Calculator */
function initCalculator() {
  const euroInput = document.getElementById('calc-euro-input');
  const yenInput = document.getElementById('calc-yen-input');
  const rateInput = document.getElementById('calc-rate-input');
  const copertoSelect = document.getElementById('calc-coperto-select');
  const tipSelect = document.getElementById('calc-tip-select');
  const resultEur = document.getElementById('calc-result-eur');
  const resultJpy = document.getElementById('calc-result-jpy');
  const resultBreakdown = document.getElementById('calc-result-breakdown');

  if (!euroInput || !resultEur) return;

  function calculate() {
    const rate = parseFloat(rateInput?.value || 165) || 165;
    const baseEur = parseFloat(euroInput.value) || 0;
    const copertoPerPerson = parseFloat(copertoSelect?.value || 0) || 0;
    const copertoTotal = copertoPerPerson * 2; // 2 travelers (Kenta & Megumi)
    const tipRate = parseFloat(tipSelect?.value || 0) || 0;
    
    const tipEur = (baseEur * tipRate) / 100;
    const totalEur = baseEur + copertoTotal + tipEur;
    const totalJpy = Math.round(totalEur * rate);

    resultEur.textContent = `€${totalEur.toFixed(2)}`;
    resultJpy.textContent = `約 ¥${totalJpy.toLocaleString()}`;

    if (resultBreakdown) {
      resultBreakdown.innerHTML = `
        <small style="color:var(--text-muted);">
          料理代: €${baseEur.toFixed(2)} + 席料(2名分): €${copertoTotal.toFixed(2)} + チップ(${tipRate}%): €${tipEur.toFixed(2)}<br>
          (為替レート目安: 1€ = ¥${rate})
        </small>
      `;
    }
  }

  euroInput.addEventListener('input', calculate);
  if (rateInput) rateInput.addEventListener('input', calculate);
  if (copertoSelect) copertoSelect.addEventListener('change', calculate);
  if (tipSelect) tipSelect.addEventListener('change', calculate);

  // Quick preset buttons
  document.querySelectorAll('.btn-preset-eur').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      euroInput.value = btn.dataset.amount;
      calculate();
    });
  });

  calculate();
}

/* 3. Italian Speech Synthesis (Web Speech API) & Copy */
function initSpeech() {
  document.querySelectorAll('.speak-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.dataset.phrase || btn.getAttribute('data-phrase');
      if (!text) return;

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';
        utterance.rate = 0.85; // Slightly slower for clarity
        window.speechSynthesis.speak(utterance);
        
        // Button feedback
        const origText = btn.innerHTML;
        btn.innerHTML = '🔊';
        btn.style.transform = 'scale(1.15)';
        setTimeout(() => {
          btn.innerHTML = origText;
          btn.style.transform = 'scale(1)';
        }, 800);
      } else {
        alert(`イタリア語: ${text}`);
      }
    });
  });

  // Copy phrase
  document.querySelectorAll('.copy-phrase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.phrase;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`「${text}」をコピーしました！`);
        });
      }
    });
  });
}

/* 4. Live Filter and Search */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const filterChips = document.querySelectorAll('.filter-chip');
  const spotCards = document.querySelectorAll('.spot-card, .restaurant-card, .souvenir-card');

  if (!searchInput && filterChips.length === 0) return;

  function filterCards() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeChip = document.querySelector('.filter-chip.active');
    const selectedCity = activeChip ? activeChip.dataset.city : 'all';

    spotCards.forEach(card => {
      const cardCity = card.dataset.city || '';
      const text = card.textContent.toLowerCase();
      
      const matchesCity = (selectedCity === 'all' || cardCity === selectedCity);
      const matchesQuery = (!query || text.includes(query));

      if (matchesCity && matchesQuery) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterCards();
    });
  });
}

/* 5. Emergency Modal */
function initEmergencyModal() {
  const modal = document.getElementById('emergency-modal');
  const openBtns = document.querySelectorAll('.btn-open-sos');
  const closeBtns = document.querySelectorAll('.btn-close-sos');

  if (!modal) return;

  openBtns.forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
  }));

  closeBtns.forEach(b => b.addEventListener('click', () => {
    modal.style.display = 'none';
  }));

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = 'position:fixed; bottom:75px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); color:#fff; padding:10px 20px; border-radius:20px; font-size:0.85rem; font-weight:700; z-index:9999; transition:all 0.3s; pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2000);
}
