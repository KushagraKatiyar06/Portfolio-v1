// ── Highlight helpers ─────────────────────────────────────────
const TECH_TERMS = [
  'Agentic AI', 'GPT-4o', 'GPT-2', 'Next.js 14', 'Next.js 15', 'React 19',
  'AWS Polly', 'Flux-Schnell', 'Socket.io', 'Gmail API', 'Google Sheets', 'Google Forms',
  'Google Cloud', 'Google Service Accounts', 'Launch Library 2',
  'DaVinci Resolve', 'MediaPipe', 'PostgreSQL', 'TypeScript', 'JavaScript',
  'Cloudflare', 'TensorFlow', 'Supabase', 'OAuth2', 'Android', 'AdobeXD',
  'ShadCN', 'Framer', 'Figma', 'Next.js', 'Node.js', 'OpenCV', 'OpenAI',
  'Gemini', 'Docker', 'Kotlin', 'Angular', 'Ionic', 'Pydantic',
  'Python', 'Flask', 'FFmpeg', 'Canva', 'Notion', 'Scrum', 'React',
  'GCP', 'AWS', 'LLM', 'RAG', 'OBS',
]

function hl(text) {
  // Numbers → orange; % numbers → golden
  let result = text.replace(
    /\$[\d,]+(?:\s*\u2192\s*\$[\d,]+)?|\b\d[\d,]*[×xX%+]|\b\d[\d,]*\b/g,
    m => {
      const clean = m.replace(/,/g, '')
      if (m.endsWith('%'))
        return `<span style="color:#ffd166;text-shadow:0 0 5px rgba(255,209,102,0.4)">${clean}</span>`
      return `<span style="color:#ff9361;text-shadow:0 0 6px rgba(255,147,97,0.4)">${clean}</span>`
    }
  )
  // Tech terms — only outside existing spans
  const parts = result.split(/(<span\b[^>]*>[\s\S]*?<\/span>)/g)
  return parts.map((part, i) => {
    if (i % 2 === 1) return part
    for (const term of TECH_TERMS) {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      part = part.replace(
        new RegExp(`\\b${esc}\\b`, 'g'),
        `<span style="color:#48bcff;text-shadow:0 0 6px rgba(72,188,255,0.35);font-style:italic">${term}</span>`
      )
    }
    return part
  }).join('')
}

const BIO_PHRASES = [
  { phrase: 'Computer Science at the University of Florida', color: '#ff9361' },
  { phrase: 'Agentic AI Systems',                           color: '#b187ff' },
  { phrase: 'Full Stack Development',                       color: '#48bcff' },
  { phrase: 'UI/UX Design',                                 color: '#ffd166' },
  { phrase: 'gaming, cars, and Taekwondo',                  color: '#7CFC98' },
  { phrase: 'flute',                                        color: '#7CFC98' },
]

function hlBio(text) {
  let parts = [{ text, hi: false }]
  for (const { phrase, color } of BIO_PHRASES) {
    const next = []
    for (const p of parts) {
      if (p.hi) { next.push(p); continue }
      const idx = p.text.indexOf(phrase)
      if (idx === -1) { next.push(p); continue }
      if (idx > 0) next.push({ text: p.text.slice(0, idx), hi: false })
      next.push({ text: phrase, hi: true, color })
      const rest = p.text.slice(idx + phrase.length)
      if (rest) next.push({ text: rest, hi: false })
    }
    parts = next
  }
  return parts.map(p =>
    p.hi
      ? `<span style="color:${p.color};text-shadow:0 0 8px ${p.color}88">${p.text}</span>`
      : p.text
  ).join('')
}

// ── Experience / Project group definitions ────────────────────
const EXP_GROUPS = [
  { key: 'experience',      label: 'Professional Experience', accent: '#48bcff' },
  { key: 'extracurricular', label: 'Extracurriculars',        accent: '#ffd166' },
  { key: 'leadership',      label: 'Leadership',              accent: '#b187ff' },
]

const PROJ_GROUPS = [
  { key: 'live',      label: 'Live',      accent: '#48bcff' },
  { key: 'technical', label: 'Technical', accent: '#b187ff' },
  { key: 'design',    label: 'Design',    accent: '#ffd166' },
]

// ── Sort: Present first, then by most-recent start date ───────
function sortExperiences(items) {
  const MONTHS = {
    January:1, February:2, March:3, April:4, May:5, June:6,
    July:7, August:8, September:9, October:10, November:11, December:12,
  }
  return [...items].sort((a, b) => {
    const aP = a.duration.includes('Present')
    const bP = b.duration.includes('Present')
    if (aP !== bP) return aP ? -1 : 1
    const parseDate = d => {
      const [start] = d.split(' \u2013 ')
      const [mo, yr] = start.trim().split(' ')
      return new Date(+yr, (MONTHS[mo] ?? 1) - 1)
    }
    const da = parseDate(a.duration)
    const db = parseDate(b.duration)
    if (da.getTime() !== db.getTime()) return db.getTime() - da.getTime()
    const order = { experience: 0, leadership: 1, extracurricular: 2 }
    return (order[a.type] ?? 3) - (order[b.type] ?? 3)
  })
}

