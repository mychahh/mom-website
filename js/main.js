// Scroll-aware nav
const header = document.querySelector("header");
if (header) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// Hamburger menu
const hamburger = document.querySelector(".hamburger");
const navLinks  = document.querySelector(".nav-links");
if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    navLinks.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburger.classList.contains("open")) {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}

// Active nav link
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a:not(.nav-button)").forEach(link => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.classList.add("active");
  }
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: "0px 0px -80px 0px", threshold: 0.08 });
document.querySelectorAll(".fade-up").forEach((el) => {
  if (!el.classList.contains("visible")) revealObserver.observe(el);
});

// Kontaktformular
const kontaktForm = document.querySelector(".contact-form form");
if (kontaktForm) {
  const statusEl     = document.getElementById("form-status");
  let letzterVersand = 0;
  const apiHost     = "web3forms.com";
  const apiPath     = "/submit";
  const apiEndpoint = "https://api." + apiHost + apiPath;

  function zeigeStatus(text, typ) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className   = "form-status form-status--" + typ;
    statusEl.hidden      = false;
    statusEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function istGueltigeEmail(wert) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert);
  }
  function leseFelder() {
    return {
      kundenname:       (kontaktForm.querySelector("[name=kundenname]")?.value       ?? "").trim(),
      kunden_email:     (kontaktForm.querySelector("[name=kunden_email]")?.value     ?? "").trim(),
      kunden_nachricht: (kontaktForm.querySelector("[name=kunden_nachricht]")?.value ?? "").trim(),
      zustimmung:        kontaktForm.querySelector("[name=zustimmung]")?.checked     ?? false,
    };
  }
  function pruefeFelder(felder) {
    if (felder.kundenname.length < 2) {
      zeigeStatus("Bitte gib deinen vollstaendigen Namen ein.", "error"); return false;
    }
    if (!istGueltigeEmail(felder.kunden_email)) {
      zeigeStatus("Bitte gib eine gueltige E-Mail-Adresse ein.", "error"); return false;
    }
    if (felder.kunden_nachricht.length < 10) {
      zeigeStatus("Deine Nachricht ist zu kurz. Bitte mindestens 10 Zeichen.", "error"); return false;
    }
    if (!felder.zustimmung) {
      zeigeStatus("Bitte stimme der Datenschutzerklaerung zu.", "error"); return false;
    }
    return true;
  }
  function setzeSendeButton(btn, aktiv) {
    if (!btn) return;
    btn.disabled    = !aktiv;
    btn.textContent = aktiv ? "Absenden" : "Wird gesendet...";
  }
  function datenAbschicken(formDaten) {
    return fetch(apiEndpoint, { method: "POST", body: formDaten })
      .then(function(r) { return r.json(); });
  }
  function verarbeiteRueckmeldung(ergebnis, btn) {
    if (ergebnis && ergebnis.success) {
      zeigeStatus("Vielen Dank! Wir melden uns innerhalb von 24 Stunden.", "success");
      kontaktForm.reset();
    } else {
      zeigeStatus("Etwas ist schiefgelaufen. Bitte schreib an hallo@mom-it.de.", "error");
    }
    setzeSendeButton(btn, true);
  }
  function zeigeNetzwerkfehler(btn) {
    zeigeStatus("Keine Verbindung. Bitte schreib an hallo@mom-it.de.", "error");
    setzeSendeButton(btn, true);
  }
  kontaktForm.addEventListener("submit", function(e) {
    e.preventDefault();
    if (statusEl) statusEl.hidden = true;
    const jetzt = Date.now();
    if (jetzt - letzterVersand < 5000) {
      zeigeStatus("Bitte warte kurz, bevor du erneut sendest.", "error"); return;
    }
    const felder = leseFelder();
    if (!pruefeFelder(felder)) return;
    const sendeBtn = kontaktForm.querySelector("[type=submit]");
    setzeSendeButton(sendeBtn, false);
    letzterVersand = jetzt;
    datenAbschicken(new FormData(kontaktForm))
      .then(function(res) { verarbeiteRueckmeldung(res, sendeBtn); })
      .catch(function() { zeigeNetzwerkfehler(sendeBtn); });
  });
}

// Warteliste-Formular (projekte.html)
const wartelisteForm = document.querySelector(".waitlist-form");
if (wartelisteForm) {
  wartelisteForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const eingabe = wartelisteForm.querySelector("input[type=email]");
    const knopf   = wartelisteForm.querySelector("button[type=submit]");
    const wert    = eingabe ? eingabe.value.trim() : "";
    if (wert && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert)) {
      if (knopf) { knopf.textContent = "Eingetragen"; knopf.style.background = "#1A1A1A"; knopf.disabled = true; }
      if (eingabe) eingabe.disabled = true;
    }
  });
}