/**
 * Italy Honeymoon Portal & Interactive Travel App
 * Suzuki Kenta & Megumi (HIS Tour OI-KMI2811)
 * Integrates insights from YouTube @mimeitalygaido
 */

document.addEventListener('DOMContentLoaded', () => {
  initPackingList();
  initCurrencyCalculator();
  initItalianPhrases();
  initEmergencyModal();
});

/* ==========================================================================
   1. 🧳 持ち物チェックリスト（LocalStorage連動・進捗バー表示）
   ========================================================================== */
const packingItemsData = [
  // 防犯・三種の神器
  { id: 'sec_01', cat: 'security', name: '首下げ・腰巻きセキュリティポーチ', desc: 'パスポート・予備カード・高額紙幣を服の下に隠す', badge: '三種の神器①' },
  { id: 'sec_02', cat: 'security', name: 'スマホショルダーストラップ（斜めがけ）', desc: '歩行中や写真撮影時のひったくり・落下防止', badge: '三種の神器②' },
  { id: 'sec_03', cat: 'security', name: 'ダイヤル式南京錠 / ワイヤーロック', desc: 'リュックのファスナー同士を連結ロックしてスリ完全遮断', badge: '三種の神器③' },
  { id: 'sec_04', cat: 'security', name: 'スキミング防止カードケース', desc: '人混みや満員電車での非接触スキミング防止', badge: '推奨' },
  { id: 'sec_05', cat: 'security', name: 'ダミー財布（少額用小銭入れ）', desc: '€10〜20の小銭だけを入れて普段使いに', badge: '推奨' },
  { id: 'sec_06', cat: 'security', name: 'ファスナー付き斜めがけバッグ（胸元持ち用）', desc: '必ず体の前で抱えて持つのがイタリアの鉄則', badge: '必須' },

  // 11月の気候・服装
  { id: 'clo_01', cat: 'clothing', name: 'ヒートテックインナー（極暖・超極暖 3〜4着）', desc: '11月中旬の朝晩（5〜9℃）冷え込み対策', badge: '必須' },
  { id: 'clo_02', cat: 'clothing', name: 'ウルトラライトダウン（インナー用）', desc: '急な冷え込み時にコートの下に着込める軽量防寒着', badge: '必須' },
  { id: 'clo_03', cat: 'clothing', name: 'ウールコート / 防風ジャケット', desc: '記念写真映えする綺麗めアウター', badge: '必須' },
  { id: 'clo_04', cat: 'clothing', name: '履き慣れたスニーカー（2足・防水スプレー済）', desc: '石畳で毎日1〜2万歩歩くためのクッション靴', badge: '必須' },
  { id: 'clo_05', cat: 'clothing', name: '大判ストール / マフラー', desc: '首元の防寒 ＆ 教会見学時の肌（肩・膝）隠し', badge: '必須' },
  { id: 'clo_06', cat: 'clothing', name: '軽量折りたたみ傘', desc: '11月の秋雨対策。バッグに常時携帯', badge: '必須' },
  { id: 'clo_07', cat: 'clothing', name: '着圧ソックス（フライト・バス用）', desc: '長時間移動の足のむくみ防止', badge: '推奨' },
  { id: 'clo_08', cat: 'clothing', name: 'ディナー用綺麗めワンピース / ジャケット', desc: 'ハネムーンの特別ディナー用スマートカジュアル', badge: '推奨' },
  { id: 'clo_09', cat: 'clothing', name: '室内用スリッパ・パジャマ', desc: 'イタリアのホテルには備え付けがないため持参', badge: '必須' },

  // 電子機器
  { id: 'ele_01', cat: 'electronics', name: 'Cタイプ / SEタイプ 変換プラグ（2〜3個）', desc: 'イタリアの丸ピン2本コンセント対応', badge: '必須' },
  { id: 'ele_02', cat: 'electronics', name: '大容量モバイルバッテリー（機内持込）', desc: 'Google Mapsと写真で急速に電池消費（預け荷物不可）', badge: '必須' },
  { id: 'ele_03', cat: 'electronics', name: '複数ポート急速USB充電器（Type-C/A）', desc: 'ホテルで2人分の機器を同時充電', badge: '必須' },
  { id: 'ele_04', cat: 'electronics', name: 'eSIM（ヨーロッパ周遊設定）', desc: 'お二人それぞれ設定して現地でも常時連絡可能に', badge: '必須' },

  // 衛生・トイレ対策（みめ直伝）
  { id: 'hyg_01', cat: 'hygiene', name: '水に流せるポケットティッシュ（多め）', desc: 'イタリアのトイレは紙切れが日常茶飯事！常に携帯', badge: 'みめ超推奨' },
  { id: 'hyg_02', cat: 'hygiene', name: '除菌ウェットティッシュ / アルコールジェル', desc: '食べ歩き前やトイレ後の衛生対策', badge: 'みめ超推奨' },
  { id: 'hyg_03', cat: 'hygiene', name: '便座除菌シート', desc: '公衆トイレの便座対策（便座がない所も）', badge: '推奨' },
  { id: 'hyg_04', cat: 'hygiene', name: '保湿リップ・ハンドクリーム', desc: '乾燥したヨーロッパの秋風対策', badge: '必須' },
  { id: 'hyg_05', cat: 'hygiene', name: '歯ブラシ・歯磨き粉セット', desc: 'イタリアのホテルには基本的に置いてありません', badge: '必須' },
  { id: 'hyg_06', cat: 'hygiene', name: 'ジップロック（大中小）', desc: '液体物・ワイン・コスメのスーツケース漏れ防止', badge: '必須' },

  // 常備薬
  { id: 'med_01', cat: 'medicines', name: '胃腸薬 / 整腸剤（ビオフェルミン等）', desc: 'オリーブオイル・肉料理による胃もたれ対策', badge: '必須' },
  { id: 'med_02', cat: 'medicines', name: '総合感冒薬 / 解熱鎮痛剤（ロキソニン等）', desc: '急な発熱・頭痛対策', badge: '必須' },
  { id: 'med_03', cat: 'medicines', name: '酔い止め薬（アネロン等）', desc: 'バス移動（山道）やベネチアのゴンドラ用', badge: '推奨' },
  { id: 'med_04', cat: 'medicines', name: '絆創膏・キズパワーパッド・休足時間', desc: '石畳の靴擦れ・足の疲労回復フットケア', badge: '必須' },

  // 貴重品・書類
  { id: 'doc_01', cat: 'documents', name: 'パスポート原本 ＆ コピー', desc: '原本はセキュリティポーチへ、コピーは別保管', badge: '必須' },
  { id: 'doc_02', cat: 'documents', name: 'クレジットカード（Visa/Master 各2枚以上）', desc: 'タッチ決済対応・海外利用枠事前確認', badge: '必須' },
  { id: 'doc_03', cat: 'documents', name: '海外旅行保険証書・緊急連絡先控え', desc: '24時間日本語対応電話番号をメモ', badge: '必須' },
  { id: 'doc_04', cat: 'documents', name: '少額ユーロ紙幣（€5 / €10 / €20 計€100程）', desc: '有料トイレ（€0.5〜1.5）、チップ、バール用', badge: '必須' },
  { id: 'doc_05', cat: 'documents', name: 'HIS予約バウチャー・航空券Eチケット控え', desc: '紙の印刷とスマホPDFの両方を準備', badge: '必須' },
  { id: 'doc_06', cat: 'documents', name: 'ボールペン（黒 2本）', desc: '機内書類・免税書類の記入用', badge: '必須' }
];

