const API_BASE = `${location.origin}/api`;
const ENDPOINTS = {
  orders: `${API_BASE}/orders`,
  messages: `${API_BASE}/messages`,
};

const rows = document.getElementById("rows");
const thead = document.getElementById("thead");
const empty = document.getElementById("empty");
const q = document.getElementById("q");
const status = document.getElementById("status");
const statusWrap = document.getElementById("statusWrap");
const sectionSel = document.getElementById("section");
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

let section = (sectionSel && sectionSel.value) || "orders";
let data = [];

function setHeaders() {
  if (section === "orders") {
    thead.innerHTML = `
      <tr>
        <th>Створено</th>
        <th>Подія</th>
        <th>Клієнт</th>
        <th>К-сть</th>
        <th>Тип</th>
        <th>Статус</th>
        <th></th>
      </tr>
    `;
    statusWrap.hidden = false;
  } else {
    thead.innerHTML = `
      <tr>
        <th>Створено</th>
        <th>Клієнт</th>
        <th>Повідомлення</th>
        <th></th>
      </tr>
    `;
    statusWrap.hidden = true;
  }
}

async function load() {
  const url = ENDPOINTS[section];
  const res = await fetch(url);
  data = await res.json();
  render();
}

function t(v) {
  return (v ?? "").toString();
}
function lc(v) {
  return t(v).toLowerCase();
}

function render() {
  const text = q ? lc(q.value) : "";
  const st = !statusWrap.hidden && status ? status.value : "";

  const items = data.filter((o) => {
    if (section === "orders" && st && o.status !== st) return false;
    if (!text) return true;

    if (section === "orders") {
      return (
        lc(o.name).includes(text) ||
        lc(o.email).includes(text) ||
        lc(o.gig).includes(text) ||
        lc(o.eventId).includes(text) ||
        lc(o.type).includes(text) ||
        t(o.count).includes(text) ||
        lc(o.status).includes(text)
      );
    } else {
      return (
        lc(o.name).includes(text) ||
        lc(o.email).includes(text) ||
        lc(o.message).includes(text)
      );
    }
  });

  rows.innerHTML = "";
  empty.hidden = items.length > 0;

  items.forEach((o) => {
    const tr = document.createElement("tr");
    const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : "";

    if (section === "orders") {
      tr.innerHTML = `
        <td>${created}</td>
        <td>
          ${t(o.gig)}
          ${o.eventId ? `<div class="muted">${t(o.eventId)}</div>` : ""}
        </td>
        <td>
          <div>${t(o.name)}</div>
          ${o.email ? `<a href="mailto:${o.email}">${o.email}</a>` : ""}
        </td>
        <td>${o.count ?? ""}</td>
        <td>${t(o.type)}</td>
        <td>${
          o.status ? `<span class="badge ${o.status}">${o.status}</span>` : ""
        }</td>
        <td><button data-id="${
          o._id
        }" class="btn danger sm">Видалити</button></td>
      `;
    } else {
      tr.innerHTML = `
        <td>${created}</td>
        <td>
          <div>${t(o.name)}</div>
          ${o.email ? `<a href="mailto:${o.email}">${o.email}</a>` : ""}
        </td>
        <td>${t(o.message)}</td>
        <td><button data-id="${
          o._id
        }" class="btn danger sm">Видалити</button></td>
      `;
    }

    rows.appendChild(tr);
  });
}

rows?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const url = `${ENDPOINTS[section]}/${id}`;
  await fetch(url, { method: "DELETE" });
  data = data.filter((x) => x._id !== id);
  render();
});

document.getElementById("refresh")?.addEventListener("click", load);
q?.addEventListener("input", render);
status?.addEventListener("change", render);
sectionSel?.addEventListener("change", () => {
  section = sectionSel.value || "orders";
  setHeaders();
  load();
});

// старт
setHeaders();
load();