// ── Build icon HTML ───────────────────────────────────────────
function buildIcons(stack, cls) {
  if (!stack || !stack.length) return ''
  return stack.map(({ label, icon }) =>
    `<div class="${cls}" data-label="${label}"><img src="${icon}" alt="" /></div>`
  ).join('')
}

// ── Build experience card DOM node ────────────────────────────
function buildExpCard(item, accent) {
  const div = document.createElement('div')
  div.className = 'role'
  const bullets = item.bullets.map(b => `• ${hl(b)}`).join('<br />')
  const stack = item.stack && item.stack.length
    ? `<div class="role_skills"><div class="tech_icons">${buildIcons(item.stack, 'icon_wrapper')}</div></div>`
    : ''
  div.innerHTML = `
    <div class="place_container">
      <div class="place_logo_container">
        <img class="place_logo" src="${item.logo}" alt="${item.org}" />
      </div>
      <div class="place_and_role">
        <p class="place_name">${item.org}</p>
        <p class="role_name">
          <span style="color:${accent};text-shadow:0 0 8px ${accent}88">${item.role}</span>
        </p>
      </div>
      <div class="duration_style">
        <p class="duration_text">${item.duration}</p>
        <p class="type_text">${item.location}</p>
      </div>
    </div>
    <p class="role_description">${bullets}</p>
    ${stack}
  `
  return div
}

// ── Build project card HTML string ───────────────────────────
function buildProjectCard(item, isLive) {
  const primaryLink = item.live || item.video || item.github || item.figma || item.drive || null
  const badge = item.badge
    ? `<div class="winner_badge">★ ${item.badge}</div>` : ''
  const img = item.image
    ? `<img class="project_image" src="${item.image}" alt="${item.name}" />` : ''
  const cardClass = isLive ? 'live_project_card' : 'project_card'
  const title = `${item.name}${item.subtitle ? ' \u2014 ' + item.subtitle : ''}`

  let meta = ''
  if (isLive) {
    const ghLink  = item.github ? `<a href="${item.github}" target="_blank" rel="noopener noreferrer" class="project_github_link" title="GitHub"><img src="assets/github_icon.svg" class="github_card_icon" alt="" /></a>` : ''
    const vidLink = item.video  ? `<a href="${item.video}"  target="_blank" rel="noopener noreferrer" class="project_video_link"  title="Video"> <img src="assets/video.svg"       class="video_card_icon"  alt="" /></a>` : ''
    const figLink = item.figma  ? `<a href="${item.figma}"  target="_blank" rel="noopener noreferrer" class="project_figma_link"  title="Figma"> <img src="assets/figma.svg"       class="figma_card_icon"  alt="" /></a>` : ''
    meta = `<div class="meta_row">${ghLink}${vidLink}${figLink}</div>`
  } else {
    const links = [
      item.github ? `<a href="${item.github}" target="_blank" rel="noopener noreferrer" class="project_github_link" title="GitHub"><img src="assets/github_icon.svg" class="github_card_icon" alt="" /></a>` : '',
      item.video  ? `<a href="${item.video}"  target="_blank" rel="noopener noreferrer" class="project_video_link"  title="Video"> <img src="assets/video.svg"       class="video_card_icon"  alt="" /></a>` : '',
      item.figma  ? `<a href="${item.figma}"  target="_blank" rel="noopener noreferrer" class="project_figma_link"  title="Figma"> <img src="assets/figma.svg"       class="figma_card_icon"  alt="" /></a>` : '',
      item.drive  ? `<a href="${item.drive}"  target="_blank" rel="noopener noreferrer" class="project_drive_link"  title="Drive"> <img src="assets/drive.svg"       class="drive_card_icon"  alt="" /></a>` : '',
    ].filter(Boolean).join('')
    meta = `<div class="meta_row">${links}</div>`
  }

  const techIcons = item.stack && item.stack.length
    ? `<div class="tech_icons_p">${buildIcons(item.stack, 'icon_wrapper_p')}</div>` : ''

  const wrapOpen  = primaryLink ? `<a href="${primaryLink}" target="_blank" rel="noopener noreferrer" class="card_link" title="Open project">` : '<div class="card_link">'
  const wrapClose = primaryLink ? '</a>' : '</div>'

  return `
    <div class="card_container">
      ${wrapOpen}
        <div class="${cardClass}">
          ${badge}
          ${img}
          <div class="project_info">
            <p class="project_title">${title}</p>
            ${meta}
            ${techIcons}
          </div>
        </div>
      ${wrapClose}
    </div>`
}