const STORAGE_KEY = 'italy_honeymoon_packing_v1';

function initPackingList() {
  const container = document.getElementById('packing-list-items');
  if (!container) return;

  let savedState = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedState = JSON.parse(raw);
  } catch (e) {
    console.error('LocalStorage load failed', e);
  }

  let currentCategory = 'all';
  let hideCompleted = false;

  function render() {
    container.innerHTML = '';
    const filtered = packingItemsData.filter(item => {
      const catMatch = (currentCategory === 'all' || item.cat === currentCategory);
      const doneMatch = hideCompleted ? !savedState[item.id] : true;
      return catMatch && doneMatch;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-muted);">該当する持ち物はありません（すべて準備完了！）</div>';
    } else {
      filtered.forEach(item => {
        const isChecked = !!savedState[item.id];
        const el = document.createElement('label');
        el.className = `checklist-item ${isChecked ? 'completed' : ''}`;
        el.innerHTML = `
          <input type="checkbox" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
          <div class="item-content">
            <div class="item-title-row">
              <span class="item-name">${item.name}</span>
              <span class="item-badge ${item.badge.includes('三種の神器') ? 'badge-sacred' : ''}">${item.badge}</span>
            </div>
            <p class="item-desc">${item.desc}</p>
          </div>
        `;
        const checkbox = el.querySelector('input');
        checkbox.addEventListener('change', (e) => {
          savedState[item.id] = e.target.checked;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
          } catch (err) {}
          updateProgress();
          render();
        });
        container.appendChild(el);
      });
    }

    updateProgress();
  }

  function updateProgress() {
    const total = packingItemsData.length;
    const checkedCount = packingItemsData.filter(i => !!savedState[i.id]).length;
    const percent = Math.round((checkedCount / total) * 100);

    const progressFill = document.getElementById('packing-progress-fill');
    const progressText = document.getElementById('packing-progress-text');
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) {
      progressText.innerHTML = `準備進捗: <strong>${checkedCount}</strong> / ${total} 項目 (<strong>${percent}%</strong> 完了)`;
    }
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.packing-filter-chip');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      render();
    });
  });

  // Toggle Hide Completed
  const hideToggle = document.getElementById('toggle-hide-completed');
  if (hideToggle) {
    hideToggle.addEventListener('change', (e) => {
      hideCompleted = e.target.checked;
      render();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('btn-reset-packing');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('チェックをすべてリセットしますか？')) {
        savedState = {};
        localStorage.removeItem(STORAGE_KEY);
        render();
      }
      });
  }

  render();
}

