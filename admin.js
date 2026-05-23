let allItems = [];
let selPlats = [];
let activeFilter = 'all';

// ── Tab switching ──────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  const tabs = document.querySelectorAll('.tab');
  const map = { dashboard: 0, inventory: 1, add: 2 };
  if (tabs[map[name]]) tabs[map[name]].classList.add('active');
  if (name === 'inventory') renderInv();
  if (name === 'dashboard') renderDash();
}

// ── Load data ──────────────────────────────────────────
async function loadAll() {
  const { data, error } = await db.from('inventory').select('*').order('created_at', { ascending: false });
  if (error) { showToast('Error loading inventory'); return; }
  allItems = data || [];
  renderDash();
  updateBadge();
}

// ── Dashboard ──────────────────────────────────────────
function renderDash() {
  const active = allItems.filter(i => i.status !== 'sold');
  const sold = allItems.filter(i => i.status === 'sold');
  const tv = active.reduce((s, i) => s + (i.ask || 0), 0);
  const tp = active.reduce((s, i) => s + (i.profit || 0), 0);

  document.getElementById('metrics').innerHTML = `
    <div class="mc"><div class="lbl">Inventory</div><div class="val">${active.length}</div><div class="sub">active items</div></div>
    <div class="mc"><div class="lbl">Listed Value</div><div class="val">$${Math.round(tv).toLocaleString()}</div><div class="sub">asking total</div></div>
    <div class="mc"><div class="lbl">Potential Profit</div><div class="val">$${Math.round(tp).toLocaleString()}</div><div class="sub">if all sell</div></div>
    <div class="mc"><div class="lbl">Sold</div><div class="val">${sold.length}</div><div class="sub">total sold</div></div>`;

  const recent = allItems.slice(0, 8);
  document.getElementById('activity').innerHTML = recent.length
    ? recent.map(i => `
        <div class="aitem">
          <div class="aicon">${i.emoji || '👟'}</div>
          <div class="adet">
            <div class="aname">${i.name}</div>
            <div class="ameta">${i.status.toUpperCase()} · ${new Date(i.created_at).toLocaleDateString()}</div>
          </div>
          <div class="aamt">$${i.ask}</div>
        </div>`).join('')
    : '<p style="color:var(--muted);font-size:13px">No items yet.</p>';

  const pm = {};
  allItems.forEach(i => (i.platforms || []).forEach(p => pm[p] = (pm[p] || 0) + 1));
  document.getElementById('plat-breakdown').innerHTML = Object.keys(pm).length
    ? Object.entries(pm).map(([k, v]) => `<div class="prow"><span>${k}</span><span class="pc">${v} items</span></div>`).join('')
    : '<p style="color:var(--muted);font-size:13px">No items yet.</p>';
}

