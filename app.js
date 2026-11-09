// Finance Command Center — vanilla JS PWA logic
// No build step, no dependencies. Data is saved to this phone's browser
// storage (localStorage) as an instant local cache, AND synced to a shared
// Firestore document so you and Diana see the same data on separate devices.

const STORAGE_KEY = "financeCommandCenterData";

// --- Cloud sync (Firebase Firestore) ---------------------------------
// Both of your devices read/write this same document. Whoever saves last
// wins on any given field — there's no per-field merge, so if you're both
// editing at the exact same moment, the later save overwrites the earlier
// one. Fine for two people casually checking a shared budget.
const firebaseConfig = {
  apiKey: "AIzaSyAV6nsCvf4KEb_t0itGOrPTs13UwSzpRJ8",
  authDomain: "financecommand-de53a.firebaseapp.com",
  projectId: "financecommand-de53a",
  storageBucket: "financecommand-de53a.firebasestorage.app",
  messagingSenderId: "354273683834",
  appId: "1:354273683834:web:a05983db8f2fcf2aee0ec3",
};
const SHARED_DOC_PATH = ["households", "hale-family"];

let cloudDb = null;
let cloudDocRef = null;
let cloudReady = false;
let suppressNextSnapshot = false;

try {
  const cloudApp = firebase.initializeApp(firebaseConfig);
  cloudDb = firebase.firestore(cloudApp);
  cloudDocRef = cloudDb.collection(SHARED_DOC_PATH[0]).doc(SHARED_DOC_PATH[1]);
} catch (e) {
  // No network / Firebase blocked (e.g. sandboxed preview) — app still
  // works fully offline from localStorage, just without cross-device sync.
  console.warn("Cloud sync unavailable, using local storage only:", e);
}

function startCloudSync() {
  if (!cloudDocRef) return;

  cloudDocRef.onSnapshot(
    (snap) => {
      cloudReady = true;
      if (suppressNextSnapshot) {
        suppressNextSnapshot = false;
        return;
      }
      if (snap.metadata.hasPendingWrites) return; // ignore our own local write echo
      if (!snap.exists) {
        pushToCloud();
        return;
      }
      const cloudData = snap.data();
      if (cloudData && cloudData.payload) {
        data = normalizeData({ ...structuredClone(DEFAULT_DATA), ...JSON.parse(cloudData.payload) });
        storageSet(STORAGE_KEY, cloudData.payload);
        renderApp();
      }
    },
    (err) => {
      console.warn("Cloud sync error:", err);
    }
  );
}

function pushToCloud() {
  if (!cloudDocRef) return;
  suppressNextSnapshot = true;
  cloudDocRef.set({ payload: JSON.stringify(data), updatedAt: Date.now() }).catch((e) => {
    console.warn("Cloud save failed, change is still saved locally:", e);
  });
}

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
    { name: "AT&T", amount: 255.00, due: 27 },
    { name: "Brightway Credit", amount: 25, due: 27 },
  ],
  debts: [
    { name: "Freedom Flex", balance: 200.39, minPay: 25.00, apr: 27.99 },
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
  ],
  extraPayment: 6500,
  payoffMethod: "snowball",
  reminderSettings: { enabled: false, daysBefore: 3 },
  assets: [{ name: "TSP Balance", value: 55000 }],
  otherLiabilities: [
    { name: "Mortgage Balance", value: 332244.81 },
    { name: "TSP Loan 1 Balance", value: 2439.36 },
    { name: "TSP Loan 2 Balance", value: 14842.27 },
    { name: "College Direct Loan Sub 1-01", value: 4500.00, note: "Payments start 01/01/2027" },
    { name: "College Direct Loan Unsub 1-02", value: 5724.67, note: "Payments start 01/01/2027" },
    { name: "College Direct Loan Sub 1-03", value: 1469.00, note: "Payments start 01/01/2027" },
    { name: "College Direct Loan Sub 1-04", value: 5500.00, note: "Payments start 01/01/2027" },
    { name: "College Direct Loan Unsub 1-05", value: 5665.60, note: "Payments start 01/01/2027" },
    { name: "College Direct Loan Sub 1-06", value: 5500.00, note: "Payments start 01/01/2027" },
    { name: "College Direct Loan Unsub 1-07", value: 995.79, note: "Payments start 01/01/2027" },
  ],
  goals: [
    { name: "Emergency Fund", target: 15000, current: 0 },
    { name: "Rental Property Down Payment", target: 40000, current: 0 },
    { name: "RV Fund", target: 60000, current: 0 },
  ],
  // Which bills have been checked off, by month: { "2026-11": { "bill:Mortgage": true } }
  paid: {},
};

