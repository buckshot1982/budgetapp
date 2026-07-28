// Finance Command Center — vanilla JS PWA logic
// No build step, no dependencies. Data is saved to this phone's browser
// storage (localStorage) automatically after every change.

const STORAGE_KEY = "financeCommandCenterData";

const DEFAULT_DATA = {
  income: [
    { name: "Retirement Pay", amount: 3023.00 },
    { name: "VA Payment", amount: 4000.00 },
    { name: "ASG Payment", amount: 8333.34 },
    { name: "Diana's Income", amount: 3333.33 },
  ],
  deductions: [
    { name: "Federal Tax", amount: 1760.06 },
    { name: "FICA Social Security", amount: 723.33 },
    { name: "FICA Medicare", amount: 169.17 },
    { name: "GA State Tax", amount: 608.26 },
    { name: "Traditional 401k/IRA", amount: 833.33 },
    { name: "Roth 401k/IRA", amount: 833.33 },
  ],
  allotments: [
    { name: "TSP Loan 1", amount: 146.90 },
    { name: "TSP Loan 2", amount: 339.30 },
  ],
  bills: [
    { name: "Table Bill", amount: 199, due: 1 },
    { name: "Pioneer", amount: 336.05, due: 1 },
    { name: "Shed (Rent-to-Own)", amount: 175, due: 1 },
    { name: "Mortgage", amount: 2754.77, due: 1 },
    { name: "Water", amount: 70, due: 1 },
    { name: "Freedom Flex", amount: 25, due: 2 },
    { name: "Quicksilver 8785", amount: 25, due: 3 },
    { name: "Navy Federal Credit", amount: 59.86, due: 5 },
    { name: "Diana Cash App", amount: 100, due: 5 },
    { name: "OneMain Loan", amount: 397.40, due: 7 },
    { name: "Affirm 1", amount: 24.10, due: 8 },
    { name: "Savor 9968", amount: 25, due: 9 },
    { name: "Xfinity", amount: 86.20, due: 9 },
    { name: "Military Star Card", amount: 30, due: 9 },
    { name: "GameStop Pro", amount: 0, due: 14 },
    { name: "Road Runner Financial", amount: 176, due: 15 },
    { name: "Capital One Savor 1101", amount: 25, due: 15 },
    { name: "Martial Arts", amount: 101, due: 15 },
    { name: "Progressive", amount: 137.65, due: 16 },
    { name: "Affirm 2", amount: 55.56, due: 17 },
    { name: "Merrick Credit", amount: 48, due: 17 },
    { name: "Affirm 3", amount: 261.23, due: 18 },
    { name: "Georgia Electric", amount: 200, due: 18 },
    { name: "Diana Savor Card 7247", amount: 50, due: 20 },
    { name: "Jason Cash App", amount: 100, due: 21 },
    { name: "Amazon Store", amount: 30, due: 23 },
    { name: "Diana Credit One", amount: 50, due: 26 },
    { name: "AT&T", amount: 247.29, due: 27 },
    { name: "Brightway Credit", amount: 25, due: 27 },
  ],
  debts: [
    { name: "Freedom Flex (chase)", balance: 200.39, minPay: 25.00, apr: 27.99 },
    { name: "Amazon Store", balance: 247.83, minPay: 30.00, apr: 29.49 },
    { name: "Diana Savor Card 7247", balance: 390.85, minPay: 50.00, apr: 29.00 },
    { name: "Diana Credit One", balance: 410.56, minPay: 50.00, apr: 29.00 },
    { name: "Savor 9968", balance: 516.88, minPay: 25.00, apr: 24.49 },
    { name: "Quicksilver 8785", balance: 556.17, minPay: 25.00, apr: 4.00 },
    { name: "Merrick Credit", balance: 1089.35, minPay: 48.00, apr: 29.70 },
    { name: "Brightway Credit", balance: 1379.28, minPay: 25.00, apr: 27.99 },
    { name: "Capital One Savor 1101", balance: 1475.28, minPay: 25.00, apr: 4.00 },
    { name: "Table Bill", balance: 1500.00, minPay: 199.00, apr: 29.99 },
    { name: "Military Star Card", balance: 1658.09, minPay: 30.00, apr: 21.74 },
    { name: "Pioneer", balance: 3559.30, minPay: 333.05, apr: 35.99 },
    { name: "Road Runner Financial", balance: 6682.69, minPay: 176.00, apr: 18.99 },
    { name: "OneMain Loan", balance: 9692.48, minPay: 397.40, apr: 35.99 },
    { name: "Direct Loan Sub 1-01", balance: 4500.00, minPay: 0.00, apr: 4.990 },
    { name: "Direct Loan Unsub 1-02", balance: 5724.67, minPay: 0.00, apr: 4.990 },
    { name: "Direct Loan Sub 1-03", balance: 1469.00, minPay: 0.00, apr: 5.500 },
    { name: "Direct Loan Sub 1-04", balance: 5500.00, minPay: 0.00, apr: 6.530 },
    { name: "Direct Loan Unsub 1-05", balance: 5665.60, minPay: 0.00, apr: 6.530 },
    { name: "Direct Loan Sub 1-06", balance: 5500.00, minPay: 0.00, apr: 6.390 },
    { name: "Direct Loan Unsub 1-07", balance: 995.79, minPay: 0.00, apr: 6.390 },
  ],
  extraPayment: 6500,
  payoffMethod: "snowball",
  assets: [{ name: "TSP Balance", value: 55000 }],
  otherLiabilities: [
    { name: "Mortgage Balance", value: 332244.81 },
    { name: "TSP Loan 1 Balance", value: 2439.36 },
    { name: "TSP Loan 2 Balance", value: 14842.27 },
  ],
  goals: [
    { name: "Emergency Fund", target: 15000, current: 0 },
    { name: "Rental Property Down Payment", target: 40000, current: 0 },
    { name: "RV Fund", target: 60000, current: 0 },
  ],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) };
  } catch (e) {}
  return structuredClone(DEFAULT_DATA);
}