// ── Inventory ──────────────────────────────────────────
function setFilter(f, btn) {
  activeFilter = f;
  document.querySelectorAll('.pills .pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderInv();
}

function renderInv() {
  const grid = document.getElementById('inv-grid');
  const items = activeFilter === 'all' ? allItems : allItems.filter(i => i.status === activeFilter);
  if (!items.length) {
    grid.innerHTML = '<div class="empty">No items here. <a href="#" onclick="showTab(\'add\')" style="color:var(--brand)">Add one →</a></div>';
    return;
  }
  grid.innerHTML = items.map(i => `
    <div class="icard">
      <div class="iimg">${i.emoji || '👟'}
        <div class="iplat">${(i.platforms || ['—'])[0]}</div>
        <div class="istat s-${i.status}">${i.status}</div>
      </div>
      <div class="iinfo">
        <div class="iname" title="${i.name}">${i.name}</div>
        <div class="isub">${i.size || i.brand || '—'}</div>
        <div class="iprices">
          <div class="iask">$${i.ask}</div>
          <div class="iprofit">+$${Math.round(i.profit || 0)}</div>
        </div>
        <div class="ibtns">
          ${i.status !== 'sold'
            ? `<button class="btn btn-ghost btn-sm" style="flex:1" onclick="markSold(${i.id})">Mark Sold</button>`
            : ''}
          <button class="btn btn-danger btn-sm" onclick="delItem(${i.id})">✕</button>
        </div>
      </div>
    </div>`).join('');
}

async function markSold(id) {
  const { error } = await db.from('inventory').update({ status: 'sold' }).eq('id', id);
  if (error) { showToast('Error updating item'); return; }
  allItems = allItems.map(i => i.id === id ? { ...i, status: 'sold' } : i);
  renderInv(); renderDash(); updateBadge();
  showToast('✓ Marked as sold!');
}

async function delItem(id) {
  if (!confirm('Remove this item from inventory?')) return;
  const { error } = await db.from('inventory').delete().eq('id', id);
  if (error) { showToast('Error deleting item'); return; }
  allItems = allItems.filter(i => i.id !== id);
  renderInv(); renderDash(); updateBadge();
  showToast('Item removed.');
}

// ── Add Item Form ──────────────────────────────────────
function togPlat(btn, name) {
  btn.classList.toggle('sel');
  selPlats = selPlats.includes(name) ? selPlats.filter(p => p !== name) : [...selPlats, name];
}

function checkGenBtn() {
  document.getElementById('gen-btn').disabled = !document.getElementById('f-name').value.trim();
}

function calcProfit() {
  const c = parseFloat(document.getElementById('f-cost').value) || 0;
  const a = parseFloat(document.getElementById('f-ask').value) || 0;
  const p = a * 0.87 - c;
  const el = document.getElementById('pval');
  el.textContent = '$' + Math.round(p);
  el.style.color = p >= 0 ? 'var(--brand)' : 'var(--red)';
}

async function genDesc() {
  const name = document.getElementById('f-name').value.trim();
  const size = document.getElementById('f-size').value.trim();
  const brand = document.getElementById('f-brand').value;
  const ask = document.getElementById('f-ask').value;
  if (!name) return;
  const btn = document.getElementById('gen-btn');
  btn.textContent = '⏳ Generating…';
  btn.disabled = true;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Write a short compelling eBay listing description for: "${name}". Details: ${size || 'used'}. Category: ${brand || 'general'}. Price: $${ask || '?'}. Keep it 3-4 sentences. Include condition, compatibility or fit info, and a fast-shipping note. Plain text only, no markdown.`
        }]
      })
    });
    const d = await r.json();
    document.getElementById('f-desc').value = d.content[0].text;
    showToast('✨ Description generated!');
  } catch (e) {
    showToast('Could not generate — write your own above!');
  }
  btn.textContent = '✨ Regenerate Description';
  btn.disabled = false;
}

async function addItem() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { alert('Please enter an item name'); return; }
  const cost = parseFloat(document.getElementById('f-cost').value) || 0;
  const ask = parseFloat(document.getElementById('f-ask').value) || 0;
  const item = {
    name,
    brand: document.getElementById('f-brand').value,
    size: document.getElementById('f-size').value,
    cost,
    ask,
    profit: ask * 0.87 - cost,
    platforms: [...selPlats],
    status: document.getElementById('f-status').value,
    emoji: document.getElementById('f-emoji').value,
    description: document.getElementById('f-desc').value
  };
  const { data, error } = await db.from('inventory').insert([item]).select();
  if (error) { showToast('Error saving item: ' + error.message); return; }
  allItems.unshift(data[0]);
  showToast('✓ ' + name + ' saved!');
  clearForm();
  updateBadge();
  showTab('inventory');
}

function clearForm() {
  ['f-name','f-cost','f-ask','f-size','f-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-brand').value = '';
  document.getElementById('f-status').value = 'listed';
  document.getElementById('f-emoji').value = '👟';
  selPlats = [];
  document.querySelectorAll('.pb').forEach(b => b.classList.remove('sel'));
  document.getElementById('pval').textContent = '$0';
  document.getElementById('gen-btn').disabled = true;
  document.getElementById('gen-btn').textContent = '✨ Generate eBay Description with AI';
}

// ── Helpers ────────────────────────────────────────────
function updateBadge() {
  document.getElementById('inv-badge').textContent = allItems.filter(i => i.status !== 'sold').length;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Init ───────────────────────────────────────────────
loadAll();
