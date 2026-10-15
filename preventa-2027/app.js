(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const modal = $("#contactModal");
  const interestSelect = $("#interest");
  const requestResult = $("#requestResult");
  const requestSummary = $("#requestSummary");

  const openModal = (interest = "") => {
    if (interest && interestSelect) {
      const option = [...interestSelect.options].find(
        (item) => item.textContent.trim().toLowerCase() === interest.trim().toLowerCase()
      );
      if (option) interestSelect.value = option.value;
    }
    modal?.classList.add("show");
    modal?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal?.classList.remove("show");
    modal?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  $$(".openModal").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.interest || ""));
  });

  $(".modal-close")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  // Modular responsive header.
  const siteHeader = $("#siteHeader");
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  const menuClose = $("#menuClose");
  const menuBackdrop = $("#mobileMenuBackdrop");
  const mobileLinks = $$(".mobile-nav a");
  const desktopLinks = $$(".header-nav a[data-nav-section]");
  let lastHeaderFocus = null;

  const getMenuFocusables = () =>
    $$('a[href], button:not([disabled])', mobileMenu).filter(
      (el) => el.offsetParent !== null
    );

  const openMenu = () => {
    if (!mobileMenu || !menuToggle || !menuBackdrop) return;
    lastHeaderFocus = document.activeElement;
    menuBackdrop.hidden = false;
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-open");
    requestAnimationFrame(() => getMenuFocusables()[0]?.focus());
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!mobileMenu || !menuToggle || !menuBackdrop) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    menuBackdrop.hidden = true;
    document.body.classList.remove("menu-open");
    if (restoreFocus && lastHeaderFocus instanceof HTMLElement) {
      lastHeaderFocus.focus();
    }
  };

  menuToggle?.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu({ restoreFocus: false }) : openMenu();
  });

  menuClose?.addEventListener("click", () => closeMenu());
  menuBackdrop?.addEventListener("click", () => closeMenu());

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
  });

  $(".mobile-cta")?.addEventListener("click", () => closeMenu({ restoreFocus: false }));

  document.addEventListener("keydown", (event) => {
    if (!mobileMenu?.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key === "Tab") {
      const focusables = getMenuFocusables();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const syncHeaderScrollState = () => {
    siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", syncHeaderScrollState, { passive: true });
  syncHeaderScrollState();

  // Close drawer automatically when moving to desktop.
  const desktopHeaderMQ = window.matchMedia("(min-width: 1211px)");
  const handleHeaderBreakpoint = (event) => {
    if (event.matches && mobileMenu?.classList.contains("is-open")) {
      closeMenu({ restoreFocus: false });
    }
  };
  desktopHeaderMQ.addEventListener?.("change", handleHeaderBreakpoint);

  // Lightweight scroll-spy for desktop navigation.
  const navSections = desktopLinks
    .map((link) => document.getElementById(link.dataset.navSection))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    const sectionVisibility = new Map();

    const setActiveHeaderLink = () => {
      const visible = [...sectionVisibility.entries()]
        .filter(([, ratio]) => ratio > 0)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      desktopLinks.forEach((link) => {
        const active = link.dataset.navSection === visible;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionVisibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        setActiveHeaderLink();
      },
      {
        rootMargin: "-18% 0px -60% 0px",
        threshold: [0, .15, .35, .6]
      }
    );

    navSections.forEach((section) => spy.observe(section));
  }

  const progress = $("#progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();


  // Live presentation controls: chapter navigation + fullscreen.
  const chapters = $(".presentation-chapter");
  const prevChapter = $("#prevChapter");
  const nextChapter = $("#nextChapter");
  const fullscreenToggle = $("#fullscreenToggle");
  const chapterLabel = $("#chapterLabel");
  const chapterCounter = $("#chapterCounter");
  const presenterReduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let activeChapterIndex = 0;
  let presenterTicking = false;

  const updatePresenterUI = () => {
    if (!chapters.length) return;
    activeChapterIndex = Math.max(0, Math.min(activeChapterIndex, chapters.length - 1));
    const chapter = chapters[activeChapterIndex];
    if (chapterLabel) chapterLabel.textContent = chapter.dataset.chapter || `Capítulo ${activeChapterIndex + 1}`;
    if (chapterCounter) {
      chapterCounter.textContent = `${String(activeChapterIndex + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
    }
    if (prevChapter) prevChapter.disabled = activeChapterIndex === 0;
    if (nextChapter) nextChapter.disabled = activeChapterIndex === chapters.length - 1;
  };

  const detectActiveChapter = () => {
    if (!chapters.length) return;
    const headerOffset = siteHeader?.offsetHeight || 80;
    const targetY = headerOffset + Math.min(window.innerHeight * 0.22, 180);
    let bestIndex = 0;
    let bestDistance = Infinity;

    chapters.forEach((chapter, index) => {
      const rect = chapter.getBoundingClientRect();
      const containsTarget = rect.top <= targetY && rect.bottom >= targetY;
      const distance = containsTarget ? 0 : Math.min(Math.abs(rect.top - targetY), Math.abs(rect.bottom - targetY));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (bestIndex !== activeChapterIndex) {
      activeChapterIndex = bestIndex;
      updatePresenterUI();
    }
  };

  const requestPresenterState = () => {
    if (presenterTicking) return;
    presenterTicking = true;
    requestAnimationFrame(() => {
      detectActiveChapter();
      presenterTicking = false;
    });
  };

  const goToChapter = (index) => {
    if (!chapters.length) return;
    activeChapterIndex = Math.max(0, Math.min(index, chapters.length - 1));
    updatePresenterUI();
    chapters[activeChapterIndex].scrollIntoView({
      behavior: presenterReduceMotion ? "auto" : "smooth",
      block: "start"
    });
  };

  prevChapter?.addEventListener("click", () => goToChapter(activeChapterIndex - 1));
  nextChapter?.addEventListener("click", () => goToChapter(activeChapterIndex + 1));

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {
      // Fullscreen can be blocked by the browser or embedding context; keep presentation usable.
    }
  };

  fullscreenToggle?.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", () => {
    if (!fullscreenToggle) return;
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreenToggle.textContent = isFullscreen ? "×" : "⛶";
    fullscreenToggle.setAttribute("aria-label", isFullscreen ? "Salir de pantalla completa" : "Entrar en pantalla completa");
  });

  const isTypingTarget = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest("input, textarea, select, [contenteditable='true']") ||
      target.getAttribute("role") === "slider"
    );
  };

  document.addEventListener("keydown", (event) => {
    if (isTypingTarget(event.target)) return;
    if (modal?.classList.contains("show") || mobileMenu?.classList.contains("is-open")) return;

    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      goToChapter(activeChapterIndex + 1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      goToChapter(activeChapterIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goToChapter(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goToChapter(chapters.length - 1);
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
    }
  });

  window.addEventListener("scroll", requestPresenterState, { passive: true });
  window.addEventListener("resize", requestPresenterState, { passive: true });
  updatePresenterUI();
  requestPresenterState();

  // Accessible inventory tabs.
  const tabs = $$(".tab");
  tabs.forEach((tab, index) => {
    const panel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
    const tabId = `tab-${tab.dataset.tab}`;
    const panelId = `panel-${tab.dataset.tab}`;

    tab.id = tabId;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
    tab.setAttribute("tabindex", index === 0 ? "0" : "-1");
    tab.setAttribute("aria-controls", panelId);

    if (panel) {
      panel.id = panelId;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
    }

    const activate = () => {
      tabs.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
        item.setAttribute("tabindex", "-1");
      });
      $$(".inventory-panel").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");
      panel?.classList.add("active");
    };

    tab.addEventListener("click", activate);
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  // SoveUro ad simulator.
  const banner = $("#appBanner");
  const bannerTitle = $("#bannerTitle");
  $$(".segment").forEach((segment) => {
    segment.addEventListener("click", () => {
      $$(".segment").forEach((item) => item.classList.remove("active"));
      segment.classList.add("active");
      if (bannerTitle) bannerTitle.textContent = segment.dataset.title || "";
      if (banner) banner.style.background = segment.dataset.color || "#ffc800";
    });
  });

  // Venue explorer.
  const zones = $$(".zone");
  zones.forEach((zone) => {
    zone.addEventListener("click", () => {
      zones.forEach((item) => item.classList.remove("active"));
      zone.classList.add("active");
      $("#zoneTitle").textContent = zone.dataset.name || "";
      $("#zoneDescription").textContent = zone.dataset.desc || "";
    });
  });

  // Sponsor strategy builder.
  const plans = {
    visibility: {
      title: "Dominio de visibilidad",
      text: "Una combinación para maximizar presencia desde la entrada, el venue y el entorno digital.",
      items: ["Stand VIP / Foyer", "Immersive Entrance", "App Takeover", "Smart Banner"]
    },
    launch: {
      title: "Lanzamiento 360°",
      text: "Presentación de producto con demostración, ciencia y frecuencia de marca.",
      items: ["Stand Oro", "Immersive Entrance", "Simposio patrocinado", "App Takeover", "Sponsored Push"]
    },
    leads: {
      title: "Lead Generation",
      text: "Convierte tráfico físico y digital en oportunidades de contacto medibles.",
      items: ["Stand comercial", "QR / NFC", "Lead Capture", "Exhibitor Profile", "Sponsor Impact Report"]
    },
    education: {
      title: "Autoridad científica",
      text: "Prioriza educación médica, contenido y asociación con el programa científico.",
      items: ["Simposio patrocinado", "Taller precongreso", "Sesión científica", "Programa digital"]
    },
    networking: {
      title: "Relacionamiento premium",
      text: "Crea oportunidades de conversación alrededor de momentos sociales y hospitality.",
      items: ["Hospitality", "Coffee Break", "Cóctel de bienvenida", "Exhibitor Profile"]
    }
  };

  const renderPlan = (key) => {
    const plan = plans[key] || plans.visibility;
    $("#planTitle").textContent = plan.title;
    $("#planText").textContent = plan.text;
    $("#planItems").innerHTML = plan.items
      .map((item, i) => `<div class="plan-chip"><span>${item}</span><span>0${i + 1}</span></div>`)
      .join("");
  };

  $$(".goal").forEach((goal) => {
    goal.addEventListener("click", () => {
      $$(".goal").forEach((item) => item.classList.remove("active"));
      goal.classList.add("active");
      renderPlan(goal.dataset.goal);
    });
  });
  renderPlan("visibility");

  $("#planCTA")?.addEventListener("click", () => {
    const key = $(".goal.active")?.dataset.goal || "visibility";
    openModal(plans[key].items[0]);
  });

  // Lead summary + email action.
  $("#leadForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const summary = [
      "SOLICITUD COMERCIAL SVU 2027",
      "",
      `Empresa: ${data.get("empresa") || "—"}`,
      `Contacto: ${data.get("nombre") || "—"}`,
      `Correo: ${data.get("email") || "—"}`,
      `Teléfono: ${data.get("telefono") || "—"}`,
      `Interés principal: ${data.get("interes") || "Por definir"}`,
      `Objetivo: ${data.get("objetivo") || "Por definir"}`,
      "",
      "Mensaje:",
      data.get("mensaje") || "Sin observaciones adicionales.",
      "",
      "Nota: disponibilidad, metrajes, precios y condiciones finales 2027 sujetos a aprobación comercial."
    ].join("\n");

    requestSummary.textContent = summary;
    requestResult.hidden = false;

    const subject = encodeURIComponent(`Solicitud comercial SVU 2027 · ${data.get("empresa") || "Casa comercial"}`);
    const body = encodeURIComponent(summary);
    $("#emailRequest").href = `mailto:soveuro@gmail.com?subject=${subject}&body=${body}`;

    requestResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("#copyRequest")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(requestSummary.textContent || "");
      const old = button.textContent;
      button.textContent = "Solicitud copiada ✓";
      setTimeout(() => (button.textContent = old), 1400);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(requestSummary);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  // Bright GSAP motion system.
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-copy > *", {
      opacity: 0,
      y: 26,
      duration: 0.85,
      stagger: 0.07,
      ease: "power3.out"
    });

    gsap.from(".hero-media", {
      opacity: 0,
      x: 35,
      scale: 0.97,
      duration: 1.05,
      delay: 0.12,
      ease: "power3.out"
    });

    $$(".reveal").forEach((element) => {
      if (element.closest(".hero")) return;
      gsap.from(element, {
        scrollTrigger: { trigger: element, start: "top 88%", once: true },
        opacity: 0,
        y: 28,
        duration: 0.75,
        ease: "power3.out"
      });
    });
  }

  // Bright Three.js tunnel.
  const canvas = $("#tunnelCanvas");
  if (canvas && window.THREE) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#eef6ff");

    const camera = new THREE.PerspectiveCamera(
      44,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(8.8, 5.4, 10.8);
    camera.lookAt(0, 2.1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0xffffff, 1.25));

    const keyLight = new THREE.PointLight(0x1769ff, 19, 35);
    keyLight.position.set(1.2, 4.5, 2);
    scene.add(keyLight);

    const tunnel = new THREE.Group();
    scene.add(tunnel);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(9, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fbff, roughness: 0.5, metalness: 0.02 })
    );
    floor.position.y = -0.1;
    tunnel.add(floor);

    const adCanvas = document.createElement("canvas");
    adCanvas.width = 1024;
    adCanvas.height = 1024;
    const ctx = adCanvas.getContext("2d");
    const adTexture = new THREE.CanvasTexture(adCanvas);
    adTexture.colorSpace = THREE.SRGBColorSpace;

    let campaignColor = "#1769ff";

    const ledMaterial = new THREE.MeshStandardMaterial({
      map: adTexture,
      emissiveMap: adTexture,
      emissive: new THREE.Color(campaignColor),
      emissiveIntensity: 1.1,
      roughness: 0.22
    });

    const drawCampaign = () => {
      const g = ctx.createLinearGradient(0, 0, 1024, 1024);
      g.addColorStop(0, "#07275b");
      g.addColorStop(0.55, "#0d57bf");
      g.addColorStop(1, campaignColor);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.strokeStyle = "rgba(255,255,255,.12)";
      ctx.lineWidth = 2;
      for (let x = 0; x < 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 58px Arial";
      ctx.fillText("SVU", 70, 110);

      ctx.fillStyle = "#ffc800";
      ctx.font = "900 118px Arial";
      ctx.fillText("2027", 66, 245);

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 46px Arial";
      ctx.fillText("YOUR BRAND", 66, 760);

      ctx.font = "30px Arial";
      ctx.fillText("IMMERSIVE ENTRANCE", 66, 815);
      adTexture.needsUpdate = true;
    };

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.75, 9.2), ledMaterial);
    left.position.set(-3.15, 2.45, 0);
    tunnel.add(left);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(6.35, 0.18, 9.2), ledMaterial);
    ceiling.position.set(0, 4.76, 0);
    tunnel.add(ceiling);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe7eef8, roughness: 0.42, metalness: 0.05 });

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.75, 9.2), wallMaterial);
    rightWall.position.set(3.15, 2.45, 0);
    tunnel.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(6.45, 4.9, 0.18), wallMaterial);
    backWall.position.set(0, 2.4, -4.62);
    tunnel.add(backWall);

    const opening = new THREE.Mesh(
      new THREE.BoxGeometry(5.15, 3.75, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    opening.position.set(0, 1.9, -4.74);
    tunnel.add(opening);

    for (let i = -4; i <= 4; i += 1.15) {
      const guide = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.035, 0.48),
        new THREE.MeshBasicMaterial({ color: 0x1769ff })
      );
      guide.position.set(0, 0.04, i);
      tunnel.add(guide);
    }

    drawCampaign();

    let dragging = false;
    let previousX = 0;

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      previousX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    });

    canvas.addEventListener("pointerup", (event) => {
      dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    });

    canvas.addEventListener("pointerleave", () => (dragging = false));

    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = event.clientX - previousX;
      tunnel.rotation.y += delta * 0.005;
      previousX = event.clientX;
    });

    $$(".theme-dot").forEach((button) => {
      button.addEventListener("click", () => {
        campaignColor = button.dataset.color || "#1769ff";
        keyLight.color.set(campaignColor);
        ledMaterial.emissive.set(campaignColor);
        drawCampaign();
      });
    });

    $("#brightness")?.addEventListener("input", (event) => {
      ledMaterial.emissiveIntensity = Number(event.target.value);
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.0035;
      if (!dragging) tunnel.rotation.y = Math.sin(time) * 0.075;
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", resize);
  }
})();