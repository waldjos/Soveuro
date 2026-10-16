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

  // Interactive digital entrance arch based on the real access reference.
  const canvas = $("#tunnelCanvas");
  const archStage = canvas?.closest(".arch-stage");
  const fallback = $("#tunnelFallback");

  const setFallbackMode = (mode) => {
    if (!fallback) return;
    fallback.dataset.mode = mode;
    const left = $(".arch-fallback-left-screen", fallback);
    const top = $(".arch-fallback-top-screen", fallback);
    const right = $(".arch-fallback-right-screen", fallback);

    const content = {
      institutional: {
        top: "SVU · CONGRESO 2027",
        left: ["SVU", "SOCIEDAD VENEZOLANA DE UROLOGÍA"],
        right: ["2027", "CIENCIA · CONEXIONES · IMPACTO"]
      },
      welcome: {
        top: "BIENVENIDOS AL CONGRESO VENEZOLANO DE UROLOGÍA",
        left: ["SVU", "BIENVENIDOS"],
        right: ["CARACAS", "HOTEL EUROBUILDING"]
      },
      sponsor: {
        top: "SU MARCA × SVU 2027",
        left: ["SU MARCA", "PRESENCIA DE ALTO IMPACTO"],
        right: ["PATROCINANTE", "ACCESO PRINCIPAL"]
      },
      registration: {
        top: "REGISTRO Y ACCESO · ESCANEE EL CÓDIGO",
        left: ["QR", "REGÍSTRESE AQUÍ"],
        right: ["ACCESO", "VALIDACIÓN DIGITAL"]
      },
      agenda: {
        top: "PRÓXIMA ACTIVIDAD · PROGRAMA EN VIVO",
        left: ["AGENDA", "PRÓXIMA SESIÓN"],
        right: ["SVU 2027", "CONSULTE LA APP"]
      }
    }[mode] || null;

    if (!content) return;
    if (top) top.innerHTML = `<strong>${content.top}</strong>`;
    if (left) left.innerHTML = `<b>${content.left[0]}</b><span>${content.left[1]}</span>`;
    if (right) right.innerHTML = `<b>${content.right[0]}</b><span>${content.right[1]}</span>`;
  };
  setFallbackMode("institutional");

  if (canvas && !window.THREE) {
    archStage?.classList.add("fallback-only");
    $("#demoStatus")?.replaceChildren(document.createTextNode("Modo visual compatible activo. La experiencia 3D completa requiere soporte WebGL."));
    $$(".motion-mode").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".motion-mode").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        setFallbackMode(button.dataset.motion || "institutional");
      });
    });
  }

  if (canvas && window.THREE) {
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d8d0c7");
    scene.fog = new THREE.Fog(0xd8d0c7, 16, 34);

    const camera = new THREE.PerspectiveCamera(
      48,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      80
    );

    const cameraViews = {
      front: { pos: new THREE.Vector3(0, 2.35, 10.8), look: new THREE.Vector3(0, 2.05, 0) },
      left: { pos: new THREE.Vector3(-5.6, 2.5, 7.0), look: new THREE.Vector3(0, 2.0, 0) },
      inside: { pos: new THREE.Vector3(0.2, 2.2, 2.2), look: new THREE.Vector3(0, 2.0, -7.5) }
    };
    let activeView = "front";
    const desiredPos = cameraViews.front.pos.clone();
    const desiredLook = cameraViews.front.look.clone();
    const currentLook = desiredLook.clone();
    camera.position.copy(desiredPos);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.HemisphereLight(0xfff7ea, 0x364256, 2.5));
    const key = new THREE.DirectionalLight(0xffe1b4, 2.3);
    key.position.set(4, 8, 7);
    key.castShadow = true;
    scene.add(key);

    const portalLight = new THREE.PointLight(0x2c79d8, 13, 18, 1.8);
    portalLight.position.set(0, 3.2, 2.5);
    scene.add(portalLight);

    const warmHall = new THREE.PointLight(0xffd7a0, 9, 18, 2);
    warmHall.position.set(0, 3.6, -5.5);
    scene.add(warmHall);

    const group = new THREE.Group();
    scene.add(group);

    const marble = new THREE.MeshPhysicalMaterial({
      color: 0xd3ccc5,
      roughness: 0.26,
      metalness: 0.02,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2
    });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xc9c1b9, roughness: 0.72 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x393532, roughness: 0.28, metalness: 0.62 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xa9adb1, roughness: 0.2, metalness: 0.9 });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.12, 18), marble);
    floor.position.set(0, -0.08, -1.5);
    floor.receiveShadow = true;
    group.add(floor);

    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.15, 13), new THREE.MeshStandardMaterial({ color: 0xe7e1db, roughness: 0.7 }));
    ceiling.position.set(0, 4.55, -0.7);
    group.add(ceiling);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.6, 12), wallMat);
    leftWall.position.set(-6.6, 2.25, -0.8);
    group.add(leftWall);
    const rightWall = leftWall.clone();
    rightWall.position.x = 6.6;
    group.add(rightWall);

    // Recessed hotel ceiling lights.
    for (const x of [-4.8, -2.4, 0, 2.4, 4.8]) {
      for (const z of [3.8, 0.3, -3.2]) {
        const light = new THREE.PointLight(0xfff3d8, 2.8, 5.2, 2.2);
        light.position.set(x, 4.35, z);
        scene.add(light);
        const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 20), chromeMat);
        trim.rotation.x = Math.PI / 2;
        trim.position.set(x, 4.43, z);
        group.add(trim);
      }
    }

    const createScreenTexture = (kind) => {
      const c = document.createElement("canvas");
      c.width = kind === "top" ? 1600 : 620;
      c.height = kind === "top" ? 360 : 1200;
      const ctx = c.getContext("2d");
      const texture = new THREE.CanvasTexture(c);
      texture.colorSpace = THREE.SRGBColorSpace;
      return { canvas: c, ctx, texture };
    };

    const topScreen = createScreenTexture("top");
    const leftScreen = createScreenTexture("side");
    const rightScreen = createScreenTexture("side");
    let motionMode = "institutional";
    let campaignColor = "#0b4fa8";

    const paintScreen = (screen, title, subtitle, accent, vertical = false, qr = false) => {
      const { canvas:c, ctx } = screen;
      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, "#061f4d");
      g.addColorStop(0.58, campaignColor);
      g.addColorStop(1, "#092b5f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.9;
      for (let i=0;i<8;i++) {
        ctx.fillRect((i*193)%c.width, (i*137)%c.height, vertical?10:34, vertical?190:10);
      }
      ctx.globalAlpha = 1;

      if (qr) {
        const size = Math.min(c.width, c.height) * 0.42;
        const ox = (c.width-size)/2;
        const oy = vertical ? c.height*0.15 : (c.height-size)/2;
        ctx.fillStyle = "#fff";
        ctx.fillRect(ox-20,oy-20,size+40,size+40);
        ctx.fillStyle = "#071f4b";
        const cells = 17;
        const cell = size/cells;
        for(let y=0;y<cells;y++){
          for(let x=0;x<cells;x++){
            if(((x*7+y*11+x*y)%5)<2 || (x<4&&y<4) || (x>12&&y<4) || (x<4&&y>12)){
              ctx.fillRect(ox+x*cell,oy+y*cell,cell*0.9,cell*0.9);
            }
          }
        }
      }

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = vertical ? "900 58px Arial" : "900 70px Arial";
      ctx.fillText(title, c.width/2, vertical ? c.height*0.68 : c.height*0.47);
      ctx.fillStyle = accent;
      ctx.font = vertical ? "800 27px Arial" : "800 31px Arial";
      ctx.fillText(subtitle, c.width/2, vertical ? c.height*0.74 : c.height*0.62);
      screen.texture.needsUpdate = true;
    };

    const updateScreens = (mode) => {
      motionMode = mode;
      setFallbackMode(mode);
      const gold = "#e3bb45";
      if (mode === "welcome") {
        paintScreen(topScreen, "BIENVENIDOS · SVU 2027", "CONGRESO VENEZOLANO DE UROLOGÍA", gold, false);
        paintScreen(leftScreen, "BIENVENIDOS", "ACCESO AL CONGRESO", gold, true);
        paintScreen(rightScreen, "CARACAS", "HOTEL EUROBUILDING", gold, true);
      } else if (mode === "sponsor") {
        paintScreen(topScreen, "SU MARCA × SVU 2027", "PATROCINIO DEL ACCESO PRINCIPAL", gold, false);
        paintScreen(leftScreen, "SU MARCA", "ALTO IMPACTO", gold, true);
        paintScreen(rightScreen, "PATROCINANTE", "PRESENCIA PREMIUM", gold, true);
      } else if (mode === "registration") {
        paintScreen(topScreen, "REGISTRO Y ACCESO", "ESCANEE EL CÓDIGO PARA INGRESAR", gold, false);
        paintScreen(leftScreen, "QR", "REGÍSTRESE AQUÍ", gold, true, true);
        paintScreen(rightScreen, "ACCESO", "VALIDACIÓN DIGITAL", gold, true);
      } else if (mode === "agenda") {
        paintScreen(topScreen, "PRÓXIMA ACTIVIDAD", "PROGRAMA EN VIVO · CONSULTE SOVEURO APP", gold, false);
        paintScreen(leftScreen, "AGENDA", "PRÓXIMA SESIÓN", gold, true);
        paintScreen(rightScreen, "SVU 2027", "PROGRAMA EN VIVO", gold, true);
      } else {
        paintScreen(topScreen, "SVU 2027", "SOCIEDAD VENEZOLANA DE UROLOGÍA", gold, false);
        paintScreen(leftScreen, "SVU", "CIENCIA", gold, true);
        paintScreen(rightScreen, "2027", "CONEXIONES · IMPACTO", gold, true);
      }
    };

    const screenMaterial = (texture) => new THREE.MeshStandardMaterial({
      map:texture,
      emissiveMap:texture,
      emissive:new THREE.Color(0x0b4fa8),
      emissiveIntensity:1.2,
      roughness:0.16
    });

    // Portal frame inspired by the photographed entrance.
    const topFrame = new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.36, 0.42), frameMat);
    topFrame.position.set(0, 4.0, 0);
    group.add(topFrame);

    const leftColumn = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.1, 0.55), frameMat);
    leftColumn.position.set(-3.35, 2.0, 0);
    group.add(leftColumn);
    const rightColumn = leftColumn.clone();
    rightColumn.position.x = 3.35;
    group.add(rightColumn);

    const topDisplay = new THREE.Mesh(new THREE.PlaneGeometry(6.7, 1.02), screenMaterial(topScreen.texture));
    topDisplay.position.set(0, 3.55, 0.31);
    group.add(topDisplay);

    const leftDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 3.45), screenMaterial(leftScreen.texture));
    leftDisplay.position.set(-3.34, 2.0, 0.31);
    group.add(leftDisplay);
    const rightDisplay = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 3.45), screenMaterial(rightScreen.texture));
    rightDisplay.position.set(3.34, 2.0, 0.31);
    group.add(rightDisplay);

    // Open doorway and deeper commercial area.
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(11.5, 4.8, 0.2), new THREE.MeshStandardMaterial({ color:0xa99f96, roughness:0.7 }));
    backWall.position.set(0,2.35,-9.5);
    group.add(backWall);

    const innerFloor = new THREE.Mesh(new THREE.BoxGeometry(9.6,0.11,8.2), marble);
    innerFloor.position.set(0,-0.02,-5.3);
    group.add(innerFloor);

    // Registration table and people for scale.
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.68,0.68,0.08,28), chromeMat);
    tableTop.position.set(1.05,1.05,-1.8);
    group.add(tableTop);
    const tableStem = new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.16,1.05,18), chromeMat);
    tableStem.position.set(1.05,0.52,-1.8);
    group.add(tableStem);

    const humanMat = new THREE.MeshStandardMaterial({ color:0x243247, roughness:0.72 });
    const skinMat = new THREE.MeshStandardMaterial({ color:0xb9856d, roughness:0.82 });
    const addPerson=(x,z,s=1)=>{
      const p=new THREE.Group();
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.2*s,.29*s,1.25*s,14),humanMat);
      body.position.y=.9*s; p.add(body);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.2*s,16,12),skinMat);
      head.position.y=1.68*s; p.add(head);
      p.position.set(x,0,z); group.add(p);
    };
    addPerson(-1.15,-1.25,.9);
    addPerson(0,-2.2,.88);
    addPerson(2.1,-1.0,.92);

    // Queue stanchions.
    for (const x of [-2.1,2.1]) {
      for (const z of [1.0,-0.7]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,1.0,18), chromeMat);
        post.position.set(x,.5,z); group.add(post);
        const ball = new THREE.Mesh(new THREE.SphereGeometry(.11,14,10), chromeMat);
        ball.position.set(x,1.03,z); group.add(ball);
      }
    }

    updateScreens("institutional");

    $$(".motion-mode").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".motion-mode").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        updateScreens(button.dataset.motion || "institutional");
      });
    });

    $$(".camera-mode").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".camera-mode").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        activeView = button.dataset.camera || "front";
        desiredPos.copy(cameraViews[activeView].pos);
        desiredLook.copy(cameraViews[activeView].look);
      });
    });

    $$(".theme-dot").forEach((button) => {
      button.addEventListener("click", () => {
        campaignColor = button.dataset.color || "#0b4fa8";
        portalLight.color.set(campaignColor);
        updateScreens(motionMode);
      });
    });

    // Automatic sales demo.
    const demoButton = $("#startTunnelDemo");
    const demoStatus = $("#demoStatus");
    const demoSteps = $$(".demo-timeline [data-step]");
    let demoTimers = [];
    let demoRunning = false;

    const setStep = (step) => demoSteps.forEach((item,i)=>item.classList.toggle("active",i===step));
    const selectMotion = (mode) => document.querySelector(`.motion-mode[data-motion="${mode}"]`)?.click();
    const selectCamera = (mode) => document.querySelector(`.camera-mode[data-camera="${mode}"]`)?.click();

    const stopDemo = (finished=false) => {
      demoTimers.forEach(clearTimeout);
      demoTimers=[];
      demoRunning=false;
      if (demoButton) demoButton.textContent="▶ Iniciar demostración automática";
      if (demoStatus) demoStatus.textContent=finished
        ? "Demostración finalizada · puede repetirla o cambiar los contenidos manualmente."
        : "Demostración detenida · los controles manuales siguen disponibles.";
    };
    const later=(ms,fn)=>demoTimers.push(setTimeout(fn,ms));
    const startDemo=()=>{
      if(demoRunning){ stopDemo(false); return; }
      demoRunning=true;
      if(demoButton) demoButton.textContent="■ Detener demostración";
      if(demoStatus) demoStatus.textContent="Demostración en curso · institucional → bienvenida → patrocinante → registro → agenda.";

      setStep(0); selectMotion("institutional"); selectCamera("front");
      later(3200,()=>{setStep(1);selectMotion("welcome");selectCamera("front");});
      later(6500,()=>{setStep(2);selectMotion("sponsor");selectCamera("left");});
      later(9900,()=>{setStep(3);selectMotion("registration");selectCamera("front");});
      later(13300,()=>{setStep(4);selectMotion("agenda");selectCamera("inside");});
      later(17000,()=>stopDemo(true));
    };
    demoButton?.addEventListener("click",startDemo);

    let dragging=false, previousX=0, orbit=0;
    canvas.addEventListener("pointerdown",(e)=>{dragging=true;previousX=e.clientX;canvas.setPointerCapture?.(e.pointerId);});
    canvas.addEventListener("pointerup",(e)=>{dragging=false;canvas.releasePointerCapture?.(e.pointerId);});
    canvas.addEventListener("pointerleave",()=>dragging=false);
    canvas.addEventListener("pointermove",(e)=>{
      if(!dragging)return;
      orbit=THREE.MathUtils.clamp(orbit-(e.clientX-previousX)*0.012,-1.25,1.25);
      previousX=e.clientX;
    });

    const clock = new THREE.Clock();
    const animate=()=>{
      requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      const target=desiredPos.clone();
      target.x += orbit;
      camera.position.lerp(target,0.065);
      currentLook.lerp(desiredLook,0.07);
      camera.lookAt(currentLook);
      if (!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        group.rotation.y = Math.sin(t*.35)*.008;
      }
      renderer.render(scene,camera);
      archStage?.classList.add("three-ready");
    };
    animate();

    const resize=()=>{
      const w=Math.max(canvas.clientWidth,1), h=Math.max(canvas.clientHeight,1);
      camera.aspect=w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);
    };
    window.addEventListener("resize",resize);
  }
})();