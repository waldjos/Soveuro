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

  const isInteractiveTarget = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest("input, textarea, select, button, a, [contenteditable='true'], [role='slider'], [role='button']")
    );
  };

  document.addEventListener("keydown", (event) => {
    if (isInteractiveTarget(event.target)) return;
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

  const markVenueInterest = $("#markVenueInterest");
  markVenueInterest?.addEventListener("click", () => {
    const selected = $("#zoneTitle")?.textContent?.trim() || "espacio seleccionado";
    markVenueInterest.textContent = `Oportunidad marcada · ${selected} ✓`;
    markVenueInterest.classList.add("is-marked");
  });

  // Module 01 · Commercial map + live pricing.
  const commercialTargets = $(".plan-zone, .stand-node");
  const standArea = $("#standArea");
  const standAreaValue = $("#standAreaValue");
  const rateApplied = $("#rateApplied");
  const spaceTotal = $("#spaceTotal");
  const wifiDays = $("#wifiDays");
  const wifiTotal = $("#wifiTotal");
  const selectionFeedback = $("#selectionFeedback");
  let selectedCommercialZone = "Foyer";

  const money = (value) =>
    new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);

  const updateCommercialPrice = () => {
    if (!standArea) return;
    const area = Number(standArea.value || 6);
    const rate = area >= 6 ? 1000 : 1200;
    if (standAreaValue) standAreaValue.textContent = `${area} m²`;
    if (rateApplied) rateApplied.textContent = `${money(rate)} / m²`;
    if (spaceTotal) spaceTotal.textContent = money(area * rate);
  };

  const updateWifiPrice = () => {
    const days = Number(wifiDays?.value || 1);
    if (wifiTotal) wifiTotal.textContent = money(days * 1000);
  };

  commercialTargets.forEach((target) => {
    target.addEventListener("click", () => {
      commercialTargets.forEach((item) => item.classList.remove("active"));
      target.classList.add("active");

      const stand = target.dataset.stand ? ` S${target.dataset.stand}` : "";
      selectedCommercialZone = `${target.dataset.zone || "Espacio"}${stand}`;

      if ($("#zoneTitle")) $("#zoneTitle").textContent = selectedCommercialZone;
      if ($("#zoneDescription")) $("#zoneDescription").textContent = target.dataset.desc || "";
      if ($("#zoneMeta")) $("#zoneMeta").textContent = target.dataset.meta || "Información por validar";

      if (target.dataset.zone === "Stand comercial" && standArea) {
        standArea.value = "6";
        updateCommercialPrice();
      }
    });
  });

  standArea?.addEventListener("input", updateCommercialPrice);
  wifiDays?.addEventListener("change", updateWifiPrice);
  updateCommercialPrice();
  updateWifiPrice();

  $("#addCommercialSelection")?.addEventListener("click", () => {
    const area = Number(standArea?.value || 6);
    const rate = area >= 6 ? 1000 : 1200;
    const days = Number(wifiDays?.value || 1);
    if (selectionFeedback) {
      selectionFeedback.textContent =
        `✓ ${selectedCommercialZone}: ${area} m² · ${money(area * rate)}. Wi-Fi ${days} día(s): ${money(days * 1000)}.`;
    }
  });

  // Venue explorer.
  const zones = $(".zone");
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

  // Realistic hotel corridor + dynamic LED tunnel.
  const canvas = $("#tunnelCanvas");
  if (canvas && window.THREE) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d7cec2");
    scene.fog = new THREE.Fog(0xd7cec2, 22, 48);

    const camera = new THREE.PerspectiveCamera(
      46,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );

    const cameraViews = {
      entrance: {
        pos: new THREE.Vector3(0.2, 2.25, 11.5),
        look: new THREE.Vector3(0, 2.05, -7.4)
      },
      walk: {
        pos: new THREE.Vector3(0.55, 2.15, 3.2),
        look: new THREE.Vector3(0, 2.05, -9.5)
      },
      ballroom: {
        pos: new THREE.Vector3(0.15, 2.05, -3.8),
        look: new THREE.Vector3(0, 2.35, -16.5)
      }
    };

    let activeCameraView = "entrance";
    const desiredCameraPos = cameraViews.entrance.pos.clone();
    const desiredLook = cameraViews.entrance.look.clone();
    const currentLook = desiredLook.clone();
    camera.position.copy(desiredCameraPos);
    camera.lookAt(currentLook);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.HemisphereLight(0xfff5e6, 0x30435f, 2.4));

    const warmKey = new THREE.DirectionalLight(0xffddb0, 2.8);
    warmKey.position.set(4, 8, 8);
    warmKey.castShadow = true;
    scene.add(warmKey);

    const blueFill = new THREE.PointLight(0x0b4fa8, 15, 26, 1.8);
    blueFill.position.set(-2.6, 3.4, 4.8);
    scene.add(blueFill);

    const hallLight = new THREE.PointLight(0xffd8a2, 17, 25, 1.5);
    hallLight.position.set(0, 4.8, -12);
    scene.add(hallLight);

    const corridor = new THREE.Group();
    scene.add(corridor);

    // Materials inspired by a premium hotel corridor.
    const marbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xb9ada2,
      roughness: 0.24,
      metalness: 0.04,
      clearcoat: 0.42,
      clearcoatRoughness: 0.18
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xc9bba9,
      roughness: 0.72,
      metalness: 0.02
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x3a3029,
      roughness: 0.28,
      metalness: 0.74
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xb79245,
      roughness: 0.26,
      metalness: 0.78
    });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.14, 27), marbleMat);
    floor.position.set(0, -0.08, -2.1);
    floor.receiveShadow = true;
    corridor.add(floor);

    // Subtle marble guide strips.
    for (let x = -2.8; x <= 2.8; x += 1.4) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.012, 26.5),
        new THREE.MeshBasicMaterial({ color: 0xd8cec3, transparent: true, opacity: 0.48 })
      );
      strip.position.set(x, 0.002, -2.1);
      corridor.add(strip);
    }

    // Right architectural wall.
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.65, 16.8), stoneMat);
    rightWall.position.set(3.7, 2.28, 0.2);
    rightWall.receiveShadow = true;
    corridor.add(rightWall);

    // Left structural frame behind the LED wall.
    const leftBacking = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.65, 16.8), darkMetalMat);
    leftBacking.position.set(-3.7, 2.28, 0.2);
    corridor.add(leftBacking);

    // Dynamic LED canvas.
    const ledCanvas = document.createElement("canvas");
    ledCanvas.width = 1536;
    ledCanvas.height = 768;
    const ctx = ledCanvas.getContext("2d");
    const ledTexture = new THREE.CanvasTexture(ledCanvas);
    ledTexture.colorSpace = THREE.SRGBColorSpace;
    ledTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    let campaignColor = "#0b4fa8";
    let motionMode = "institutional";
    let ledIntensity = 1.25;

    const ledMaterial = new THREE.MeshStandardMaterial({
      map: ledTexture,
      emissiveMap: ledTexture,
      emissive: new THREE.Color(0x123a73),
      emissiveIntensity: ledIntensity,
      roughness: 0.2,
      metalness: 0.03
    });

    const leftLED = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.18, 15.8), ledMaterial);
    leftLED.position.set(-3.55, 2.24, 0.25);
    corridor.add(leftLED);

    // Ceiling LED only in the entrance corridor, then hotel ceiling resumes at the ballroom threshold.
    const ceilingLED = new THREE.Mesh(new THREE.BoxGeometry(7.05, 0.12, 10.6), ledMaterial);
    ceilingLED.position.set(0, 4.46, 2.7);
    corridor.add(ceilingLED);

    const ceilingHotel = new THREE.Mesh(
      new THREE.BoxGeometry(7.05, 0.16, 6.2),
      new THREE.MeshStandardMaterial({ color: 0xe0d5c8, roughness: 0.65 })
    );
    ceilingHotel.position.set(0, 4.46, -5.75);
    corridor.add(ceilingHotel);

    // Right wall vertical frames + warm sconces.
    for (let z = 7.0; z >= -6.2; z -= 2.7) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.7, 0.12), darkMetalMat);
      frame.position.set(3.57, 2.3, z);
      corridor.add(frame);

      const sconce = new THREE.PointLight(0xffc982, 5.4, 5.5, 2);
      sconce.position.set(3.25, 2.35, z - 0.65);
      scene.add(sconce);

      const fixture = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.58, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xd5ab60, emissive: 0x8a5c19, emissiveIntensity: 0.7 })
      );
      fixture.position.set(3.48, 2.35, z - 0.65);
      corridor.add(fixture);
    }

    // Door frame into ballroom.
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.26, 0.32), darkMetalMat);
    frameTop.position.set(0, 4.25, -7.25);
    corridor.add(frameTop);
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.3, 0.32), darkMetalMat);
    frameLeft.position.set(-3.55, 2.1, -7.25);
    corridor.add(frameLeft);
    const frameRight = frameLeft.clone();
    frameRight.position.x = 3.55;
    corridor.add(frameRight);

    // Ballroom beyond corridor.
    const ballroomFloor = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.16, 15), marbleMat);
    ballroomFloor.position.set(0, -0.06, -14.8);
    ballroomFloor.receiveShadow = true;
    corridor.add(ballroomFloor);

    const ballroomBack = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 5.2, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x372f2b, roughness: 0.56 })
    );
    ballroomBack.position.set(0, 2.55, -22.1);
    corridor.add(ballroomBack);

    // Stage + screen.
    const stage = new THREE.Mesh(
      new THREE.BoxGeometry(7.8, 0.5, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.55 })
    );
    stage.position.set(0, 0.25, -20.6);
    corridor.add(stage);

    const stageCanvas = document.createElement("canvas");
    stageCanvas.width = 1024;
    stageCanvas.height = 512;
    const stageCtx = stageCanvas.getContext("2d");
    const stageTexture = new THREE.CanvasTexture(stageCanvas);
    stageTexture.colorSpace = THREE.SRGBColorSpace;
    const stageScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(6.9, 3.25),
      new THREE.MeshBasicMaterial({ map: stageTexture })
    );
    stageScreen.position.set(0, 2.55, -21.93);
    corridor.add(stageScreen);

    const drawStage = () => {
      const g = stageCtx.createLinearGradient(0, 0, 1024, 512);
      g.addColorStop(0, "#082c65");
      g.addColorStop(1, "#0f68c8");
      stageCtx.fillStyle = g;
      stageCtx.fillRect(0, 0, 1024, 512);
      stageCtx.fillStyle = "#e0b83d";
      stageCtx.font = "900 86px Arial";
      stageCtx.fillText("SVU", 392, 220);
      stageCtx.fillStyle = "#ffffff";
      stageCtx.font = "700 28px Arial";
      stageCtx.fillText("SOCIEDAD VENEZOLANA DE UROLOGÍA", 260, 270);
      stageCtx.font = "600 24px Arial";
      stageCtx.fillText("CONGRESO 2027", 408, 322);
      stageTexture.needsUpdate = true;
    };
    drawStage();

    // Ballroom chairs for depth and scale.
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x2d3035, roughness: 0.65 });
    for (let row = 0; row < 4; row++) {
      for (let col = -3; col <= 3; col++) {
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.78, 0.58), chairMat);
        chair.position.set(col * 1.12, 0.42, -11.0 - row * 1.55);
        corridor.add(chair);
      }
    }

    // Simplified chandeliers in ballroom.
    for (const z of [-11.5, -16]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.06, 12, 36),
        new THREE.MeshStandardMaterial({ color: 0xd1ad66, emissive: 0x9b6e2f, emissiveIntensity: 0.65, metalness: 0.7, roughness: 0.2 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 4.1, z);
      corridor.add(ring);
      const chandelierLight = new THREE.PointLight(0xffd7a0, 7, 9, 2);
      chandelierLight.position.set(0, 3.85, z);
      scene.add(chandelierLight);
    }

    // Human silhouettes for scale.
    const humanMat = new THREE.MeshStandardMaterial({ color: 0x202832, roughness: 0.7 });
    const addPerson = (x, z, scale = 1) => {
      const person = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.3 * scale, 1.45 * scale, 14), humanMat);
      body.position.y = 1.0 * scale;
      body.castShadow = true;
      person.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 16, 12), new THREE.MeshStandardMaterial({ color: 0xa67b62, roughness: 0.8 }));
      head.position.y = 1.88 * scale;
      head.castShadow = true;
      person.add(head);
      person.position.set(x, 0, z);
      corridor.add(person);
    };
    addPerson(0.65, 1.0, 0.9);
    addPerson(-1.25, -1.3, 0.84);
    addPerson(1.5, -5.0, 0.78);

    // Decorative gold strips framing the LED wall.
    const ledTrimTop = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 15.9), brassMat);
    ledTrimTop.position.set(-3.45, 4.32, 0.25);
    corridor.add(ledTrimTop);
    const ledTrimBottom = ledTrimTop.clone();
    ledTrimBottom.position.y = 0.17;
    corridor.add(ledTrimBottom);

    const particles = Array.from({ length: 86 }, (_, i) => ({
      x: (i * 173) % ledCanvas.width,
      y: (i * 97) % ledCanvas.height,
      r: 1.2 + (i % 5) * 0.8,
      phase: (i * 0.37) % (Math.PI * 2)
    }));

    const hexToRgb = (hex) => {
      const value = hex.replace("#", "");
      const n = Number.parseInt(value, 16);
      return {
        r: (n >> 16) & 255,
        g: (n >> 8) & 255,
        b: n & 255
      };
    };

    const drawLogoMark = (cx, cy, scale, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#e3bb45";
      ctx.fillStyle = "#e3bb45";
      ctx.lineWidth = 10 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(cx - 44 * scale, cy - 28 * scale, 28 * scale, 42 * scale, -0.35, 0, Math.PI * 2);
      ctx.ellipse(cx + 44 * scale, cy - 28 * scale, 28 * scale, 42 * scale, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 30 * scale, cy + 2 * scale);
      ctx.quadraticCurveTo(cx - 16 * scale, cy + 50 * scale, cx, cy + 64 * scale);
      ctx.quadraticCurveTo(cx + 16 * scale, cy + 50 * scale, cx + 30 * scale, cy + 2 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 72 * scale, 22 * scale, 16 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawLedCampaign = (t) => {
      const w = ledCanvas.width;
      const h = ledCanvas.height;
      const rgb = hexToRgb(campaignColor);
      const pulse = reduceMotion ? 0.5 : (Math.sin(t * 1.55) + 1) / 2;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#061c45");
      bg.addColorStop(0.48, "#0a3b79");
      bg.addColorStop(1, campaignColor);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) {
        const offset = ((t * (80 + i * 22)) % (w + 500)) - 250;
        ctx.strokeStyle = `rgba(227,187,69,${0.22 + i * 0.07})`;
        ctx.lineWidth = 7 + i * 5;
        ctx.beginPath();
        ctx.moveTo(offset - 320, h * (0.78 - i * 0.08));
        ctx.bezierCurveTo(offset + 160, h * 0.18, offset + 650, h * 0.95, offset + 1050, h * (0.2 + i * 0.04));
        ctx.stroke();
      }

      particles.forEach((p, i) => {
        const x = reduceMotion ? p.x : (p.x + t * (18 + (i % 7) * 4)) % w;
        const y = p.y + Math.sin(t * 0.9 + p.phase) * 22;
        ctx.fillStyle = `rgba(255,220,105,${0.28 + ((i % 5) / 10)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";

      let title = "SVU";
      let subtitle = "SOCIEDAD VENEZOLANA DE UROLOGÍA";
      let kicker = "CONGRESO 2027";
      if (motionMode === "welcome") {
        title = "BIENVENIDOS";
        subtitle = "AL CONGRESO VENEZOLANO DE UROLOGÍA";
        kicker = "SVU 2027";
      } else if (motionMode === "sponsor") {
        title = "SU MARCA × SVU";
        subtitle = "UNA EXPERIENCIA DE ALTO IMPACTO";
        kicker = "IMMERSIVE ENTRANCE";
      }

      const intro = reduceMotion ? 1 : Math.min(1, ((t * 0.55) % 5) / 1.1);
      const logoScale = 0.88 + pulse * 0.05;
      const logoAlpha = 0.82 + pulse * 0.18;

      drawLogoMark(250, 330, logoScale, logoAlpha);

      ctx.save();
      ctx.globalAlpha = intro;
      ctx.fillStyle = "#ffffff";
      ctx.font = motionMode === "welcome" ? "900 82px Arial" : "900 118px Arial";
      ctx.fillText(title, 390, 322);
      ctx.fillStyle = "rgba(255,255,255,.88)";
      ctx.font = "700 31px Arial";
      ctx.fillText(subtitle, 394, 374);
      ctx.fillStyle = "#e3bb45";
      ctx.font = "800 24px Arial";
      ctx.fillText(kicker, 394, 418);
      ctx.restore();

      // Pixel matrix cue.
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},.18)`;
      for (let x = 0; x < w; x += 54) {
        ctx.fillRect(x, 0, 1, h);
      }

      ledTexture.needsUpdate = true;
    };

    // Optional official logo overlay inside the ballroom screen.
    try {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(
        "https://soveuro.org/assets/images/logo-svu.png",
        (logoTexture) => {
          logoTexture.colorSpace = THREE.SRGBColorSpace;
          const logoPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(2.15, 1.05),
            new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true, depthWrite: false })
          );
          logoPlane.position.set(0, 3.05, -21.86);
          corridor.add(logoPlane);
        },
        undefined,
        () => {}
      );
    } catch {}

    let dragging = false;
    let previousX = 0;
    let dragOffsetX = 0;

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      previousX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointerup", (event) => {
      dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointerleave", () => { dragging = false; });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = event.clientX - previousX;
      dragOffsetX = THREE.MathUtils.clamp(dragOffsetX - delta * 0.012, -1.35, 1.35);
      previousX = event.clientX;
    });

    $$(".motion-mode").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".motion-mode").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        motionMode = button.dataset.motion || "institutional";
      });
    });

    $$(".camera-mode").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".camera-mode").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        activeCameraView = button.dataset.camera || "entrance";
        desiredCameraPos.copy(cameraViews[activeCameraView].pos);
        desiredLook.copy(cameraViews[activeCameraView].look);
        dragOffsetX = 0;
      });
    });

    $$(".theme-dot").forEach((button) => {
      button.addEventListener("click", () => {
        campaignColor = button.dataset.color || "#0b4fa8";
        const c = new THREE.Color(campaignColor);
        blueFill.color.copy(c);
        ledMaterial.emissive.copy(c).multiplyScalar(0.44);
      });
    });

    $("#brightness")?.addEventListener("input", (event) => {
      ledIntensity = Number(event.target.value);
      ledMaterial.emissiveIntensity = ledIntensity;
    });

    let lastLedDraw = -1;
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (reduceMotion || t - lastLedDraw > 1 / 24) {
        drawLedCampaign(t);
        lastLedDraw = t;
      }

      const targetPos = desiredCameraPos.clone();
      targetPos.x += dragOffsetX;
      camera.position.lerp(targetPos, reduceMotion ? 1 : 0.055);
      currentLook.lerp(desiredLook, reduceMotion ? 1 : 0.06);
      camera.lookAt(currentLook);

      if (!reduceMotion) {
        const subtle = Math.sin(t * 0.55) * 0.018;
        corridor.rotation.y = subtle;
      }

      renderer.render(scene, camera);
    };
    drawLedCampaign(0);
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