/* =========================================================================
   2. 💶 ルーソ・� ＆ チップ即時訍算機
   ========================================================================= */
function initCurrencyCalculator() {
  const euroInput = document.getElementById('calc-euro-input');
  const jpyInput = document.getElementById('calc-jpy-input');
  const rateInput = document.getElementById('calc-rate-input');
  const copertoPeople = document.getElementById('calc-coperto-people');
  const copertoRate = document.getElementById('calc-coperto-rate');
  const copertoResult = document.getElementById('calc-coperto-result');

  if (!euroInput || !jpyInput || !rateInput) return;

  function getRate() {
    const val = parseFloat(rateInput.value);
    return isNaN(val) || val <= 0 ? 165 : val;
  }

  function euroToJpy() {
    const euro = parseFloat(euroInput.value);
    if (isNaN(euro)) {
      jpyInput.value = '';
    } else {
      const rate = getRate();
      jpyInput.value = Math.round(euro * rate).toLocaleString();
    }
  }

  function jpyToEuro() {
    const jpy = parseFloat(jpyInput.value.replace(/,/g, ''));
    if (isNaN(jpy)) {
      euroInput.value = '';
    } else {
      const rate = getRate();
      euroInput.value = (jpy / rate).toFixed(2);
    }
  }

  euroInput.addEventListener('input', euroToJpy);
  jpyInput.addEventListener('input', jpyToEuro);
  rateInput.addEventListener('input', () => {
    euroToJpy();
    updateCoperto();
  });

  // Preset Buttons
  const presetBtns = document.querySelectorAll('.calc-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      euroInput.value = btn.dataset.val;
      euroToJpy();
    });
  });

  // Coperto Calculator
  function updateCoperto() {
    if (!copertoPeople || !copertoRate || !copertoResult) return;
    const people = parseInt(copertoPeople.value, 10) || 2;
    const pricePer = parseFloat(copertoRate.value) || 3.0;
    const rate = getRate();
    const totalEur = (people * pricePer).toFixed(2);
    const totalJpy = Math.round(totalEur * rate).toLocaleString();
    copertoResult.innerHTML = `席料目安: <strong>€${totalEur}</strong> (約 ¥${totalJpy})`;
  }

  if (copertoPeople) copertoPeople.addEventListener('change', updateCoperto);
  if (copertoRate) copertoRate.addEventListener('change', updateCoperto);

  euroToJpy();
  updateCoperto();
}

/* ==========================================================================
   3. 🗣️ 必須สタリア語 指差しミニフレーズ（Web Speech API 音声合成）
   ========================================================================== */
function initItalianPhrases() {
  const synth = window.speechSynthesis;
  const playBtns = document.querySelectorAll('.btn-speak-phrase');

  playBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.text || btn.innerText;
      if (!synth) {
        alert('お使いのブラウザは音声再生に対応していません。');
        return;
      }
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 0.9; // Slightly slower for clarity
      
      btn.classList.add('playing');
      utterance.onend = () => btn.classList.remove('playing');
      utterance.onerror = () => btn.classList.remove('playing');
      
      synth.speak(utterance);
    });
  });
}

/* ==========================================================================
   4. 🚨 緊急SOS・大使館ワンタップモーダル
   ========================================================================== */
function initEmergencyModal() {
  const modal = document.getElementById('emergency-modal');
  const openBtns = document.querySelectorAll('.btn-open-sos');
  const closeBtns = document.querySelectorAll('.btn-close-sos');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}
