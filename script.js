/* script.js — Comportement : menu mobile, particles canvas, formulaire honeypot, petites améliorations.
   Règles de sécurité suivies :
   - Pas d'eval/innerHTML.
   - Utilisation de textContent quand on manipule du texte.
   - Pas d'injection de scripts externes (CSP 'self' prévu).
*/

document.addEventListener("DOMContentLoaded", function () {
  // --- année dynamique footer ---
  const y = new Date().getFullYear();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(y);

  // --- navigation mobile accessible ---
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("primary-navigation");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      if (!isOpen) {
        navMenu.hidden = false;
        navMenu.classList.add("open");
      } else {
        navMenu.classList.remove("open");
        navMenu.hidden = true;
      }
    });

    // Fermer le menu sur ESC
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("open");
        navMenu.hidden = true;
      }
    });

    // Fermer si clic en dehors (mobile)
    document.addEventListener("click", (ev) => {
      if (!navMenu.contains(ev.target) && !navToggle.contains(ev.target)) {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("open");
        navMenu.hidden = true;
      }
    });
  }

  // --- Honeypot anti-spam simple ---
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (ev) {
      const hp = contactForm.querySelector(".hp-field");
      if (hp && hp.value.trim() !== "") {
        // Spam détecté
        ev.preventDefault();
        // Log côté client, côté serveur on doit rejeter également
        console.warn("Formulaire bloqué: honeypot rempli");
        alert("Votre soumission ressemble à du spam et a été bloquée.");
        return;
      }
      // Trim inputs before submit (client-side hygiene)
      const fields = contactForm.querySelectorAll("input[type='text'], input[type='email'], textarea");
      fields.forEach((f) => {
        f.value = f.value.trim();
      });
      // Laisser soumettre — validation et sanitation côté serveur obligatoires.
    });
  }

  // --- Particules canvas (optimisé) ---
  (function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;
    let DPR = Math.max(1, window.devicePixelRatio || 1);
    let particles = [];
    const MAX_BASE = 140;

    function resize() {
      DPR = Math.max(1, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function createParticle() {
      const size = Math.random() * 1.6 + 0.6;
      return {
        x: Math.random() * w,
        y: h + (Math.random() * 200),
        r: size,
        vy: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        color: "#00ffff"
      };
    }

    function ensureCount() {
      const ideal = Math.min(MAX_BASE, Math.round(w / 6)); // density
      while (particles.length < ideal) particles.push(createParticle());
      if (particles.length > ideal) particles.splice(ideal);
    }

    function update() {
      particles.forEach((p) => {
        p.y -= p.vy;
        p.x += p.vx;
      });
      particles = particles.filter(p => p.y > -50 && p.x > -50 && p.x < w + 50);
      ensureCount();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    window.addEventListener("resize", () => {
      resize();
    }, { passive: true });

    resize();
    ensureCount();
    requestAnimationFrame(loop);
  })();
});