let data = loadData();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function fmt(n) {
  return (Number(n) || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function fmtCompact(n) {
  return (Number(n) || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function projectDebtFreeMonths(debts, extra, method, maxMonths = 240) {
  if (debts.length === 0 || debts.every((d) => d.balance <= 0)) return 0;
  const order = [...debts].sort((a, b) =>
    method === "avalanche" ? b.apr - a.apr : a.balance - b.balance
  );
  const bal = {}, minPay = {}, apr = {};
  order.forEach((d, i) => { bal[i] = d.balance; minPay[i] = d.minPay; apr[i] = d.apr; });
  let months = 0;
  while (months < maxMonths) {
    const active = Object.keys(bal).filter((i) => bal[i] > 0.01);
    if (active.length === 0) return months;
    active.forEach((i) => { bal[i] += (bal[i] * apr[i]) / 100 / 12; });
    active.forEach((i) => { const pay = Math.min(minPay[i], bal[i]); bal[i] -= pay; });
    let pool = extra;
    for (const i of active) {
      if (pool <= 0) break;
      if (bal[i] <= 0) continue;
      const pay = Math.min(pool, bal[i]);
      bal[i] -= pay;
      pool -= pay;
    }
    months += 1;
  }
  return months;
}

// ---- computed getters ----
const gross = () => data.income.reduce((s, i) => s + (i.amount || 0), 0);
const totalDeductions = () => data.deductions.reduce((s, i) => s + (i.amount || 0), 0);
const totalAllotments = () => data.allotments.reduce((s, i) => s + (i.amount || 0), 0);
const totalBills = () => data.bills.reduce((s, i) => s + (i.amount || 0), 0);
const netTakeHome = () => gross() - totalDeductions() - totalAllotments();
const remaining = () => netTakeHome() - totalBills();
const totalDebt = () => data.debts.reduce((s, d) => s + (d.balance || 0), 0);
const totalAssets = () => data.assets.reduce((s, a) => s + (a.value || 0), 0);
const totalOtherLiab = () => data.otherLiabilities.reduce((s, l) => s + (l.value || 0), 0);
const netWorth = () => totalAssets() - totalOtherLiab() - totalDebt();
const sortedDebts = () => [...data.debts].sort((a, b) =>
  data.payoffMethod === "avalanche" ? b.apr - a.apr : a.balance - b.balance
);

// ---- generic modal for add/edit ----
function openModal(title, fields, initial, onSave) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `<h3>${title}</h3>`;
  const inputs = {};
  fields.forEach((f) => {
    const wrap = document.createElement("div");
    wrap.className = "modal-field";
    const label = document.createElement("label");
    label.className = "field-label";
    label.textContent = f.label;
    const input = document.createElement("input");
    input.type = f.type === "number" ? "number" : "text";
    if (f.type === "number") input.step = "any";
    input.value = initial ? initial[f.key] : "";
    wrap.appendChild(label);
    wrap.appendChild(input);
    modal.appendChild(wrap);
    inputs[f.key] = input;
  });
  const actions = document.createElement("div");
  actions.className = "modal-actions";
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn btn-secondary";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => backdrop.remove();
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-primary";
  saveBtn.textContent = "Save";
  saveBtn.onclick = () => {
    const result = {};
    fields.forEach((f) => {
      const v = inputs[f.key].value;
      result[f.key] = f.type === "number" ? (parseFloat(v) || 0) : v;
    });
    onSave(result);
    backdrop.remove();
  };
  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  modal.appendChild(actions);
  backdrop.appendChild(modal);
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  document.body.appendChild(backdrop);
}

// ---- list section renderer (income/deductions/allotments/bills/assets/liabilities) ----
function renderList(container, title, key, fields, totalLabel) {
  const card = document.createElement("div");
  card.className = "card";
  const items = data[key];
  const total = items.reduce((s, it) => {
    const numKey = fields.find((f) => f.type === "number" && f.key !== "due");
    return s + (numKey ? (it[numKey.key] || 0) : 0);
  }, 0);

  card.innerHTML = `<div class="section-title">${title}<button class="add-btn">+ Add</button></div>`;
  const rowsWrap = document.createElement("div");
  if (items.length === 0) {
    rowsWrap.innerHTML = `<div class="empty">Nothing here yet — tap + Add.</div>`;
  }
  items.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "row";
    const meta = fields.filter((f) => f.key !== "name" && f.key !== fields.find(x=>x.type==="number"&&x.key!=="due")?.key)
      .map((f) => `${f.label}: ${item[f.key]}`).join(" · ");
    const amountField = fields.find((f) => f.type === "number" && f.key !== "due");
    row.innerHTML = `
      <div class="row-main">
        <div class="row-name">${item.name}</div>
        ${meta ? `<div class="row-meta">${meta}</div>` : ""}
      </div>
      <div class="row-amt">${amountField ? fmt(item[amountField.key]) : ""}</div>
      <button class="row-del">&times;</button>
    `;
    row.querySelector(".row-main").onclick = () => {
      openModal(`Edit ${title.slice(0, -1) || title}`, fields, item, (updated) => {
        data[key][idx] = updated;
        save();
        renderApp();
      });
    };
    row.querySelector(".row-del").onclick = (e) => {
      e.stopPropagation();
      data[key].splice(idx, 1);
      save();
      renderApp();
    };
    rowsWrap.appendChild(row);
  });
  card.appendChild(rowsWrap);
  if (totalLabel) {
    const totalRow = document.createElement("div");
    totalRow.className = "total-row";
    totalRow.innerHTML = `<span>${totalLabel}</span><span>${fmt(total)}</span>`;
    card.appendChild(totalRow);
  }
  card.querySelector(".add-btn").onclick = () => {
    openModal(`Add ${title.slice(0, -1) || title}`, fields, null, (result) => {
      data[key].push(result);
      save();
      renderApp();
    });
  };
  container.appendChild(card);
}

// ---- tab renderers ----
function renderDashboard(root) {
  const months = projectDebtFreeMonths(data.debts, data.extraPayment, data.payoffMethod);
  const stats = document.createElement("div");
  stats.className = "stats-grid";
  const items = [
    ["Net worth", fmt(netWorth()), netWorth() >= 0 ? "green" : "red"],
    ["Total debt", fmtCompact(totalDebt()), "red"],
    ["Remaining/mo", fmtCompact(remaining()), "gold"],
    ["Debt-free in", months === 0 ? "There!" : `${months} mo`, "green"],
  ];
  items.forEach(([label, val, cls]) => {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = `<p class="stat-label">${label}</p><p class="stat-value ${cls}">${val}</p>`;
    stats.appendChild(c);
  });
  root.appendChild(stats);

  const progressCard = document.createElement("div");
  progressCard.className = "card";
  progressCard.innerHTML = `<div class="section-title">Payoff progress (${data.payoffMethod})</div>`;
  const grid = document.createElement("div");
  grid.className = "ribbon-grid";
  const target = sortedDebts().find((d) => d.balance > 0.01);
  sortedDebts().forEach((d) => {
    const orig = DEFAULT_DATA.debts.find((o) => o.name === d.name);
    const origBal = orig ? orig.balance : d.balance || 1;
    const pctPaid = Math.max(0, Math.min(100, 100 - (d.balance / origBal) * 100));
    const div = document.createElement("div");
    const paid = d.balance <= 0.01;
    const isTarget = target && target.name === d.name;
    div.className = "ribbon";
    div.style.background = paid ? "var(--green-dim)" : isTarget ? "var(--gold)" : "#223050";
    div.style.color = paid ? "var(--green)" : isTarget ? "#4a2c02" : "var(--text-dim)";
    div.title = d.name;
    div.textContent = paid ? "✓" : Math.round(pctPaid) + "%";
    grid.appendChild(div);
  });
  progressCard.appendChild(grid);
  root.appendChild(progressCard);

  const goalsCard = document.createElement("div");
  goalsCard.className = "card";
  goalsCard.innerHTML = `<div class="section-title">Goals</div>`;
  data.goals.forEach((g) => {
    const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
    const row = document.createElement("div");
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
        <span>${g.name}</span><span class="stat-sub">${fmt(g.current)} / ${fmt(g.target)}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,pct))}%;background:var(--green);"></div></div>
    `;
    goalsCard.appendChild(row);
  });
  root.appendChild(goalsCard);
}

function renderBudget(root) {
  const stats = document.createElement("div");
  stats.className = "stats-grid";
  [
    ["Gross income", fmt(gross()), ""],
    ["Net take-home", fmt(netTakeHome()), "gold"],
    ["Total bills", fmt(totalBills()), "red"],
    ["Remaining", fmt(remaining()), remaining() >= 0 ? "green" : "red"],
  ].forEach(([label, val, cls]) => {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = `<p class="stat-label">${label}</p><p class="stat-value ${cls}">${val}</p>`;
    stats.appendChild(c);
  });
  root.appendChild(stats);

  renderList(root, "Income", "income", [{ key: "name", label: "Source" }, { key: "amount", label: "$/mo", type: "number" }], "Gross monthly pay");
  renderList(root, "Deductions", "deductions", [{ key: "name", label: "Item" }, { key: "amount", label: "$/mo", type: "number" }], "Total deductions");
  renderList(root, "Allotments", "allotments", [{ key: "name", label: "Item" }, { key: "amount", label: "$/mo", type: "number" }], "Total allotments");
  renderList(root, "Bills", "bills", [{ key: "name", label: "Bill" }, { key: "due", label: "Due day", type: "number" }, { key: "amount", label: "$/mo", type: "number" }], "Total bills");
}

function renderDebts(root) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div class="section-title">Payoff method</div>`;
  const toggle = document.createElement("div");
  toggle.className = "toggle-group";
  ["snowball", "avalanche"].forEach((m) => {
    const b = document.createElement("button");
    b.className = "toggle-btn" + (data.payoffMethod === m ? " active" : "");
    b.textContent = m[0].toUpperCase() + m.slice(1);
    b.onclick = () => { data.payoffMethod = m; save(); renderApp(); };
    toggle.appendChild(b);
  });
  card.appendChild(toggle);

  const extraRow = document.createElement("div");
  extraRow.className = "extra-row";
  extraRow.style.marginTop = "12px";
  extraRow.innerHTML = `<span class="field-label" style="margin:0;">Extra $/mo</span>`;
  const extraInput = document.createElement("input");
  extraInput.type = "number";
  extraInput.value = data.extraPayment;
  extraInput.onchange = () => { data.extraPayment = parseFloat(extraInput.value) || 0; save(); renderApp(); };
  extraRow.appendChild(extraInput);
  card.appendChild(extraRow);
  root.appendChild(card);

  const stats = document.createElement("div");
  stats.className = "stats-grid";
  const months = projectDebtFreeMonths(data.debts, data.extraPayment, data.payoffMethod);
  [
    ["Total debt", fmt(totalDebt()), "red"],
    ["Debt-free in", months === 0 ? "There!" : `${months} months`, "green"],
  ].forEach(([label, val, cls]) => {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = `<p class="stat-label">${label}</p><p class="stat-value ${cls}">${val}</p>`;
    stats.appendChild(c);
  });
  root.appendChild(stats);

  renderList(root, "Debts", "debts",
    [{ key: "name", label: "Debt" }, { key: "balance", label: "Balance", type: "number" },
     { key: "minPay", label: "Min pay", type: "number" }, { key: "apr", label: "APR %", type: "number" }],
    "Total remaining");

  const target = sortedDebts().find((d) => d.balance > 0.01);
  if (target) {
    const t = document.createElement("div");
    t.className = "card";
    t.innerHTML = `<p class="stat-label">Current target</p><p class="stat-value gold">${target.name}</p>
      <p class="stat-sub">${fmt(target.balance)} left at ${target.apr}% APR — extra ${fmt(data.extraPayment)}/mo goes here until it's gone.</p>`;
    root.appendChild(t);
  }
}

