/**
 * antigravity Project Workspace Ledger - Application Controller
 * Design Policy: Official Business Ledger, Strict NO-EMOJI, Google Fonts Material Symbols Outlined
 */

let rawLedgerData = null;
let currentEntries = [];
let filteredEntries = [];
let autoSyncIntervalSeconds = 30;
let countdownRemainingSeconds = 30;
let syncTimer = null;
let countdownTimer = null;

// プロジェクト資産・手帳ログ用カテゴリマッピング
const CATEGORY_MAP = {
  'PROJ-CORE': { label: '中核開発基盤', badgeClass: 'macro', icon: 'hub' },
  'PROJ-RESEARCH': { label: '学術リサーチ・論文', badgeClass: 'climate', icon: 'menu_book' },
  'PROJ-DESIGN': { label: 'デザイン・UI早見帳', badgeClass: 'agro', icon: 'palette' },
  'PROJ-WORKSPACE': { label: 'Workspace / GAS', badgeClass: 'supply', icon: 'terminal' },
  'DAILY-TECHO': { label: '40日間手帳調書', badgeClass: 'health', icon: 'today' },
  'GENERAL': { label: 'プロジェクト資産', badgeClass: 'default', icon: 'inventory_2' }
};

document.addEventListener('DOMContentLoaded', async () => {
  setupDateStamps();
  setupEventListeners();
  await loadLedgerData();
  startAutoSyncCountdown();
});

function setupDateStamps() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const stampStr = `${yy}.${mm}.${dd}`;

  ['stampDate1', 'stampDate2', 'stampDate3', 'stampDate4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = stampStr;
  });

  const fullDateEl = document.getElementById('ledgerCreateDate');
  if (fullDateEl) {
    fullDateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 JST (第40日自律運用中)`;
  }
}

async function loadLedgerData(isManualRefresh = false) {
  const syncIndicator = document.getElementById('syncStatusIndicator');
  if (syncIndicator) {
    syncIndicator.classList.add('updating');
  }

  try {
    const url = `data/ledger_data.json?t=${Date.now()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    rawLedgerData = await response.json();
    currentEntries = rawLedgerData.entries || [];
    
    updateKPICards(rawLedgerData.system_metadata, currentEntries);
    applyFilters();

    if (isManualRefresh) {
      showTemporaryToast('台帳データを最新状態に同期しました');
    }
  } catch (error) {
    console.warn('ローカルフェッチ失敗。埋め込みデータを探索します:', error);
    if (!currentEntries.length && window.__EMBEDDED_LEDGER__) {
      rawLedgerData = window.__EMBEDDED_LEDGER__;
      currentEntries = rawLedgerData.entries || [];
      updateKPICards(rawLedgerData.system_metadata, currentEntries);
      applyFilters();
    }
  } finally {
    if (syncIndicator) {
      setTimeout(() => syncIndicator.classList.remove('updating'), 800);
    }
  }
}

function updateKPICards(meta, entries) {
  if (!entries || !entries.length) return;

  const totalEl = document.getElementById('kpiTotalRecords');
  const totalSubEl = document.getElementById('kpiTotalSub');

  const total = entries.length;
  const projectCount = entries.filter(e => e.category.startsWith('PROJ-')).length;
  const techoCount = entries.filter(e => e.category === 'DAILY-TECHO').length;

  if (totalEl) totalEl.textContent = `${total} 件`;
  if (totalSubEl) totalSubEl.textContent = `${projectCount}大プロジェクト + ${techoCount}日分ログ`;
}

function applyFilters() {
  const categoryFilter = document.getElementById('categoryFilter').value;
  const keyword = document.getElementById('keywordSearch').value.trim().toLowerCase();

  filteredEntries = currentEntries.filter(entry => {
    if (categoryFilter !== 'ALL') {
      if (entry.category !== categoryFilter) return false;
    }

    if (keyword) {
      const targetStr = [
        entry.id,
        entry.title,
        entry.headline,
        entry.category,
        entry.audit_hash,
        (entry.causal_chain || []).join(' '),
        (entry.sources || []).join(' ')
      ].join(' ').toLowerCase();

      if (!targetStr.includes(keyword)) return false;
    }

    return true;
  });

  renderLedgerTable(filteredEntries);
  updateRecordCounter(filteredEntries.length, currentEntries.length);
}

