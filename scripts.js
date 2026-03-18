let autoScrollInterval = null;
const root = document.documentElement;

function activateOnKey(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function initializeDesktopVfx() {
  const isDesktopPointer = window.matchMedia(
    "(pointer: fine) and (hover: hover)",
  ).matches;

  if (!isDesktopPointer) return;

  const vfxLayer = document.createElement("div");
  vfxLayer.className = "desktop-vfx";

  const particlesCanvas = document.createElement("canvas");
  particlesCanvas.className = "particles-layer";
  particlesCanvas.setAttribute("aria-hidden", "true");

  const rx7Sprite = document.createElement("img");
  rx7Sprite.className = "cursor-rx7";
  rx7Sprite.src = "assets/rx7.png";
  rx7Sprite.alt = "";
  rx7Sprite.setAttribute("aria-hidden", "true");

  vfxLayer.appendChild(particlesCanvas);
  vfxLayer.appendChild(rx7Sprite);
  document.body.appendChild(vfxLayer);

  const ctx = particlesCanvas.getContext("2d");
  if (!ctx) return;

  const mouseTarget = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
  };
  const cursorState = {
    x: mouseTarget.x,
    y: mouseTarget.y,
  };
  const cursorLag = {
    x: mouseTarget.x,
    y: mouseTarget.y,
  };
  const lastCursor = {
    x: mouseTarget.x,
    y: mouseTarget.y,
  };
  const dragTarget = {
    x: mouseTarget.x,
    y: mouseTarget.y,
  };
  const anchorOffset = {
    x: 70,
    y: 35,
  };
  const rx7State = {
    x: window.innerWidth * 0.55,
    y: window.innerHeight * 0.6,
    vx: 0,
    vy: 0,
  };
  const rx7BaseOpacity = 0.85;
  const rx7FadedOpacity = 0.32;
  let rx7CurrentOpacity = rx7BaseOpacity;
  let rx7TargetOpacity = rx7BaseOpacity;

  let width = 0;
  let height = 0;
  let animationId = null;
  const particleCount = Math.min(
    120,
    Math.max(55, Math.floor(window.innerWidth / 16)),
  );
  const particles = [];

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    particlesCanvas.width = width;
    particlesCanvas.height = height;

    if (particles.length === 0) {
      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: random(0, width),
          y: random(0, height),
          vx: random(-0.26, 0.26),
          vy: random(-0.18, 0.18),
          size: random(0.8, 2.6),
          alpha: random(0.18, 0.58),
        });
      }
    }
  }

  function updateCursorTarget(event) {
    cursorState.x = event.clientX;
    cursorState.y = event.clientY;
  }

  function initializeReadabilityFadeZones() {
    const fadeZones = document.querySelectorAll(
      "#about .bio_container, #experience .experience_container",
    );

    fadeZones.forEach((zone) => {
      zone.addEventListener("mouseenter", () => {
        rx7TargetOpacity = rx7FadedOpacity;
      });

      zone.addEventListener("mouseleave", () => {
        rx7TargetOpacity = rx7BaseOpacity;
      });

      zone.addEventListener("focusin", () => {
        rx7TargetOpacity = rx7FadedOpacity;
      });

      zone.addEventListener("focusout", () => {
        rx7TargetOpacity = rx7BaseOpacity;
      });
    });
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();
    }
  }

  function animateRx7() {
    const cursorFollow = 0.08;
    cursorLag.x += (cursorState.x - cursorLag.x) * cursorFollow;
    cursorLag.y += (cursorState.y - cursorLag.y) * cursorFollow;

    const cursorDx = cursorState.x - lastCursor.x;
    const cursorDy = cursorState.y - lastCursor.y;
    const cursorSpeed = Math.hypot(cursorDx, cursorDy);
    lastCursor.x = cursorState.x;
    lastCursor.y = cursorState.y;

    anchorOffset.x += cursorDx * 0.22;
    anchorOffset.y += cursorDy * 0.22;

    const maxOffsetX = 140;
    const maxOffsetY = 95;
    anchorOffset.x = Math.max(
      -maxOffsetX,
      Math.min(maxOffsetX, anchorOffset.x),
    );
    anchorOffset.y = Math.max(
      -maxOffsetY,
      Math.min(maxOffsetY, anchorOffset.y),
    );

    anchorOffset.x *= 0.93;
    anchorOffset.y *= 0.93;

    const idleFloatX = Math.sin(Date.now() * 0.0009) * 8;
    const idleFloatY = Math.cos(Date.now() * 0.0011) * 10;

    mouseTarget.x = cursorLag.x + anchorOffset.x + idleFloatX;
    mouseTarget.y = cursorLag.y + anchorOffset.y + idleFloatY;

    const targetLag = 0.045;
    dragTarget.x += (mouseTarget.x - dragTarget.x) * targetLag;
    dragTarget.y += (mouseTarget.y - dragTarget.y) * targetLag;

    const spring = 0.012;
    const damping = 0.94;

    rx7State.vx += (dragTarget.x - rx7State.x) * spring;
    rx7State.vy += (dragTarget.y - rx7State.y) * spring;
    rx7State.vx *= damping;
    rx7State.vy *= damping;

    rx7State.x += rx7State.vx;
    rx7State.y += rx7State.vy;

    const rotation = Math.max(-11, Math.min(11, rx7State.vx * 0.9));
    const bob = Math.sin(Date.now() * 0.0018) * 6;

    rx7CurrentOpacity += (rx7TargetOpacity - rx7CurrentOpacity) * 0.08;

    rx7Sprite.style.transform = `translate(${rx7State.x}px, ${rx7State.y + bob}px) translate(-50%, -50%) rotate(${rotation}deg)`;
    rx7Sprite.style.opacity = String(rx7CurrentOpacity);
  }

  function loop() {
    animateParticles();
    animateRx7();
    animationId = requestAnimationFrame(loop);
  }

  resizeCanvas();
  initializeReadabilityFadeZones();

  window.addEventListener("mousemove", updateCursorTarget, { passive: true });
  window.addEventListener("resize", resizeCanvas);

  animationId = requestAnimationFrame(loop);

  // Graceful cleanup if this function ever runs in a dynamic mount context.
  window.addEventListener("beforeunload", () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
}