// Cleans up data loaded from storage or the cloud: drops the old checkbook
// register and makes sure the paid-bills map exists.
function normalizeData(d) {
  delete d.register;
  if (!d.paid || typeof d.paid !== "object") d.paid = {};
  return d;
}

// Wrap localStorage so a sandboxed preview that blocks it (throws instead of
// just being unavailable) can't break saves/re-renders — falls back to an
// in-memory store for that session. Real hosting (GitHub Pages, opened
// locally, installed PWA) has normal localStorage and persists as before.
const memoryFallback = {};
let storageBlocked = false;
function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    storageBlocked = true;
    return key in memoryFallback ? memoryFallback[key] : null;
  }
}
function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    storageBlocked = true;
    memoryFallback[key] = value;
  }
}

function loadData() {
  try {
    const raw = storageGet(STORAGE_KEY);
    if (raw) return normalizeData({ ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) });
  } catch (e) {}
  return structuredClone(DEFAULT_DATA);
}

let data = loadData();

function save() {
  storageSet(STORAGE_KEY, JSON.stringify(data));
  pushToCloud();
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
// ---- monthly bill checklist ----
function monthKey(y, m) { return `${y}-${String(m + 1).padStart(2, "0")}`; }
function itemId(type, name) { return type + ":" + name; }
function isPaid(y, m, id) {
  const month = data.paid && data.paid[monthKey(y, m)];
  return !!(month && month[id]);
}
function togglePaid(y, m, id) {
  if (!data.paid) data.paid = {};
  const k = monthKey(y, m);
  const month = data.paid[k] || (data.paid[k] = {});
  if (month[id]) delete month[id];
  else month[id] = true;
  if (Object.keys(month).length === 0) delete data.paid[k];
  save();
  renderApp();
}

// Every bill due in a given month (plus debts with a due day that aren't
// already listed as a bill), with its paid status for that month. A bill due
// on the 31st lands on the last day of shorter months.
function billsForMonth(y, m) {
  const dim = new Date(y, m + 1, 0).getDate();
  const billNames = new Set(data.bills.map((b) => b.name));
  const items = [];
  data.bills.forEach((b) => {
    if (b.due >= 1) items.push({ id: itemId("bill", b.name), type: "bill", name: b.name, amount: b.amount || 0, day: Math.min(b.due, dim) });
  });
  data.debts.forEach((d) => {
    if (d.dueDay >= 1 && !billNames.has(d.name)) {
      items.push({ id: itemId("debt", d.name), type: "debt", name: d.name, amount: d.minPay || 0, day: Math.min(d.dueDay, dim) });
    }
  });
  items.forEach((it) => { it.paid = isPaid(y, m, it.id); });
  items.sort((a, b) => a.day - b.day || a.name.localeCompare(b.name));
  return items;
}

function paydaysForMonth(y, m) {
  const dim = new Date(y, m + 1, 0).getDate();
  return data.income
    .filter((i) => i.payday >= 1)
    .map((i) => ({ name: i.name, amount: i.amount || 0, day: Math.min(i.payday, dim) }));
}

// Unpaid bills that are past due this month or due within windowDays
// (looks into next month too). Checked-off bills are skipped.
function upcomingItems(windowDays) {
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const items = [];
  for (let offset = 0; offset <= 1; offset++) {
    const ref = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const y = ref.getFullYear(), m = ref.getMonth();
    billsForMonth(y, m).forEach((it) => {
      if (it.paid) return;
      const days = Math.round((new Date(y, m, it.day) - todayMid) / 86400000);
      if (days <= windowDays) items.push({ ...it, days, y, m });
    });
  }
  items.sort((a, b) => a.days - b.days);
  return items;
}

// Square check button used everywhere a bill can be checked off.
function checkButton(paid, onToggle) {
  const btn = document.createElement("button");
  btn.className = "chk" + (paid ? " on" : "");
  btn.setAttribute("aria-label", paid ? "Mark as not paid" : "Mark as paid");
  btn.textContent = paid ? "✓" : "";
  btn.onclick = (e) => { e.stopPropagation(); onToggle(); };
  return btn;
}

function switchTab(name) {
  currentTab = name;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  window.scrollTo(0, 0);
  renderApp();
}

// Fires a browser notification for anything newly inside the reminder
// window, once per item per day (tracked in localStorage so re-opening the
// app the same day doesn't spam duplicate notifications).
function checkAndFireReminders() {
  const rs = data.reminderSettings;
  if (!rs || !rs.enabled) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const todayStr = new Date().toISOString().slice(0, 10);
  const notifiedKey = "reminderNotified_" + todayStr;
  let notified = [];
  try { notified = JSON.parse(storageGet(notifiedKey) || "[]"); } catch (e) {}
  const items = upcomingItems(rs.daysBefore);
  let changed = false;
  items.forEach((it) => {
    const id = it.id + "_" + monthKey(it.y, it.m);
    if (notified.includes(id)) return;
    const when = it.days < 0 ? "past due" : it.days === 0 ? "due today" : `due in ${it.days} day${it.days === 1 ? "" : "s"}`;
    try {
      new Notification("Finance Command Center", {
        body: `${it.name} — ${fmt(it.amount)} ${when}`,
        icon: "icon-192.png",
      });
    } catch (e) {}
    notified.push(id);
    changed = true;
  });
  if (changed) storageSet(notifiedKey, JSON.stringify(notified));
}

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
    let input;
    if (f.type === "select") {
      input = document.createElement("select");
      f.options.forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        input.appendChild(o);
      });
      input.value = initial ? initial[f.key] : f.options[0].value;
    } else {
      input = document.createElement("input");
      input.type = f.type === "number" ? "number" : "text";
      if (f.type === "number") input.step = "any";
      input.value = initial ? initial[f.key] : "";
    }
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
      .filter((f) => item[f.key] !== undefined && item[f.key] !== null && item[f.key] !== "")
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
function renderReminders(root) {
  const rs = data.reminderSettings || (data.reminderSettings = { enabled: false, daysBefore: 3 });
  const permission = (typeof Notification !== "undefined") ? Notification.permission : "unsupported";
  const upcoming = upcomingItems(rs.daysBefore);

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div class="section-title">Coming up</div>`;

  const toggleRow = document.createElement("div");
  toggleRow.className = "extra-row";
  toggleRow.innerHTML = `<span class="field-label" style="margin:0;">Notify me</span>`;
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn " + (rs.enabled ? "btn-primary" : "btn-secondary");
  toggleBtn.style.flex = "0 0 auto";
  toggleBtn.style.padding = "8px 16px";
  toggleBtn.textContent = rs.enabled ? "On" : "Off";
  toggleBtn.onclick = () => {
    if (rs.enabled) {
      rs.enabled = false;
      save();
      renderApp();
      return;
    }
    if (permission === "granted") {
      rs.enabled = true;
      save();
      renderApp();
      checkAndFireReminders();
    } else if (permission === "denied") {
      alert("Notifications are blocked for this site in your browser settings — enable them there, then try again.");
    } else if (typeof Notification !== "undefined") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") {
          rs.enabled = true;
          save();
          checkAndFireReminders();
        }
        renderApp();
      });
    }
  };
  toggleRow.appendChild(toggleBtn);
  card.appendChild(toggleRow);

  const daysRow = document.createElement("div");
  daysRow.className = "extra-row";
  daysRow.innerHTML = `<span class="field-label" style="margin:0;">Days before due date</span>`;
  const daysInput = document.createElement("input");
  daysInput.type = "number";
  daysInput.min = "0";
  daysInput.value = rs.daysBefore;
  daysInput.onchange = () => {
    rs.daysBefore = Math.max(0, parseInt(daysInput.value) || 0);
    save();
    renderApp();
  };
  daysRow.appendChild(daysInput);
  card.appendChild(daysRow);

  if (permission === "denied") {
    const p = document.createElement("p");
    p.className = "stat-sub";
    p.style.color = "var(--red)";
    p.textContent = "Notifications are blocked in this browser for this site — check site settings to re-enable.";
    card.appendChild(p);
  } else if (permission !== "unsupported") {
    const p = document.createElement("p");
    p.className = "stat-sub";
    p.textContent = "Notifications only fire while the app is open on this device — open it daily (or keep it installed and reopen it each morning) for reminders to work.";
    card.appendChild(p);
  }

  const listWrap = document.createElement("div");
  listWrap.style.marginTop = "10px";
  if (upcoming.length === 0) {
    listWrap.innerHTML = `<div class="empty">Nothing unpaid in the next ${rs.daysBefore} days.</div>`;
  } else {
    upcoming.forEach((it) => {
      const urgent = it.days <= 0;
      const when = it.days < 0 ? `${-it.days}d past due` : it.days === 0 ? "due today" : `in ${it.days}d`;
      const row = document.createElement("div");
      row.className = "row";
      row.appendChild(checkButton(false, () => togglePaid(it.y, it.m, it.id)));
      const main = document.createElement("div");
      main.className = "row-main";
      main.innerHTML = `
        <div class="row-name">${it.name}</div>
        <div class="row-meta" style="color:${urgent ? "var(--red)" : "var(--gold)"};">${when}</div>
      `;
      row.appendChild(main);
      const amt = document.createElement("div");
      amt.className = "row-amt";
      amt.textContent = fmt(it.amount);
      row.appendChild(amt);
      listWrap.appendChild(row);
    });
  }
  card.appendChild(listWrap);

  root.appendChild(card);
}

function renderDashboard(root) {
  const months = projectDebtFreeMonths(data.debts, data.extraPayment, data.payoffMethod);

  root.appendChild(monthProgressCard(new Date().getFullYear(), new Date().getMonth(), true));
  renderReminders(root);

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
    div.style.background = paid ? "var(--green-dim)" : isTarget ? "var(--gold)" : "var(--surface)";
    div.style.color = paid ? "var(--green)" : isTarget ? "var(--gold-text)" : "var(--text-dim)";
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

  renderList(root, "Income", "income", [{ key: "name", label: "Source" }, { key: "amount", label: "$/mo", type: "number" }, { key: "payday", label: "Payday (day of month)", type: "number" }], "Gross monthly pay");
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
     { key: "minPay", label: "Min pay", type: "number" }, { key: "apr", label: "APR %", type: "number" },
     { key: "dueDay", label: "Due day", type: "number" }],
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
  renderList(root, "Other liabilities", "otherLiabilities", [{ key: "name", label: "Liability" }, { key: "value", label: "Value", type: "number" }, { key: "note", label: "Note" }], "Total other liabilities");

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
      openModal("Edit goal", [{ key: "name", label: "Goal" }, { key: "target", label: "Target $", type: "number" }, { key: "current", label: "Current $", type: "number" }, { key: "deadline", label: "Deadline (YYYY-MM-DD)" }], g, (updated) => {
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
    openModal("Add goal", [{ key: "name", label: "Goal" }, { key: "target", label: "Target $", type: "number" }, { key: "current", label: "Current $", type: "number" }, { key: "deadline", label: "Deadline (YYYY-MM-DD)" }], null, (result) => {
      data.goals.push(result);
      save();
      renderApp();
    });
  };
  root.appendChild(card);
}

// ---- calendar: monthly bill checklist ----
let calendarDate = new Date();
let calendarSelectedDay = null;
let calendarFilter = "all"; // "all" | "unpaid"

// Paid / left-to-pay summary for one month. On the dashboard it links to the calendar.
function monthProgressCard(y, m, linkToCalendar) {
  const items = billsForMonth(y, m);
  const total = items.reduce((s, it) => s + it.amount, 0);
  const paidAmt = items.filter((it) => it.paid).reduce((s, it) => s + it.amount, 0);
  const paidCount = items.filter((it) => it.paid).length;
  const left = total - paidAmt;
  const pct = total > 0 ? (paidAmt / total) * 100 : (items.length && paidCount === items.length ? 100 : 0);
  const monthName = new Date(y, m, 1).toLocaleString("default", { month: "long" });

  const card = document.createElement("div");
  card.className = "card";
  if (linkToCalendar) {
    card.style.cursor = "pointer";
    card.onclick = () => {
      calendarDate = new Date(y, m, 1);
      calendarSelectedDay = null;
      switchTab("calendar");
    };
  }
  card.innerHTML = `
    <p class="stat-label">${monthName} bills</p>
    <p class="stat-value ${left > 0.005 ? "gold" : "green"}" style="font-size:30px;">${left > 0.005 ? fmt(left) + " left" : "All paid"}</p>
    <p class="stat-sub">${paidCount} of ${items.length} paid, ${fmt(paidAmt)} of ${fmt(total)}</p>
    <div class="progress-track" style="margin-top:8px;"><div class="progress-fill" style="width:${Math.max(0, Math.min(100, pct))}%;background:var(--green);"></div></div>
    ${linkToCalendar ? `<p class="stat-sub" style="margin-top:8px;">Tap to open the bill calendar</p>` : ""}
  `;
  return card;
}

function renderCalendar(root) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const items = billsForMonth(year, month);
  const paydays = paydaysForMonth(year, month);
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const isPastDay = (d) => new Date(year, month, d) < todayMid;

  // Month navigation
  const navCard = document.createElement("div");
  navCard.className = "card";
  const nav = document.createElement("div");
  nav.className = "cal-nav";
  nav.style.marginBottom = "0";
  nav.innerHTML = `
    <span class="cal-month-label">${calendarDate.toLocaleString("default", { month: "long", year: "numeric" })}</span>
    <div class="cal-nav-btns">
      <button class="cal-prev" aria-label="Previous month">&lsaquo;</button>
      <button class="cal-today-btn">Today</button>
      <button class="cal-next" aria-label="Next month">&rsaquo;</button>
    </div>
  `;
  nav.querySelector(".cal-prev").onclick = () => {
    calendarDate = new Date(year, month - 1, 1);
    calendarSelectedDay = null;
    renderApp();
  };
  nav.querySelector(".cal-next").onclick = () => {
    calendarDate = new Date(year, month + 1, 1);
    calendarSelectedDay = null;
    renderApp();
  };
  nav.querySelector(".cal-today-btn").onclick = () => {
    calendarDate = new Date();
    calendarSelectedDay = new Date().getDate();
    renderApp();
    scrollToDay(calendarSelectedDay);
  };
  navCard.appendChild(nav);
  root.appendChild(navCard);

  root.appendChild(monthProgressCard(year, month, false));

  // Calendar grid
  const gridCard = document.createElement("div");
  gridCard.className = "card";
  const legend = document.createElement("div");
  legend.className = "cal-legend";
  legend.innerHTML = `
    <span><i class="cal-dot due"></i>Unpaid</span>
    <span><i class="cal-dot late"></i>Past due</span>
    <span><i class="cal-dot done"></i>All paid</span>
    ${paydays.length ? `<span><i class="cal-dot pay"></i>Payday</span>` : ""}
  `;
  gridCard.appendChild(legend);

  const grid = document.createElement("div");
  grid.className = "cal-grid";
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
    const el = document.createElement("div");
    el.className = "cal-dow";
    el.textContent = d;
    grid.appendChild(el);
  });
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDow; i++) {
    const el = document.createElement("div");
    el.className = "cal-day empty";
    grid.appendChild(el);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayItems = items.filter((it) => it.day === d);
    const unpaid = dayItems.filter((it) => !it.paid).length;
    const hasPay = paydays.some((p) => p.day === d);
    const el = document.createElement("div");
    el.className = "cal-day" +
      (isCurrentMonth && d === today.getDate() ? " today" : "") +
      (calendarSelectedDay === d ? " selected" : "") +
      (dayItems.length || hasPay ? " has-events" : "");
    el.innerHTML = `<div class="cal-day-num">${d}</div>`;
    if (dayItems.length) {
      const badge = document.createElement("div");
      if (unpaid === 0) {
        badge.className = "cal-badge done";
        badge.textContent = "✓";
      } else {
        badge.className = "cal-badge " + (isPastDay(d) ? "late" : "due");
        badge.textContent = unpaid;
      }
      el.appendChild(badge);
    }
    if (hasPay) {
      const bar = document.createElement("div");
      bar.className = "cal-pay";
      el.appendChild(bar);
    }
    if (dayItems.length || hasPay) {
      el.onclick = () => {
        calendarSelectedDay = calendarSelectedDay === d ? null : d;
        renderApp();
        if (calendarSelectedDay) scrollToDay(d);
      };
    }
    grid.appendChild(el);
  }
  gridCard.appendChild(grid);
  root.appendChild(gridCard);

  // Checklist
  const listCard = document.createElement("div");
  listCard.className = "card";
  listCard.innerHTML = `<div class="section-title">Bill checklist<button class="add-btn">+ Add bill</button></div>`;
  listCard.querySelector(".add-btn").onclick = () => {
    const fields = [{ key: "name", label: "Bill" }, { key: "due", label: "Due day", type: "number" }, { key: "amount", label: "$/mo", type: "number" }];
    openModal("Add bill", fields, { name: "", due: calendarSelectedDay || "", amount: "" }, (result) => {
      data.bills.push(result);
      save();
      renderApp();
    });
  };

  const toggle = document.createElement("div");
  toggle.className = "toggle-group";
  toggle.style.marginBottom = "6px";
  [["all", "All bills"], ["unpaid", "Unpaid only"]].forEach(([val, label]) => {
    const b = document.createElement("button");
    b.className = "toggle-btn" + (calendarFilter === val ? " active" : "");
    b.textContent = label;
    b.onclick = () => { calendarFilter = val; renderApp(); };
    toggle.appendChild(b);
  });
  listCard.appendChild(toggle);

  const shown = calendarFilter === "unpaid" ? items.filter((it) => !it.paid) : items;
  const shownPaydays = calendarFilter === "unpaid" ? [] : paydays;
  const days = [...new Set([...shown.map((it) => it.day), ...shownPaydays.map((p) => p.day)])].sort((a, b) => a - b);

  if (items.length === 0) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "No bills set up yet. Tap + Add bill to start your checklist.";
    listCard.appendChild(e);
  } else if (days.length === 0) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "Every bill this month is checked off.";
    listCard.appendChild(e);
  }

  days.forEach((d) => {
    const group = document.createElement("div");
    group.className = "cal-group" + (calendarSelectedDay === d ? " selected" : "");
    group.id = "cal-day-" + d;
    const dayBills = shown.filter((it) => it.day === d);
    const dayTotal = dayBills.reduce((s, it) => s + it.amount, 0);
    const dateLabel = new Date(year, month, d).toLocaleString("default", { weekday: "short", month: "short", day: "numeric" });
    group.innerHTML = `<div class="cal-group-head"><span>${dateLabel}</span><span>${dayBills.length ? fmt(dayTotal) : ""}</span></div>`;

    shownPaydays.filter((p) => p.day === d).forEach((p) => {
      const row = document.createElement("div");
      row.className = "row bill-row payday";
      row.innerHTML = `
        <span class="pay-mark">$</span>
        <div class="row-main"><div class="row-name">${p.name}</div><div class="row-meta">Payday</div></div>
        <div class="row-amt green">+${fmt(p.amount)}</div>
      `;
      group.appendChild(row);
    });

    dayBills.forEach((it) => {
      const late = !it.paid && isPastDay(d);
      const row = document.createElement("div");
      row.className = "row bill-row" + (it.paid ? " paid" : "") + (late ? " late" : "");
      row.style.cursor = "pointer";
      row.onclick = () => togglePaid(year, month, it.id);
      row.appendChild(checkButton(it.paid, () => togglePaid(year, month, it.id)));
      const main = document.createElement("div");
      main.className = "row-main";
      const status = it.paid ? "Paid" : late ? "Past due" : (it.type === "debt" ? "Debt payment" : "Not paid yet");
      main.innerHTML = `<div class="row-name">${it.name}</div><div class="row-meta">${status}</div>`;
      row.appendChild(main);
      const amt = document.createElement("div");
      amt.className = "row-amt";
      amt.textContent = fmt(it.amount);
      row.appendChild(amt);
      group.appendChild(row);
    });
    listCard.appendChild(group);
  });

  root.appendChild(listCard);

  const note = document.createElement("p");
  note.className = "stat-sub";
  note.style.padding = "0 4px";
  note.textContent = "Tap a bill to check it off. Each month starts fresh, and checkmarks sync between your phones. Edit amounts and due days on the Budget tab.";
  root.appendChild(note);
}

function scrollToDay(d) {
  const el = document.getElementById("cal-day-" + d);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

let currentTab = "dashboard";
const RENDERERS = {
  dashboard: renderDashboard,
  budget: renderBudget,
  debts: renderDebts,
  networth: renderNetWorth,
  goals: renderGoals,
  calendar: renderCalendar,
};

function renderApp() {
  const root = document.getElementById("app");
  root.innerHTML = "";
  RENDERERS[currentTab](root);
  const footer = document.createElement("footer");
  footer.textContent = storageBlocked
    ? "Preview mode: changes work but won't be saved after refresh. Open the file directly to save normally."
    : "Saved automatically on this phone.";
  root.appendChild(footer);
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

renderApp();
startCloudSync();
checkAndFireReminders();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkAndFireReminders();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