function renderLedgerTable(entries) {
  const tbody = document.getElementById('ledgerTableBody');
  const noDataMsg = document.getElementById('noDataMessage');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (!entries.length) {
    if (noDataMsg) noDataMsg.style.display = 'block';
    return;
  }
  if (noDataMsg) noDataMsg.style.display = 'none';

  entries.forEach(entry => {
    const tr = document.createElement('tr');

    // 1. 管理番号
    const tdNum = document.createElement('td');
    tdNum.className = 'col-num';
    tdNum.textContent = entry.id;
    tr.appendChild(tdNum);

    // 2. 資産区分
    const tdCat = document.createElement('td');
    tdCat.className = 'col-cat';
    const catInfo = CATEGORY_MAP[entry.category] || CATEGORY_MAP['GENERAL'];
    tdCat.innerHTML = `
      <span class="cat-badge ${catInfo.badgeClass}">
        <span class="material-symbols-outlined" style="font-size: 13px;">${catInfo.icon}</span>
        <span>${catInfo.label}</span>
      </span>
    `;
    tr.appendChild(tdCat);

    // 3. プロジェクト名 / 日次開発件名
    const tdTitle = document.createElement('td');
    tdTitle.className = 'col-title';
    tdTitle.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px;">${escapeHtml(entry.title)}</div>
      <div style="font-size: 11px; color: #475569;">${escapeHtml(entry.headline)}</div>
    `;
    tr.appendChild(tdTitle);

    // 4. 自律実行パイプライン / 活動フロー
    const tdChain = document.createElement('td');
    tdChain.className = 'col-chain';
    const chainItemsHtml = (entry.causal_chain || []).map((step, idx) => `
      <div class="chain-item">
        <span class="chain-step-num">${idx + 1}</span>
        <span class="chain-step-text">${escapeHtml(step)}</span>
        ${idx < entry.causal_chain.length - 1 ? '<span class="material-symbols-outlined chain-step-arrow">arrow_forward</span>' : ''}
      </div>
    `).join('');
    tdChain.innerHTML = `<div class="causal-chain-flow">${chainItemsHtml}</div>`;
    tr.appendChild(tdChain);

    // 5. 主要観測KPI
    const tdMetrics = document.createElement('td');
    tdMetrics.className = 'col-metrics';
    const metricsHtml = (entry.key_metrics || []).slice(0, 3).map(m => `
      <div class="metric-item">
        <span class="metric-label">${escapeHtml(m.label)}:</span>
        <span class="metric-val">${escapeHtml(m.value)}</span>
      </div>
    `).join('');
    tdMetrics.innerHTML = `<div class="metric-summary-box">${metricsHtml || '<span style="color:#94a3b8;">記録完了</span>'}</div>`;
    tr.appendChild(tdMetrics);

    // 6. 稼働ステータス
    const tdStatus = document.createElement('td');
    tdStatus.className = 'col-status';
    tdStatus.innerHTML = `
      <span class="status-pill verified">
        <span class="material-symbols-outlined">check_circle</span>
        <span>${escapeHtml(entry.status_label)}</span>
      </span>
    `;
    tr.appendChild(tdStatus);

    // 7. 監査ハッシュ
    const tdHash = document.createElement('td');
    tdHash.className = 'col-hash';
    tdHash.textContent = entry.audit_hash;
    tr.appendChild(tdHash);

    // 8. 詳細操作ボタン
    const tdAction = document.createElement('td');
    tdAction.className = 'col-action no-print';
    const btnOpen = document.createElement('button');
    btnOpen.className = 'btn-row-action';
    btnOpen.innerHTML = '<span class="material-symbols-outlined">description</span><span>開く</span>';
    btnOpen.onclick = () => openVoucherModal(entry);
    tdAction.appendChild(btnOpen);
    tr.appendChild(tdAction);

    tbody.appendChild(tr);
  });
}

function updateRecordCounter(filteredCount, totalCount) {
  const counterEl = document.getElementById('recordCounter');
  if (counterEl) {
    counterEl.textContent = `表示中: ${filteredCount} / ${totalCount} 件`;
  }
}

function startAutoSyncCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  if (syncTimer) clearInterval(syncTimer);

  countdownRemainingSeconds = autoSyncIntervalSeconds;
  updateCountdownDisplay();

  if (autoSyncIntervalSeconds <= 0) {
    const prog = document.getElementById('autoUpdateProgress');
    if (prog) prog.style.width = '0%';
    const countEl = document.getElementById('kpiCountdown');
    if (countEl) countEl.textContent = '停止中';
    return;
  }

  countdownTimer = setInterval(() => {
    countdownRemainingSeconds--;
    if (countdownRemainingSeconds < 0) {
      countdownRemainingSeconds = autoSyncIntervalSeconds;
      loadLedgerData(false);
    }
    updateCountdownDisplay();
  }, 1000);
}

function updateCountdownDisplay() {
  const countEl = document.getElementById('kpiCountdown');
  const prog = document.getElementById('autoUpdateProgress');

  if (autoSyncIntervalSeconds <= 0) {
    if (countEl) countEl.textContent = '停止中';
    if (prog) prog.style.width = '0%';
    return;
  }

  const mins = Math.floor(countdownRemainingSeconds / 60);
  const secs = countdownRemainingSeconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (countEl) countEl.textContent = formatted;

  if (prog) {
    const pct = ((autoSyncIntervalSeconds - countdownRemainingSeconds) / autoSyncIntervalSeconds) * 100;
    prog.style.width = `${pct}%`;
  }
}

function setupEventListeners() {
  const intervalSelect = document.getElementById('autoSyncIntervalSelect');
  if (intervalSelect) {
    intervalSelect.addEventListener('change', (e) => {
      autoSyncIntervalSeconds = parseInt(e.target.value, 10);
      startAutoSyncCountdown();
    });
  }

  const btnSync = document.getElementById('btnManualSync');
  if (btnSync) {
    btnSync.addEventListener('click', () => {
      loadLedgerData(true);
      countdownRemainingSeconds = autoSyncIntervalSeconds;
      updateCountdownDisplay();
    });
  }

  const catFilter = document.getElementById('categoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', applyFilters);
  }

  const searchInput = document.getElementById('keywordSearch');
  const btnClear = document.getElementById('btnClearSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (btnClear) {
        btnClear.style.display = e.target.value ? 'flex' : 'none';
      }
      applyFilters();
    });
  }

  if (btnClear && searchInput) {
    btnClear.addEventListener('click', () => {
      searchInput.value = '';
      btnClear.style.display = 'none';
      applyFilters();
    });
  }

  const btnPrint = document.getElementById('btnPrintLedger');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  const btnExportCsv = document.getElementById('btnExportCsv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportLedgerToCsv);
  }

  const btnExportJson = document.getElementById('btnExportJson');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', exportLedgerToJson);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVoucherModal();
    }
  });
}

function openVoucherModal(entry) {
  const modal = document.getElementById('voucherModal');
  const modalDocId = document.getElementById('modalDocId');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  if (!modal || !entry) return;

  modalDocId.textContent = entry.id;
  modalTitle.textContent = entry.title;

  const catInfo = CATEGORY_MAP[entry.category] || CATEGORY_MAP['GENERAL'];

  const metricsRows = (entry.key_metrics || []).map(m => `
    <tr>
      <td style="font-weight:600; width:40%;">${escapeHtml(m.label)}</td>
      <td style="font-family:var(--font-mono); font-weight:700;">${escapeHtml(m.value)}</td>
      <td style="color:var(--text-dim); font-size:11px;">${escapeHtml(m.sub || '')}</td>
    </tr>
  `).join('');

  const sourcesList = (entry.sources || []).map(s => `
    <li class="voucher-source-item">${escapeHtml(s)}</li>
  `).join('');

  const causalChainFlow = (entry.causal_chain || []).map((step, idx) => `
    <div class="chain-item" style="margin-bottom:6px;">
      <span class="chain-step-num">${idx + 1}</span>
      <span class="chain-step-text" style="font-size:13px; font-weight:500;">${escapeHtml(step)}</span>
    </div>
  `).join('');

  modalBody.innerHTML = `
    <div class="voucher-section">
      <div class="voucher-section-title">
        <span class="material-symbols-outlined">info</span>
        <span>資産調書・管理情報</span>
      </div>
      <div style="display:grid; grid-template-columns:auto 1fr; gap:8px 16px; font-size:13px;">
        <span style="color:var(--text-dim); font-weight:600;">資産区分:</span>
        <div>
          <span class="cat-badge ${catInfo.badgeClass}">
            <span class="material-symbols-outlined" style="font-size:13px;">${catInfo.icon}</span>
            <span>${catInfo.label}</span>
          </span>
        </div>
        <span style="color:var(--text-dim); font-weight:600;">ステータス:</span>
        <span style="font-weight:700; color:var(--stamp-green);">${escapeHtml(entry.status_label)}</span>
        <span style="color:var(--text-dim); font-weight:600;">記録日時:</span>
        <span style="font-family:var(--font-mono);">${escapeHtml(entry.recorded_at)}</span>
        <span style="color:var(--text-dim); font-weight:600;">監査ハッシュ:</span>
        <span style="font-family:var(--font-mono); color:var(--stamp-blue);">${escapeHtml(entry.audit_hash)}</span>
        <span style="color:var(--text-dim); font-weight:600;">管轄エンジン:</span>
        <span>${escapeHtml(entry.verified_by)}</span>
      </div>
    </div>

    <div class="voucher-section">
      <div class="voucher-section-title">
        <span class="material-symbols-outlined">account_tree</span>
        <span>実行フロー & タイムライン</span>
      </div>
      <div style="padding-left:4px;">${causalChainFlow}</div>
    </div>

    <div class="voucher-section">
      <div class="voucher-section-title">
        <span class="material-symbols-outlined">article</span>
        <span>詳細記録・開発アクティビティ</span>
      </div>
      <p class="voucher-story-text">${escapeHtml(entry.deep_story)}</p>
    </div>

    <div class="voucher-section">
      <div class="voucher-section-title">
        <span class="material-symbols-outlined">analytics</span>
        <span>観測KPI・資産規模</span>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <tbody>${metricsRows}</tbody>
      </table>
    </div>

    <div class="voucher-section" style="margin-bottom:0;">
      <div class="voucher-section-title">
        <span class="material-symbols-outlined">folder_open</span>
        <span>参照元ファイル・リポジトリ</span>
      </div>
      <ul class="voucher-sources-list">${sourcesList}</ul>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeVoucherModal() {
  const modal = document.getElementById('voucherModal');
  if (modal) modal.style.display = 'none';
}

function printSingleVoucher() {
  window.print();
}

function resetFilters() {
  document.getElementById('categoryFilter').value = 'ALL';
  const searchInput = document.getElementById('keywordSearch');
  searchInput.value = '';
  document.getElementById('btnClearSearch').style.display = 'none';
  applyFilters();
}

function exportLedgerToCsv() {
  if (!filteredEntries || !filteredEntries.length) {
    alert('出力対象の台帳レコードがありません。');
    return;
  }

  const headers = ['管理番号', '資産区分', 'プロジェクト/日次件名', '活動要約', '活動フロー', '主要KPI', 'ステータス', 'ハッシュ', '記録日時'];
  const rows = filteredEntries.map(e => [
    e.id,
    e.category,
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${(e.headline || '').replace(/"/g, '""')}"`,
    `"${(e.causal_chain || []).join(' -> ').replace(/"/g, '""')}"`,
    `"${(e.key_metrics || []).map(m => `${m.label}:${m.value}`).join('; ').replace(/"/g, '""')}"`,
    e.status_label,
    e.audit_hash,
    e.recorded_at || ''
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `antigravity_project_ledger_40days_${formatDateForFilename(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportLedgerToJson() {
  const exportData = {
    exported_at: new Date().toISOString(),
    system_metadata: rawLedgerData ? rawLedgerData.system_metadata : {},
    entries: filteredEntries
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `antigravity_project_ledger_40days_${formatDateForFilename(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showTemporaryToast(message) {
  const existing = document.getElementById('sysToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'sysToast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f172a;
    color: #ffffff;
    padding: 10px 18px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fadeIn 0.2s ease;
  `;
  toast.innerHTML = `<span class="material-symbols-outlined" style="color:#34d399; font-size:18px;">task_alt</span><span>${escapeHtml(message)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateForFilename(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}${m}${day}_${h}${min}`;
}
