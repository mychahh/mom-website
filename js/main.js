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

// Hero canvas
const hero   = document.querySelector(".hero");
const canvas = document.querySelector(".hero-canvas");
if (hero && canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  let width = 0, height = 0;
  const COUNT = 55, points = [], mouse = { x: null, y: null, active: false };
  function createPoints() {
    points.length = 0;
    for (let i = 0; i < COUNT; i++) {
      points.push({ x: Math.random()*width, y: Math.random()*height,
        vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2 });
    }
  }
  function resizeCanvas() {
    width = hero.clientWidth; height = hero.clientHeight;
    canvas.style.width = width+"px"; canvas.style.height = height+"px";
    canvas.width = Math.floor(width*dpr); canvas.height = Math.floor(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (!points.length) createPoints();
  }
  function drawLines() {
    for (let i = 0; i < COUNT; i++) {
      const a = points[i];
      for (let j = i+1; j < COUNT; j++) {
        const b = points[j], dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 160) {
          ctx.strokeStyle = "rgba(200,192,180," + ((1-dist/160)*0.15) + ")";
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
  }
  function drawDots() {
    ctx.fillStyle = "rgba(200,192,180,0.35)";
    points.forEach((p) => { ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2); ctx.fill(); });
  }
  function draw() { ctx.clearRect(0,0,width,height); drawLines(); drawDots(); }
  function updatePoints() {
    points.forEach((p) => {
      if (mouse.active && mouse.x !== null) {
        const dx = mouse.x-p.x, dy = mouse.y-p.y, dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 180 && dist > 1) {
          const force = (1-dist/180)*0.022;
          p.vx += (dx/dist)*force; p.vy += (dy/dist)*force;
        }
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x<=0||p.x>=width) p.vx *= -1;
      if (p.y<=0||p.y>=height) p.vy *= -1;
      p.x = Math.max(0,Math.min(width,p.x)); p.y = Math.max(0,Math.min(height,p.y));
      p.vx *= 0.99; p.vy *= 0.99;
    });
  }
  function loop() { updatePoints(); draw(); requestAnimationFrame(loop); }
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX-rect.left; mouse.y = e.clientY-rect.top; mouse.active = true;
  });
  hero.addEventListener("mouseleave", () => { mouse.active = false; });
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas(); loop();
}

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