function getFocusableElements(container) {
  return container.querySelectorAll(
    "a[href], button, input, select, textarea, [tabindex]",
  );
}

function updateScreenFocusability() {
  screens.forEach((screen) => {
    const isActive = screen.classList.contains("active");
    screen.setAttribute("aria-hidden", isActive ? "false" : "true");

    getFocusableElements(screen).forEach((element) => {
      if (isActive) {
        if (element.dataset.prevTabindex !== undefined) {
          if (element.dataset.prevTabindex === "") {
            element.removeAttribute("tabindex");
          } else {
            element.setAttribute("tabindex", element.dataset.prevTabindex);
          }
          delete element.dataset.prevTabindex;
        }
      } else if (element.dataset.prevTabindex === undefined) {
        element.dataset.prevTabindex = element.getAttribute("tabindex") || "";
        element.setAttribute("tabindex", "-1");
      }
    });
  });
}

function initializeTabCards() {
  const tabCards = document.querySelectorAll(
    ".role, .live_project_card, .project_card",
  );

  tabCards.forEach((card) => {
    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }

    if (!card.hasAttribute("aria-label")) {
      const title = card.querySelector(".place_name, .project_title");
      const label = title ? title.textContent.trim() : "Content card";
      card.setAttribute("aria-label", label);
    }

    card.addEventListener("focus", () => {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    cancelAnimationFrame(autoScrollInterval);
    autoScrollInterval = null;
  }
}

// adjust page height based on active tab content
function updateScrollHeight() {
  const activeScreen = document.querySelector(".content_screen.active");
  const secondFold = document.querySelector(".second-fold");

  if (activeScreen && secondFold) {
    const contentHeight = activeScreen.offsetHeight;
    const navbarHeight = 150;
    secondFold.style.minHeight = `${contentHeight + navbarHeight + 500}px`;
  }
}

//Scroll Animation
function smoothScrollTo(targetY, duration) {
  stopAutoScroll();
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTimestamp = null;

  function step(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = timestamp - startTimestamp;
    const percentage = Math.min(progress / duration, 1);

    const easing = 1 - Math.pow(1 - percentage, 3);
    window.scrollTo(0, startY + distance * easing);

    if (progress < duration) {
      autoScrollInterval = requestAnimationFrame(step);
    } else {
      autoScrollInterval = null;
    }
  }
  autoScrollInterval = requestAnimationFrame(step);
}

window.addEventListener("wheel", stopAutoScroll, { passive: true });
window.addEventListener("touchmove", stopAutoScroll, { passive: true });
window.addEventListener("resize", updateScrollHeight);

const continueBtn = document.querySelector(".continue_prompt_container");
if (continueBtn) {
  const goToContent = () => smoothScrollTo(window.innerHeight, 2000);
  continueBtn.addEventListener("click", goToContent);
  continueBtn.addEventListener("keydown", (event) =>
    activateOnKey(event, goToContent),
  );
}

const logoBtn = document.getElementById("back_to_top");
if (logoBtn) {
  const goToTop = () => smoothScrollTo(0, 2000);
  logoBtn.addEventListener("click", goToTop);
  logoBtn.addEventListener("keydown", (event) => activateOnKey(event, goToTop));
}

// Opacity and Lights
window.addEventListener("scroll", () => {
  const scrollFraction = Math.min(window.scrollY / window.innerHeight, 1);

  const newDarkness = 0.5 + scrollFraction * 0.3;
  root.style.setProperty("--scroll-opacity", newDarkness);

  const glowTrigger = scrollFraction;
  root.style.setProperty("--glow-opacity", glowTrigger);

  const continueBtnContainer = document.querySelector(
    ".continue_prompt_container",
  );
  continueBtnContainer.style.opacity = 1 - scrollFraction * 2;
});

// Social Links Animation
const socialLinks = document.querySelectorAll(".socials a");
socialLinks.forEach((link, index) => {
  link.style.animationDelay = `${index * 0.2}s`;
  link.classList.add("animate");
});

// Dynamic Content Box
const navItems = document.querySelectorAll(".nav_item");
const screens = document.querySelectorAll(".content_screen");

function setActiveSection(item, targetId) {
  if (!targetId) return;

  navItems.forEach((nav) => {
    nav.classList.remove("active");
    nav.removeAttribute("aria-current");
  });

  screens.forEach((screen) => {
    screen.classList.remove("active");
    screen.setAttribute("aria-hidden", "true");
  });

  item.classList.add("active");
  item.setAttribute("aria-current", "page");

  const targetScreen = document.getElementById(targetId.toLowerCase());
  if (targetScreen) {
    targetScreen.classList.add("active");

    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });

    updateScreenFocusability();
    setTimeout(updateScrollHeight, 50);
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const targetId = item.getAttribute("data-target");
    setActiveSection(item, targetId);
  });

  item.addEventListener("keydown", (event) => {
    const currentIndex = Array.from(navItems).indexOf(item);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % navItems.length;
      navItems[nextIndex].focus();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const previousIndex =
        (currentIndex - 1 + navItems.length) % navItems.length;
      navItems[previousIndex].focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      navItems[0].focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      navItems[navItems.length - 1].focus();
      return;
    }

    const targetId = item.getAttribute("data-target");
    activateOnKey(event, () => setActiveSection(item, targetId));
  });

  item.addEventListener("focus", () => {
    const targetId = item.getAttribute("data-target");
    setActiveSection(item, targetId);
  });
});

window.addEventListener("load", () => {
  initializeDesktopVfx();
  initializeTabCards();
  updateScreenFocusability();
  updateScrollHeight();
});
