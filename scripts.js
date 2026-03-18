let autoScrollInterval = null;
const root = document.documentElement;

function activateOnKey(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
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
  initializeTabCards();
  updateScreenFocusability();
  updateScrollHeight();
});
