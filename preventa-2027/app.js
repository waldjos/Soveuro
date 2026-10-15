(() => {
  const modal = document.querySelector("#contactModal");
  const closeModal = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  };
  const openModal = () => {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  };

  document.querySelectorAll(".openModal").forEach((button) => {
    button.addEventListener("click", openModal);
  });

  document.querySelector(".modal-close")?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("show")) closeModal();
  });

  const interest = document.querySelector("#interest");
  document.querySelectorAll(".sponsor-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".sponsor-card").forEach((item) => item.classList.remove("selected"));
      card.classList.add("selected");
      if (interest) {
        const option = [...interest.options].find((item) => item.text === card.dataset.product);
        if (option) interest.value = option.value;
      }
      window.setTimeout(openModal, 160);
    });
  });

  const banner = document.querySelector("#appBanner");
  const bannerTitle = document.querySelector("#bannerTitle");
  document.querySelectorAll(".segment").forEach((segment) => {
    segment.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      segment.classList.add("active");
      if (bannerTitle) bannerTitle.textContent = segment.dataset.title;
      if (banner) banner.style.background = segment.dataset.color;
    });
  });

  const zones = document.querySelectorAll(".zone");
  const zoneTitle = document.querySelector("#zoneTitle");
  const zoneDescription = document.querySelector("#zoneDescription");

  zones.forEach((zone) => {
    zone.addEventListener("click", () => {
      zones.forEach((item) => item.classList.remove("active"));
      zone.classList.add("active");
      if (zoneTitle) zoneTitle.textContent = zone.dataset.name;
      if (zoneDescription) zoneDescription.textContent = zone.dataset.desc;
    });
  });

  const canvas = document.querySelector("#tunnelCanvas");

  if (canvas && window.THREE) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020403");

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(8, 5, 10);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const mainLight = new THREE.PointLight(0xe7ff22, 25, 30);
    mainLight.position.set(1, 4, 1);
    scene.add(mainLight);

    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111713,
      roughness: 0.75,
    });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.18, 12), floorMaterial);
    floor.position.y = -0.1;
    tunnelGroup.add(floor);

    const adCanvas = document.createElement("canvas");
    adCanvas.width = 1024;
    adCanvas.height = 1024;
    const ctx = adCanvas.getContext("2d");
    const adTexture = new THREE.CanvasTexture(adCanvas);
    adTexture.colorSpace = THREE.SRGBColorSpace;
    let campaignColor = "#e7ff22";

    const ledMaterial = new THREE.MeshStandardMaterial({
      map: adTexture,
      emissive: new THREE.Color(campaignColor),
      emissiveIntensity: 1.1,
      emissiveMap: adTexture,
    });

    const drawCampaign = () => {
      const gradient = ctx.createLinearGradient(0, 0, adCanvas.width, adCanvas.height);
      gradient.addColorStop(0, "#07110d");
      gradient.addColorStop(0.55, "#102518");
      gradient.addColorStop(1, campaignColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, adCanvas.width, adCanvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 58px Arial";
      ctx.fillText("SVU", 75, 110);

      ctx.fillStyle = campaignColor;
      ctx.font = "900 110px Arial";
      ctx.fillText("2027", 70, 250);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 46px Arial";
      ctx.fillText("YOUR BRAND", 70, 760);

      ctx.font = "32px Arial";
      ctx.fillText("Immersive Entrance", 70, 820);

      adTexture.needsUpdate = true;
    };

    const leftScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 4.7, 9),
      ledMaterial
    );
    leftScreen.position.set(-3.1, 2.45, 0);
    tunnelGroup.add(leftScreen);

    const topScreen = new THREE.Mesh(
      new THREE.BoxGeometry(6.3, 0.18, 9),
      ledMaterial
    );
    topScreen.position.set(0, 4.72, 0);
    tunnelGroup.add(topScreen);

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x111612,
      roughness: 0.45,
      metalness: 0.3,
    });

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 4.7, 9),
      darkMaterial
    );
    rightWall.position.set(3.1, 2.45, 0);
    tunnelGroup.add(rightWall);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 4.9, 0.2),
      darkMaterial
    );
    frame.position.set(0, 2.4, -4.5);
    tunnelGroup.add(frame);

    const entrance = new THREE.Mesh(
      new THREE.BoxGeometry(5, 3.8, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x020403 })
    );
    entrance.position.set(0, 1.9, -4.62);
    tunnelGroup.add(entrance);

    for (let i = -4; i <= 4; i += 1.15) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.04, 0.48),
        new THREE.MeshBasicMaterial({ color: 0xe7ff22 })
      );
      strip.position.set(0, 0.04, i);
      tunnelGroup.add(strip);
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
      tunnelGroup.rotation.y += delta * 0.005;
      previousX = event.clientX;
    });

    document.querySelectorAll(".theme-dot").forEach((button) => {
      button.addEventListener("click", () => {
        campaignColor = button.dataset.color;
        mainLight.color.set(campaignColor);
        ledMaterial.emissive.set(campaignColor);
        drawCampaign();
      });
    });

    document.querySelector("#brightness")?.addEventListener("input", (event) => {
      ledMaterial.emissiveIntensity = Number(event.target.value);
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.004;
      if (!dragging) tunnelGroup.rotation.y = Math.sin(time) * 0.08;
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

  document.querySelector("#leadForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    const original = submit.textContent;
    submit.disabled = true;
    submit.textContent = "Solicitud preparada ✓";

    window.setTimeout(() => {
      submit.disabled = false;
      submit.textContent = original;
      closeModal();
    }, 1100);
  });
})();
