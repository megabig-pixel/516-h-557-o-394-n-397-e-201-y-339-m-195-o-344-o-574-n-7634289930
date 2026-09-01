/**
 * イタリア新婚旅行（HIS 8日間 7都市周遊）インタラクティブ機能スクリプト
 * 鈴木 健太・めぐみ 様 専用 Webポータル
 * 
 * 機能:
 * 1. Mime直伝・持ち物パッキングチェックリスト (localStorage連動 + 進捗ゲージ)
 * 2. リアルタイム ユーロ・円 & チップ・コペルト計算機
 * 3. 音声発音つき 指差し旅行イタリア語フレーズボード (Web Speech API)
 * 4. SOS緊急連絡先モーダル (大使館・警察・クレカ紛失・ワンタップ発信)
 * 5. FAQアコーディオン開閉 & スムーススクロール & ナビゲーション
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. 持ち物パッキングチェックリスト (localStorage連動)
  // ==========================================================================
  const CHECKLIST_STORAGE_KEY = 'italy_honeymoon_checklist_v1';

  function initChecklist() {
    const checklistContainer = document.getElementById('packing-checklist-app');
    if (!checklistContainer) return;

    const savedState = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
    const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
    const progressBar = document.getElementById('checklist-progress-bar');
    const progressText = document.getElementById('checklist-progress-text');
    const progressCount = document.getElementById('checklist-progress-count');

    function updateProgress() {
      const total = checkboxes.length;
      let checked = 0;
      const currentState = {};

      checkboxes.forEach((cb) => {
        const id = cb.getAttribute('data-item-id') || cb.id;
        if (cb.checked) {
          checked++;
          currentState[id] = true;
          cb.closest('.checklist-item')?.classList.add('is-checked');
        } else {
          currentState[id] = false;
          cb.closest('.checklist-item')?.classList.remove('is-checked');
        }
      });

      const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
      if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
      }
      if (progressText) {
        progressText.textContent = `${percentage}% 準備完了`;
      }
      if (progressCount) {
        progressCount.textContent = `(${checked} / ${total} 項目)`;
      }

      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(currentState));
    }

    // 初期化: 保存された状態を反映
    checkboxes.forEach((cb) => {
      const id = cb.getAttribute('data-item-id') || cb.id;
      if (savedState[id]) {
        cb.checked = true;
        cb.closest('.checklist-item')?.classList.add('is-checked');
      }
      cb.addEventListener('change', updateProgress);
    });

    // 全選択ボタン
    const selectAllBtn = document.getElementById('checklist-select-all');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        checkboxes.forEach((cb) => (cb.checked = true));
        updateProgress();
      });
    }

    // 全解除（リセット）ボタン
    const resetBtn = document.getElementById('checklist-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('チェック状態をすべてリセットしますか？')) {
          checkboxes.forEach((cb) => (cb.checked = false));
          updateProgress();
        }
      });
    }

    updateProgress();
  }

  // ==========================================================================
  // 2. リアルタイム ユーロ・円 & チップ・コペルト計算機
  // ==========================================================================
  function initCurrencyCalculator() {
    const calcContainer = document.getElementById('currency-calculator-app');
    if (!calcContainer) return;

    const rateInput = document.getElementById('calc-rate');
    const eurInput = document.getElementById('calc-eur');
    const jpyInput = document.getElementById('calc-jpy');
    const tipSelect = document.getElementById('calc-tip-percent');
    const copertoInput = document.getElementById('calc-coperto');
    const dinersInput = document.getElementById('calc-diners');

    // 結果表示用要素
    const resultSubtotalEur = document.getElementById('calc-res-subtotal-eur');
    const resultSubtotalJpy = document.getElementById('calc-res-subtotal-jpy');
    const resultCopertoEur = document.getElementById('calc-res-coperto-eur');
    const resultTipEur = document.getElementById('calc-res-tip-eur');
    const resultTotalEur = document.getElementById('calc-res-total-eur');
    const resultTotalJpy = document.getElementById('calc-res-total-jpy');

    function calculate(source) {
      const rate = parseFloat(rateInput?.value) || 165;
      let eur = parseFloat(eurInput?.value) || 0;

      if (source === 'jpy') {
        const jpy = parseFloat(jpyInput?.value) || 0;
        eur = rate > 0 ? jpy / rate : 0;
        if (eurInput) eurInput.value = eur > 0 ? (Math.round(eur * 100) / 100).toFixed(2) : '';
      } else if (source === 'eur') {
        const jpy = eur * rate;
        if (jpyInput) jpyInput.value = jpy > 0 ? Math.round(jpy) : '';
      }

      // チップ & コペルト計算
      const tipPercent = parseFloat(tipSelect?.value) || 0;
      const copertoPerPerson = parseFloat(copertoInput?.value) || 0;
      const diners = parseInt(dinersInput?.value, 10) || 1;

      const totalCoperto = copertoPerPerson * diners;
      const tipAmount = eur * (tipPercent / 100);
      const grandTotalEur = eur + totalCoperto + tipAmount;
      const grandTotalJpy = Math.round(grandTotalEur * rate);

      if (resultSubtotalEur) resultSubtotalEur.textContent = `€${eur.toFixed(2)}`;
      if (resultSubtotalJpy) resultSubtotalJpy.textContent = `¥${Math.round(eur * rate).toLocaleString()}`;
      if (resultCopertoEur) resultCopertoEur.textContent = `€${totalCoperto.toFixed(2)}`;
      if (resultTipEur) resultTipEur.textContent = `€${tipAmount.toFixed(2)}`;
      if (resultTotalEur) resultTotalEur.textContent = `€${grandTotalEur.toFixed(2)}`;
      if (resultTotalJpy) resultTotalJpy.textContent = `¥${grandTotalJpy.toLocaleString()}`;
    }

    if (eurInput) eurInput.addEventListener('input', () => calculate('eur'));
    if (jpyInput) jpyInput.addEventListener('input', () => calculate('jpy'));
    if (rateInput) rateInput.addEventListener('input', () => calculate('eur'));
    if (tipSelect) tipSelect.addEventListener('change', () => calculate('eur'));
    if (copertoInput) copertoInput.addEventListener('input', () => calculate('eur'));
    if (dinersInput) dinersInput.addEventListener('input', () => calculate('eur'));

    // クイック金額ボタン
    const quickEurBtns = calcContainer.querySelectorAll('.btn-quick-eur');
    quickEurBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-amount');
        if (eurInput) {
          eurInput.value = val;
          calculate('eur');
        }
      });
    });

    calculate('eur');
  }

  // ==========================================================================
  // 3. 指差し旅行イタリア語フレーズボード (Web Speech API 音声発音)
  // ==========================================================================
  function initPhrasePlayer() {
    const phraseCards = document.querySelectorAll('.phrase-card');
    if (!phraseCards || phraseCards.length === 0) return;

    const synth = window.speechSynthesis;
    let italianVoice = null;

    function findItalianVoice() {
      if (!synth) return null;
      const voices = synth.getVoices();
      italianVoice = voices.find((v) => v.lang === 'it-IT' || v.lang.startsWith('it')) || null;
      return italianVoice;
    }

    if (synth) {
      findItalianVoice();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = findItalianVoice;
      }
    }

    phraseCards.forEach((card) => {
      const playBtn = card.querySelector('.phrase-play-btn');
      const textToSpeak = card.getAttribute('data-speak-text') || card.querySelector('.phrase-it')?.textContent || '';

      function speak() {
        if (!synth) {
          alert('お使いのブラウザは音声読み上げ機能に対応していません。');
          return;
        }

        // 既存の発声をキャンセル
        synth.cancel();

        const cleanText = textToSpeak.replace(/[!?,.]/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        utterance.rate = 0.88; // 初心者向けにややゆっくり
        utterance.pitch = 1.0;

        if (!italianVoice) findItalianVoice();
        if (italianVoice) utterance.voice = italianVoice;

        card.classList.add('is-speaking');
        utterance.onend = () => card.classList.remove('is-speaking');
        utterance.onerror = () => card.classList.remove('is-speaking');

        synth.speak(utterance);
      }

      if (playBtn) {
        playBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          speak();
        });
      }
      card.addEventListener('click', speak);
    });

    // カテゴリフィルター切り替え
    const phraseTabs = document.querySelectorAll('.phrase-tab-btn');
    const phraseCategories = document.querySelectorAll('.phrase-category-group');

    phraseTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        phraseTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const targetCat = tab.getAttribute('data-category');
        phraseCategories.forEach((group) => {
          if (targetCat === 'all' || group.getAttribute('data-category') === targetCat) {
            group.style.display = 'block';
          } else {
            group.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================================================
  // 4. SOS 緊急連絡先モーダル
  // ==========================================================================
  function initSosModal() {
    const openBtns = document.querySelectorAll('.trigger-sos-modal');
    const modal = document.getElementById('sos-emergency-modal');
    const closeBtn = document.getElementById('sos-modal-close');
    const overlay = document.getElementById('sos-modal-overlay');

    if (!modal) return;

    function openModal() {
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    openBtns.forEach((btn) => btn.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Escapeキーで閉じる
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  // ==========================================================================
  // 5. FAQアコーディオン開閉
  // ==========================================================================
  function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach((header) => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const isActive = item?.classList.contains('is-open');

        // 同じグループ内の他を閉じる場合はここで処理
        item?.classList.toggle('is-open', !isActive);
      });
    });
  }

  // ==========================================================================
  // DOMContentLoaded時の初期化
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initChecklist();
    initCurrencyCalculator();
    initPhrasePlayer();
    initSosModal();
    initAccordions();
  });
})();
