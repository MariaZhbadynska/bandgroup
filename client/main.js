const gigs = [
  {
    id: "evt-kyiv-2025-10-25",
    place: "Київ — Docker-G Pub",
    seats: 250,
    date: "25.10.2025, 19:00",
  },
  {
    id: "evt-lviv-2025-11-01",
    place: "Львів — !FESTrepublic",
    seats: 400,
    date: "01.11.2025, 20:00",
  },
  {
    id: "evt-odesa-2025-11-09",
    place: "Одеса — Зелений театр",
    seats: 700,
    date: "09.11.2025, 19:30",
  },
  {
    id: "evt-kharkiv-2025-11-16",
    place: "Харків — ArtZavod",
    seats: 500,
    date: "16.11.2025, 19:00",
  },
];
const PRICES = { std: 500, fan: 800, vip: 1200 };

const API_BASE = `${location.origin}/api`;
const ORDERS_URL = `${API_BASE}/orders`;
const MESSAGES_URL = `${API_BASE}/messages`;

function openDialog(dlg) {
  if (!dlg) return;
  try {
    if (dlg.open) return;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  } catch {
    dlg.setAttribute("open", "");
  }
}
function closeDialog(dlg) {
  if (!dlg) return;
  if (dlg.open && typeof dlg.close === "function") dlg.close();
  else dlg.removeAttribute("open");
}

document.addEventListener("DOMContentLoaded", () => {
  new Swiper("#heroSwiper", {
    loop: true,
    effect: "fade",
    speed: 600,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
});

const gigsBody = document.getElementById("gigsBody");
if (gigsBody) {
  gigs.forEach((g) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-th="Місто / Заклад">${g.place}</td>
      <td data-th="К-сть місць">${g.seats}</td>
      <td data-th="Дата і час">${g.date}</td>
      <td class="btn-cell">
        <button class="tbl-btn" data-modal="ticket" data-gig="${g.place} — ${g.date}" data-gig-id="${g.id}">
          Замовити квиток
        </button>
      </td>`;
    gigsBody.appendChild(tr);
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const burger = document.querySelector(".burger");
const mobileMenu = document.getElementById("mobile-menu");
const closeBtn = document.querySelector(".close-btn");
burger?.addEventListener("click", () => mobileMenu.classList.add("is-open"));
closeBtn?.addEventListener("click", () =>
  mobileMenu.classList.remove("is-open")
);
mobileMenu?.addEventListener("click", (e) => {
  const link = e.target.closest("a[href^='#']");
  if (link) mobileMenu.classList.remove("is-open");
});

const ticketModal = document.getElementById("ticketModal");
const successModal = document.getElementById("successModal");
const gigField = document.getElementById("gigField");
const gigIdField = document.getElementById("gigIdField");
const gigPreview = document.getElementById("gigPreview");

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-modal]");
  if (!btn) return;
  if (btn.dataset.modal === "ticket") {
    const gigText = btn.dataset.gig || "";
    if (gigField) gigField.value = gigText;
    if (gigIdField) gigIdField.value = btn.dataset.gigId || "";
    if (gigPreview) gigPreview.textContent = gigText;
    if (ticketForm) {
      ticketForm.reset();
      if (qtyEl) qtyEl.value = "1";
      if (typeEl) typeEl.value = "std";
      updateTotal();
      ticketForm.querySelector("[name=name]")?.focus();
    }
    openDialog(ticketModal);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) {
    const dlg = e.target.closest("dialog");
    closeDialog(dlg);
  }
});

const ticketForm = document.getElementById("ticketForm");
const qtyEl = ticketForm?.querySelector("[name=qty]");
const typeEl = ticketForm?.querySelector("[name=type]");
const priceHint = document.getElementById("priceHint");
const ticketHint = document.getElementById("ticketHint");

function updateTotal() {
  if (!qtyEl || !typeEl || !priceHint) return;
  const q = Math.max(1, Math.min(6, parseInt(qtyEl.value || "1", 10)));
  const price = PRICES[typeEl.value] || 0;
  priceHint.textContent = price ? `Разом: ${q * price} грн` : "Разом: —";
}
qtyEl?.addEventListener("input", updateTotal);
typeEl?.addEventListener("change", updateTotal);

function validate(form, hintEl) {
  const name = form.querySelector("[name=name]");
  const email = form.querySelector("[type=email]");
  const okName = name.value.trim().length >= 2;
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  if (!okName) {
    hintEl.textContent = "Ім'я занадто коротке.";
    return false;
  }
  if (!okEmail) {
    hintEl.textContent = "Перевір email.";
    return false;
  }
  hintEl.textContent = "";
  return true;
}

ticketForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate(ticketForm, ticketHint)) return;

  const payload = {
    eventId: gigIdField?.value || "",
    gig: gigField?.value || "",
    name: ticketForm.name.value.trim(),
    email: ticketForm.email.value.trim(),
    type: ticketForm.type.value,
    count: Math.max(1, Math.min(6, parseInt(ticketForm.qty.value || "1", 10))),
  };

  try {
    ticketHint.textContent = "⏳ Надсилаємо…";
    const res = await fetch(ORDERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    ticketForm.reset();
    updateTotal();
    closeDialog(ticketModal);
    setTimeout(() => openDialog(successModal), 0);
  } catch (err) {
    ticketHint.textContent = `❌ ${err.message || "Помилка"}`;
  }
});

const contactForm = document.getElementById("contactForm");
const formHint = document.getElementById("formHint");

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate(contactForm, formHint)) return;

  const payload = {
    name: contactForm.name.value.trim(),
    email: contactForm.email.value.trim(),
    message: (contactForm.message?.value || "").trim(),
  };

  try {
    formHint.textContent = "⏳ Надсилаємо…";
    const res = await fetch(MESSAGES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    formHint.textContent = "✅ Повідомлення надіслано! Дякуємо ❤️";
    contactForm.reset();
  } catch (err) {
    formHint.textContent = `❌ ${err.message || "Сталася помилка"}`;
  }
});
