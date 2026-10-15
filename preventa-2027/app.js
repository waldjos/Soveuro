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
    button.addEventListener("click", () => openModal());
  });

  $(".modal-close")?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("show")) closeModal();
  });

  // Progress bar.
  const progress = $("#progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, value))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Inventory tabs.
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((item) => item.classList.remove("active"));
      $$(".inventory-panel").forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document
        .querySelector(`[data-panel="${tab.dataset.tab}"]`)
        ?.classList.add("active");
    });
  });

  // App ad simulation.
  const banner = $("#appBanner");
  const bannerTitle = $("#bannerTitle");
  $$(".segment").forEach((segment) => {
    segment.addEventListener("click", () => {
      $$(".segment").forEach((item) => item.classList.remove("active"));
      segment.classList.add("active");
      if (bannerTitle) bannerTitle.textContent = segment.dataset.title || "";
      if (banner) banner.style.background = segment.dataset.color || "#f4d21f";
    });
  });

  // Venue explorer.
  const zones = $$(".zone");
  const zoneTitle = $("#zoneTitle");
  const zoneDescription = $("#zoneDescription");
  zones.forEach((zone) => {
    zone.addEventListener("click", () => {
      zones.forEach((item) => item.classList.remove("active"));
      zone.classList.add("active");
      if (zoneTitle) zoneTitle.textContent = zone.dataset.name || "";
      if (zoneDescription) zoneDescription.textContent = zone.dataset.desc || "";
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
      text: "Diseñado para presentar una novedad con demostración, educación y alta frecuencia de marca.",
      items: ["Stand Oro", "Immersive Entrance", "Simposio patrocinado", "App Takeover", "Sponsored Push"]
    },
    leads: {
      title: "Lead Generation",
      text: "Convierte el tráfico físico y digital en oportunidades de contacto medibles.",
      items: ["Stand comercial", "QR / NFC", "Lead Capture", "Exhibitor Profile", "Sponsor Impact Report"]
    },
    education: {
      title: "Autoridad científica",
      text: "Prioriza educación médica, contenido y asociación con el programa científico.",
      items: ["Simposio patrocinado", "Taller precongreso", "Sesión científica", "Programa digital"]
    },
    networking: {
      title: "Relacionamiento premium",
      text: "Crea oportunidades de conversación y experiencia alrededor de momentos sociales de alto valor.",
      items: ["Hospitality Room", "Coffee Break", "Cóctel de bienvenida", "Exhibitor Profile"]
    }
  };

  const renderPlan = (key) => {
    const plan = plans[key] || plans.visibility;
    const title = $("#planTitle");
    const text = $("#planText");
    const items = $("#planItems");

    if (title) title.textContent = plan.title;
    if (text) text.textContent = plan.text;
    if (items) {
      items.innerHTML = plan.items
        .map((item, index) => `<div class="plan-chip"><span>${item}</span><span>0${index + 1}</span></div>`)
        .join("");
    }
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
    const activeGoal = $(".goal.active");
    const key = activeGoal?.dataset.goal || "visibility";
    const plan = plans[key];
    openModal(plan.items[0] || "");
  });

  // Lead summary, without pretending it has been transmitted.
  $("#leadForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
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

    if (requestSummary) requestSummary.textContent = summary;
    if (requestResult) requestResult.hidden = false;

    requestResult?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("#copyRequest")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const text = requestSummary?.textContent || "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const old = button.textContent;
      button.textContent = "Solicitud copiada ✓";
      setTimeout(() => (button.textContent = old), 1600);
    } catch {
      const range = document.createRange();
      if (requestSummary) {
        range.selectNodeContents(requestSummary);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  });

  // GSAP / ScrollTrigger.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-copy > *", {
      opacity: 0,
      y: 24,
      duration: 0.9,
      stagger: 0.08,
      ease: "power3.out"
    });

    gsap.from(".stage-card", {
      opacity: 0,
      scale: 0.94,
      rotateY: -6,
      duration: 1.2,
      delay: 0.15,
      ease: "power3.out"
    });

    $$(".reveal").forEach((element) => {
      if (element.closest(".hero")) return;
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 86%",
          once: true
        },
        opacity: 0,
        y: 34,
        duration: 0.85,
        ease: "power3.out"
      });
    });

    gsap.to(".hero-glow", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  // Three.js immersive entrance.
  const canvas = $("#tunnelCanvas");
  if (canvas && window.THREE) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020202");

    const camera = new THREE.PerspectiveCamera(
      44,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(8.8, 5.4, 10.8);
    camera.lookAt(0, 2.1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambient = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0xf4d21f, 24, 35);
    keyLight.position.set(1.2, 4.2, 1.5);
    scene.add(keyLight);

    const tunnel = new THREE.Group();
    scene.add(tunnel);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(9, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.08 })
    );
    floor.position.y = -0.1;
    tunnel.add(floor);

    const adCanvas = document.createElement("canvas");
    adCanvas.width = 1024;
    adCanvas.height = 1024;
    const ctx = adCanvas.getContext("2d");
    const adTexture = new THREE.CanvasTexture(adCanvas);
    adTexture.colorSpace = THREE.SRGBColorSpace;

    let campaignColor = "#f4d21f";

    const ledMaterial = new THREE.MeshStandardMaterial({
      map: adTexture,
      emissiveMap: adTexture,
      emissive: new THREE.Color(campaignColor),
      emissiveIntensity: 1.15,
      roughness: 0.28,
      metalness: 0.05
    });

    const drawCampaign = () => {
      const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
      gradient.addColorStop(0, "#050505");
      gradient.addColorStop(0.62, "#111111");
      gradient.addColorStop(1, campaignColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.strokeStyle = "rgba(255,255,255,.08)";
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

      ctx.fillStyle = campaignColor;
      ctx.font = "900 118px Arial";
      ctx.fillText("2027", 66, 245);

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 46px Arial";
      ctx.fillText("YOUR BRAND", 66, 760);

      ctx.font = "30px Arial";
      ctx.fillText("IMMERSIVE ENTRANCE", 66, 815);

      adTexture.needsUpdate = true;
    };

    const leftScreen = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.75, 9.2), ledMaterial);
    leftScreen.position.set(-3.15, 2.45, 0);
    tunnel.add(leftScreen);

    const ceilingScreen = new THREE.Mesh(new THREE.BoxGeometry(6.35, 0.18, 9.2), ledMaterial);
    ceilingScreen.position.set(0, 4.76, 0);
    tunnel.add(ceilingScreen);

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.45,
      metalness: 0.28
    });

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.75, 9.2), darkMaterial);
    rightWall.position.set(3.15, 2.45, 0);
    tunnel.add(rightWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(6.45, 4.9, 0.18), darkMaterial);
    backWall.position.set(0, 2.4, -4.62);
    tunnel.add(backWall);

    const opening = new THREE.Mesh(
      new THREE.BoxGeometry(5.15, 3.75, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x020202 })
    );
    opening.position.set(0, 1.9, -4.74);
    tunnel.add(opening);

    for (let i = -4; i <= 4; i += 1.15) {
      const guide = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.035, 0.48),
        new THREE.MeshBasicMaterial({ color: 0xf4d21f })
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

    canvas.addEventListener("pointerleave", () => {
      dragging = false;
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = event.clientX - previousX;
      tunnel.rotation.y += delta * 0.005;
      previousX = event.clientX;
    });

    $$(".theme-dot").forEach((button) => {
      button.addEventListener("click", () => {
        campaignColor = button.dataset.color || "#f4d21f";
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

    const resizeThree = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", resizeThree);
  }
})();