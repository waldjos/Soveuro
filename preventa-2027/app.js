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

  // Shared commercial proposal state.
  const proposalSelections = [];
  const proposalItems = $("#proposalItems");
  const proposalFinalItems = $("#proposalFinalItems");
  const proposalEmpty = $("#proposalEmpty");
  const proposalFinalEmpty = $("#proposalFinalEmpty");
  const proposalCount = $("#proposalCount");
  const proposalSubtotal = $("#proposalSubtotal");
  const proposalFinalSubtotal = $("#proposalFinalSubtotal");
  const proposalState = $("#proposalState");

  const proposalMoney = (value) =>
    new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);

  const upsertProposalItem = (item) => {
    const existing = proposalSelections.findIndex((entry) => entry.id === item.id);
    if (existing >= 0) proposalSelections.splice(existing, 1, item);
    else proposalSelections.push(item);
    renderProposal();
  };

  const removeProposalItem = (id) => {
    const index = proposalSelections.findIndex((entry) => entry.id === id);
    if (index >= 0) proposalSelections.splice(index, 1);
    renderProposal();
  };

  const renderProposal = () => {
    const subtotal = proposalSelections.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const count = proposalSelections.length;
    if (proposalCount) proposalCount.textContent = `${count} ${count === 1 ? "activo" : "activos"}`;
    if (proposalSubtotal) proposalSubtotal.textContent = proposalMoney(subtotal);
    if (proposalFinalSubtotal) proposalFinalSubtotal.textContent = proposalMoney(subtotal);
    if (proposalState) proposalState.textContent = count ? "PROPUESTA ACTIVA" : "EN CONSTRUCCIÓN";
    if (proposalEmpty) proposalEmpty.hidden = count > 0;
    if (proposalFinalEmpty) proposalFinalEmpty.hidden = count > 0;

    const html = proposalSelections.map((item) => `
      <div class="proposal-item">
        <div>
          <strong>${item.label}</strong>
          <span>${item.note || item.source || "Activo comercial"}</span>
        </div>
        <div class="proposal-item-value">
          <b>${item.price ? proposalMoney(item.price) : "Por definir"}</b>
          <button type="button" class="proposal-remove" data-remove-proposal="${item.id}" aria-label="Quitar ${item.label}">×</button>
        </div>
      </div>
    `).join("");

    if (proposalItems) proposalItems.innerHTML = html;
    if (proposalFinalItems) proposalFinalItems.innerHTML = html;

    $("[data-remove-proposal]").forEach((button) => {
      button.addEventListener("click", () => removeProposalItem(button.dataset.removeProposal));
    });
  };

  renderProposal();

  // Module 01 · Commercial map + live pricing.
  const commercialTargets = $(".plan-zone, .stand-cluster");
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

      const stand = target.dataset.stand ? ` ${target.dataset.stand}` : "";
      selectedCommercialZone = `${target.dataset.zone || "Espacio"}${stand}`;

      if ($("#zoneTitle")) $("#zoneTitle").textContent = selectedCommercialZone;
      if ($("#zoneDescription")) $("#zoneDescription").textContent = target.dataset.desc || "";
      if ($("#zoneMeta")) $("#zoneMeta").textContent = target.dataset.meta || "Información por validar";

      if ((target.dataset.zone || "").toLowerCase().includes("stand") && standArea) {
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
    const spacePrice = area * rate;
    const wifiPrice = days * 1000;

    upsertProposalItem({
      id: "map-space",
      label: `${selectedCommercialZone} · ${area} m²`,
      note: `${proposalMoney(rate)} por m² · referencia preliminar`,
      price: spacePrice,
      source: "Mapa comercial"
    });

    upsertProposalItem({
      id: "wifi",
      label: `Patrocinio de la red Wi-Fi · ${days} ${days === 1 ? "día" : "días"}`,
      note: "Nombre de red y clave patrocinables",
      price: wifiPrice,
      source: "Mapa comercial"
    });

    if (selectionFeedback) {
      selectionFeedback.textContent =
        `✓ Agregado a la propuesta: ${selectedCommercialZone} (${money(spacePrice)}) + Wi-Fi (${money(wifiPrice)}).`;
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

  // Configurador de patrocinio conectado a la propuesta final.
  const plans = {
    visibility: {
      title: "Dominio de visibilidad",
      text: "Una combinación para maximizar presencia desde la entrada, los espacios físicos y el entorno digital.",
      items: ["Foyer o stand premium", "Entrada Inmersiva SVU", "Presencia destacada en la App", "Banner inteligente"]
    },
    launch: {
      title: "Lanzamiento integral",
      text: "Presentación de producto con demostración, ciencia y frecuencia de marca.",
      items: ["Stand comercial", "Entrada Inmersiva SVU", "Simposio patrocinado", "Presencia destacada en la App", "Notificación patrocinada"]
    },
    leads: {
      title: "Captación de contactos",
      text: "Convierte tráfico físico y digital en oportunidades de contacto medibles.",
      items: ["Stand comercial", "QR / NFC", "Captación de contactos", "Perfil comercial", "Informe de impacto"]
    },
    education: {
      title: "Autoridad científica",
      text: "Prioriza educación médica, contenido y asociación con el programa científico.",
      items: ["Simposio patrocinado", "Taller precongreso", "Sesión científica", "Programa digital"]
    },
    networking: {
      title: "Relacionamiento de alto valor",
      text: "Crea oportunidades de conversación alrededor de momentos sociales y de hospitalidad.",
      items: ["Sala de hospitalidad", "Pausa de café", "Cóctel de bienvenida", "Perfil comercial"]
    }
  };

  let activePlanKey = "visibility";

  const renderPlan = (key) => {
    activePlanKey = key;
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
    const plan = plans[activePlanKey] || plans.visibility;

    // Replace only configurator-derived items, preserving map selections.
    [...proposalSelections]
      .filter((item) => item.source === "Configurador")
      .forEach((item) => removeProposalItem(item.id));

    plan.items.forEach((label, index) => {
      upsertProposalItem({
        id: `plan-${activePlanKey}-${index}`,
        label,
        note: `${plan.title} · valor sujeto a aprobación`,
        price: null,
        source: "Configurador"
      });
    });

    const button = $("#planCTA");
    if (button) {
      const original = "Agregar esta combinación a la propuesta";
      button.textContent = "Combinación agregada ✓";
      setTimeout(() => (button.textContent = original), 1500);
    }
    $("#proposalPreview")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("#copyProposal")?.addEventListener("click", async (event) => {
    const subtotal = proposalSelections.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const lines = [
      "PROPUESTA COMERCIAL PRELIMINAR · SVU 2027",
      "",
      ...proposalSelections.map((item) =>
        `• ${item.label} — ${item.price ? proposalMoney(item.price) : "Por definir"}`
      ),
      "",
      `Subtotal con valores conocidos: ${proposalMoney(subtotal)}`,
      "Nota: los activos sin tarifa aprobada no están incluidos en el subtotal. Disponibilidad y condiciones finales sujetas a validación de SVU."
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      const old = event.currentTarget.textContent;
      event.currentTarget.textContent = "Resumen copiado ✓";
      setTimeout(() => (event.currentTarget.textContent = old), 1400);
    } catch {}
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

  // Photo-based interactive arch: the scene stays fixed and only the three screens change.
  const archStage = $("#archPhotoStage");
  const archModeLabel = $("#archModeLabel");
  const archQr = $("#archQr");
  const archTopTitle = $("#archTopTitle");
  const archTopSubtitle = $("#archTopSubtitle");
  const archLeftTitle = $("#archLeftTitle");
  const archLeftSubtitle = $("#archLeftSubtitle");
  const archRightTitle = $("#archRightTitle");
  const archRightSubtitle = $("#archRightSubtitle");

  const archModes = {
    welcome: {
      label: "Bienvenida",
      topTitle: "BIENVENIDOS",
      topSubtitle: "SVU 2027",
      leftTitle: "SVU",
      leftSubtitle: "CONGRESO VENEZOLANO DE UROLOGÍA 2027",
      rightTitle: "SVU",
      rightSubtitle: "CIENCIA · CONEXIONES · IMPACTO",
      qr: false
    },
    institutional: {
      label: "Institucional",
      topTitle: "SOCIEDAD VENEZOLANA DE UROLOGÍA",
      topSubtitle: "CONGRESO 2027",
      leftTitle: "SVU",
      leftSubtitle: "DESDE 1940",
      rightTitle: "2027",
      rightSubtitle: "CARACAS · HOTEL EUROBUILDING",
      qr: false
    },
    sponsor: {
      label: "Patrocinante",
      topTitle: "SU MARCA × SVU 2027",
      topSubtitle: "PRESENCIA EN EL ACCESO PRINCIPAL",
      leftTitle: "SU MARCA",
      leftSubtitle: "CAMPAÑA DESTACADA",
      rightTitle: "PATROCINANTE",
      rightSubtitle: "VISIBILIDAD DE ALTO IMPACTO",
      qr: false
    },
    registration: {
      label: "Registro / QR",
      topTitle: "REGISTRO Y ACCESO",
      topSubtitle: "ESCANEE EL CÓDIGO PARA CONTINUAR",
      leftTitle: "QR",
      leftSubtitle: "REGÍSTRESE AQUÍ",
      rightTitle: "ACCESO",
      rightSubtitle: "VALIDACIÓN DIGITAL",
      qr: true
    },
    agenda: {
      label: "Agenda",
      topTitle: "PRÓXIMA ACTIVIDAD",
      topSubtitle: "PROGRAMA EN VIVO · CONSULTE SOVEURO APP",
      leftTitle: "AGENDA",
      leftSubtitle: "PRÓXIMA SESIÓN",
      rightTitle: "SVU 2027",
      rightSubtitle: "INFORMACIÓN EN TIEMPO REAL",
      qr: false
    }
  };

  let activeArchMode = "welcome";
  let archDemoTimers = [];
  let archDemoRunning = false;

  const applyArchMode = (mode) => {
    const config = archModes[mode] || archModes.welcome;
    activeArchMode = mode;

    if (archStage) {
      archStage.classList.add("mode-transition");
      archStage.dataset.mode = mode;
      setTimeout(() => archStage.classList.remove("mode-transition"), 280);
    }

    if (archModeLabel) archModeLabel.textContent = config.label;
    if (archTopTitle) archTopTitle.textContent = config.topTitle;
    if (archTopSubtitle) archTopSubtitle.textContent = config.topSubtitle;
    if (archLeftTitle) archLeftTitle.textContent = config.leftTitle;
    if (archLeftSubtitle) archLeftSubtitle.textContent = config.leftSubtitle;
    if (archRightTitle) archRightTitle.textContent = config.rightTitle;
    if (archRightSubtitle) archRightSubtitle.textContent = config.rightSubtitle;
    if (archQr) archQr.hidden = !config.qr;

    $$(".motion-mode").forEach((button) => {
      button.classList.toggle("active", button.dataset.motion === mode);
    });
  };

  $$(".motion-mode").forEach((button) => {
    button.addEventListener("click", () => applyArchMode(button.dataset.motion || "welcome"));
  });

  $$(".theme-dot").forEach((button) => {
    button.addEventListener("click", () => {
      const color = button.dataset.color || "#0b4fa8";
      archStage?.style.setProperty("--arch-campaign", color);
      $$(".theme-dot").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  const demoButton = $("#startTunnelDemo");
  const demoStatus = $("#demoStatus");
  const demoSteps = $$(".demo-timeline [data-step]");

  const setArchDemoStep = (step) => {
    demoSteps.forEach((item, index) => item.classList.toggle("active", index === step));
  };

  const stopArchDemo = (finished = false) => {
    archDemoTimers.forEach(clearTimeout);
    archDemoTimers = [];
    archDemoRunning = false;
    if (demoButton) demoButton.textContent = "▶ Iniciar demostración automática";
    if (demoStatus) {
      demoStatus.textContent = finished
        ? "Demostración finalizada · puede repetirla o cambiar los contenidos manualmente."
        : "Demostración detenida · los controles manuales siguen disponibles.";
    }
  };

  const scheduleArchDemo = (delay, fn) => {
    archDemoTimers.push(setTimeout(fn, delay));
  };

  const startArchDemo = () => {
    if (archDemoRunning) {
      stopArchDemo(false);
      return;
    }

    archDemoRunning = true;
    if (demoButton) demoButton.textContent = "■ Detener demostración";
    if (demoStatus) demoStatus.textContent = "Demostración en curso · bienvenida → institucional → patrocinante → registro → agenda.";

    const sequence = [
      ["welcome", 0],
      ["institutional", 3200],
      ["sponsor", 6500],
      ["registration", 9800],
      ["agenda", 13200]
    ];

    sequence.forEach(([mode, delay], index) => {
      scheduleArchDemo(delay, () => {
        setArchDemoStep(index);
        applyArchMode(mode);
      });
    });

    scheduleArchDemo(17000, () => stopArchDemo(true));
  };

  demoButton?.addEventListener("click", startArchDemo);

  applyArchMode("welcome");
})();