function renderNetWorth(root) {
  const stats = document.createElement("div");
  stats.className = "stats-grid";
  [
    ["Assets", fmt(totalAssets()), "green"],
    ["Liabilities", fmt(totalOtherLiab() + totalDebt()), "red"],
    ["Net worth", fmt(netWorth()), netWorth() >= 0 ? "green" : "red"],
  ].forEach(([label, val, cls]) => {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = `<p class="stat-label">${label}</p><p class="stat-value ${cls}">${val}</p>`;
    stats.appendChild(c);
  });
  root.appendChild(stats);

  renderList(root, "Assets", "assets", [{ key: "name", label: "Asset" }, { key: "value", label: "Value", type: "number" }], "Total assets");
  renderList(root, "Other liabilities", "otherLiabilities", [{ key: "name", label: "Liability" }, { key: "value", label: "Value", type: "number" }], "Total other liabilities");

  const note = document.createElement("p");
  note.className = "stat-sub";
  note.style.padding = "0 4px";
  note.textContent = "Net worth = Assets − Other liabilities − Total debt (synced live from the Debts tab).";
  root.appendChild(note);
}

function renderGoals(root) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div class="section-title">Savings goals<button class="add-btn">+ Add</button></div>`;
  if (data.goals.length === 0) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "No goals yet — tap + Add.";
    card.appendChild(e);
  }
  data.goals.forEach((g, idx) => {
    const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
    const row = document.createElement("div");
    row.style.marginBottom = "14px";
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span class="row-name">${g.name}</span>
        <button class="row-del" data-idx="${idx}">&times;</button>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);margin-bottom:4px;">
        <span>${fmt(g.current)} / ${fmt(g.target)}</span><span>${Math.round(pct)}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,pct))}%;background:var(--green);"></div></div>
    `;
    row.querySelector(".row-name").onclick = () => {
      openModal("Edit goal", [{ key: "name", label: "Goal" }, { key: "target", label: "Target $", type: "number" }, { key: "current", label: "Current $", type: "number" }], g, (updated) => {
        data.goals[idx] = updated;
        save();
        renderApp();
      });
    };
    row.querySelector(".row-del").onclick = () => {
      data.goals.splice(idx, 1);
      save();
      renderApp();
    };
    card.appendChild(row);
  });
  card.querySelector(".add-btn").onclick = () => {
    openModal("Add goal", [{ key: "name", label: "Goal" }, { key: "target", label: "Target $", type: "number" }, { key: "current", label: "Current $", type: "number" }], null, (result) => {
      data.goals.push(result);
      save();
      renderApp();
    });
  };
  root.appendChild(card);
}

let currentTab = "dashboard";
const RENDERERS = {
  dashboard: renderDashboard,
  budget: renderBudget,
  debts: renderDebts,
  networth: renderNetWorth,
  goals: renderGoals,
};

function renderApp() {
  const root = document.getElementById("app");
  root.innerHTML = "";
  RENDERERS[currentTab](root);
  const footer = document.createElement("footer");
  footer.textContent = "Saved automatically on this phone.";
  root.appendChild(footer);
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentTab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderApp();
  });
});

renderApp();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