// ── Render bio from DB ────────────────────────────────────────
function renderBio() {
  const el = document.querySelector('.bio')
  if (el && window.portfolioData) {
    el.innerHTML = hlBio(window.portfolioData.profile.bio)
  }
}

// ── Render skills from DB ─────────────────────────────────────
function renderSkills() {
  const container = document.querySelector('.skills_container')
  if (!container || !window.portfolioData) return
  container.innerHTML = ''
  for (const [cat, items] of Object.entries(window.portfolioData.skills)) {
    const row = document.createElement('div')
    row.className = 'skills_inner_container'
    row.innerHTML = `
      <p class="tech_header">${cat}:</p>
      <div class="tech_icons">${buildIcons(items, 'icon_wrapper')}</div>
    `
    container.appendChild(row)
  }
}

// ── Experience sub-tabs ───────────────────────────────────────
let activeExpTab = 'experience'

function renderExpContent() {
  const container = document.getElementById('exp_content')
  if (!container || !window.portfolioData) return
  const group = EXP_GROUPS.find(g => g.key === activeExpTab) ?? EXP_GROUPS[0]
  const items = sortExperiences(
    window.portfolioData.experiences.filter(e => e.type === activeExpTab)
  )
  container.innerHTML = ''
  items.forEach(item => container.appendChild(buildExpCard(item, group.accent)))

  // Update button active states + indicator colors
  document.querySelectorAll('[data-exp-tab]').forEach(btn => {
    const g = EXP_GROUPS.find(g => g.key === btn.dataset.expTab)
    const isActive = btn.dataset.expTab === activeExpTab
    btn.classList.toggle('active', isActive)
    btn.style.color = isActive ? g.accent : ''
    btn.style.textShadow = isActive ? `0 0 8px ${g.accent}66` : ''
    const ind = btn.querySelector('.sub_tab_indicator')
    if (ind) {
      ind.style.background = g.accent
      ind.style.boxShadow = isActive ? `0 0 8px ${g.accent}` : 'none'
    }
  })

  initializeTabCards()
  setTimeout(updateScrollHeight, 50)
}

function initExpSubTabs() {
  document.querySelectorAll('[data-exp-tab]').forEach(btn => {
    // Pre-color the indicator
    const g = EXP_GROUPS.find(g => g.key === btn.dataset.expTab) ?? EXP_GROUPS[0]
    const ind = btn.querySelector('.sub_tab_indicator')
    if (ind) ind.style.background = g.accent
    btn.addEventListener('click', () => {
      if (btn.dataset.expTab === activeExpTab) return
      activeExpTab = btn.dataset.expTab
      renderExpContent()
    })
  })
  renderExpContent()
}

// ── Project sub-tabs ──────────────────────────────────────────
let activeProjTab = 'live'

function renderProjContent() {
  const container = document.getElementById('proj_content')
  if (!container || !window.portfolioData) return
  const isLive = activeProjTab === 'live'
  const items = window.portfolioData.projects[activeProjTab] ?? []
  container.innerHTML = items.map(item => buildProjectCard(item, isLive)).join('')

  // Update button active states + indicator colors
  document.querySelectorAll('[data-proj-tab]').forEach(btn => {
    const g = PROJ_GROUPS.find(g => g.key === btn.dataset.projTab)
    const isActive = btn.dataset.projTab === activeProjTab
    btn.classList.toggle('active', isActive)
    btn.style.color = isActive ? g.accent : ''
    btn.style.textShadow = isActive ? `0 0 8px ${g.accent}66` : ''
    const ind = btn.querySelector('.sub_tab_indicator')
    if (ind) {
      ind.style.background = g.accent
      ind.style.boxShadow = isActive ? `0 0 8px ${g.accent}` : 'none'
    }
  })

  initializeTabCards()
  setTimeout(updateScrollHeight, 50)
}

function initProjSubTabs() {
  document.querySelectorAll('[data-proj-tab]').forEach(btn => {
    const g = PROJ_GROUPS.find(g => g.key === btn.dataset.projTab) ?? PROJ_GROUPS[0]
    const ind = btn.querySelector('.sub_tab_indicator')
    if (ind) ind.style.background = g.accent
    btn.addEventListener('click', () => {
      if (btn.dataset.projTab === activeProjTab) return
      activeProjTab = btn.dataset.projTab
      renderProjContent()
    })
  })
  renderProjContent()
}

// ── Main DB init ──────────────────────────────────────────────
function initFromDatabase() {
  if (!window.portfolioData) return
  renderBio()
  renderSkills()
  initExpSubTabs()
  initProjSubTabs()
}

// ─────────────────────────────────────────────────────────────
//  ORIGINAL SCRIPTS  (unchanged below)
// ─────────────────────────────────────────────────────────────

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
  initFromDatabase();
  initializeDesktopVfx();
  initializeTabCards();
  updateScreenFocusability();
  updateScrollHeight();
});
