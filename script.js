// Prevent re-initialization if script is reloaded
if (window.appInitialized) {
  console.log('App already initialized');
} else {
  window.appInitialized = true;

  // ----------------------------
  // GLOBAL STATE
  // ----------------------------
  let typingTimeout = null;
  let codeBackgroundInterval = null;
  let observers = [];

  // ----------------------------
  // MOBILE MENU
  // ----------------------------
  function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const body = document.body;

    if (!mobileMenuToggle || !mobileNav) return;

    const closeMobileMenu = () => {
      mobileMenuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      mobileNav.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
    };

    const openMobileMenu = () => {
      mobileMenuToggle.classList.add('active');
      mobileNav.classList.add('active');
      mobileNav.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
    };

    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNav.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
    });

    mobileMenuToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        mobileMenuToggle.click();
      }
    });

    // Smooth close after link click
    mobileNav.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => setTimeout(closeMobileMenu, 120));
    });

    // Global click listener to close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!mobileNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
        if (mobileNav.classList.contains('active')) closeMobileMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 968) closeMobileMenu();
    });
  }

  // ----------------------------
  // SMOOTH SCROLLING
  // ----------------------------
  function initSmoothScrolling() {
    const allNavLinks = document.querySelectorAll('a[href^="#"]');

    allNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#' || targetId === '#!') return;

        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        e.preventDefault();

        const navbar = document.querySelector('.navbar');
        const navHeight = navbar ? navbar.offsetHeight : 70;
        const targetTop = window.scrollY + targetSection.getBoundingClientRect().top - navHeight + 1;

        window.scrollTo({ top: Math.max(0, Math.floor(targetTop)), behavior: 'smooth' });

        // Close mobile nav if open
        const mobileNav = document.getElementById('mobile-nav');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileNav?.classList.contains('active')) {
          mobileMenuToggle?.classList.remove('active');
          mobileNav.classList.remove('active');
          mobileNav.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }

        setTimeout(() => window.history.pushState({}, '', targetId), 600);
      });
    });

    // Highlight active section
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (sections.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            document.querySelectorAll('.nav-link.active, .mobile-nav-link.active')
              .forEach(el => el.classList.remove('active'));
            document.querySelectorAll(`a[href="#${id}"]`)
              .forEach(el => el.classList.add('active'));
          }
        });
      }, { threshold: 0.6 });

      sections.forEach(s => observer.observe(s));
      observers.push(observer);
    }
  }

  // ----------------------------
  // NAVBAR SCROLL EFFECT
  // ----------------------------
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ----------------------------
  // TYPING ANIMATION
  // ----------------------------
  function initTypingAnimation() {
    const phrases = [
      "digital experiences that feel alive",
      "web apps that load fast and think smart",
      "software that solves problems before you notice them",
      "AI systems that learn like humans, work like machines",
      "machine learning models that turn data into decisions",
      "tools that blend logic and imagination",
      "tech that thinks, moves, and feels",
      "progressive apps that evolve with every click",
      "smart systems with soul — clean code, real impact",
      "ideas turned into interfaces, data turned into stories"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseBeforeDelete = 2000;
    const pauseBeforeType = 500;
    const typingElement = document.querySelector('.typewriter') || document.getElementById('typingText');

    if (!typingElement) return;

    function typeWriter() {
      const currentPhrase = phrases[phraseIndex];
      typingElement.textContent = isDeleting
        ? currentPhrase.substring(0, charIndex--)
        : currentPhrase.substring(0, charIndex++);

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingTimeout = setTimeout(typeWriter, pauseBeforeDelete);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingTimeout = setTimeout(typeWriter, pauseBeforeType);
      } else {
        typingTimeout = setTimeout(typeWriter, isDeleting ? deletingSpeed : typingSpeed);
      }
    }

    typingTimeout = setTimeout(typeWriter, 1000);

    // Pause typing when tab is inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(typingTimeout);
      else typeWriter();
    });
  }


  // ----------------------------
  // BACKGROUND CODE ANIMATION
  // ----------------------------
  function initCodeBackground() {
    const codeBg = document.getElementById('codeBg');
    if (!codeBg) return;

    const codeSnippets = [
      "function init() {", "const app = new App();", "app.render();", "return true;", "}",
      "class Component {", "constructor(props) {", "this.state = {};", "}", 
      "const data = fetch('/api');", "export default App;", "<div className='app'>", 
      "addEventListener('load', init);", "const result = await data;", 
      "styles.transform = 'rotate(45deg)';"
    ];

    function createCodeLine() {
      if (codeBg.childElementCount > 50) return; // cap at 50 elements
      const line = document.createElement('div');
      line.className = 'code-line';
      line.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      line.style.top = `${Math.random() * 100}vh`;
      line.style.left = `${Math.random() * 100}vw`;
      line.style.animationDuration = `${Math.random() * 5 + 5}s`;
      codeBg.appendChild(line);

      line.addEventListener('animationend', () => line.remove());
    }

    for (let i = 0; i < 20; i++) createCodeLine();
    codeBackgroundInterval = setInterval(createCodeLine, 1000);
  }

  

  // ----------------------------
  // SKILLS TABS
  // ----------------------------
  function initSkillsTabs() {
    const tabButtons = Array.from(document.querySelectorAll('.skills-tab'));
    const skillPanels = Array.from(document.querySelectorAll('[data-skill-panel]'));
    if (!tabButtons.length || !skillPanels.length) return;

    const activatePanel = (target) => {
      tabButtons.forEach((button) => {
        const isActive = button.dataset.skillTarget === target;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });

      skillPanels.forEach((panel) => {
        panel.hidden = panel.dataset.skillPanel !== target;
      });
    };

    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => activatePanel(button.dataset.skillTarget));

      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

        event.preventDefault();

        if (event.key === 'Home') {
          tabButtons[0].focus();
          activatePanel(tabButtons[0].dataset.skillTarget);
          return;
        }

        if (event.key === 'End') {
          const lastButton = tabButtons[tabButtons.length - 1];
          lastButton.focus();
          activatePanel(lastButton.dataset.skillTarget);
          return;
        }

        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
        tabButtons[nextIndex].focus();
        activatePanel(tabButtons[nextIndex].dataset.skillTarget);
      });
    });

    const defaultTab = tabButtons.find((button) => button.classList.contains('active')) || tabButtons[0];
    activatePanel(defaultTab.dataset.skillTarget);
  }

  // ----------------------------
  // SKILLS ANIMATION
  // ----------------------------
  function initSkillsAnimation() {
    const skillsSection = document.querySelector('.skills');
    if (!skillsSection) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-progress').forEach(bar => {
            if (!bar.dataset.animated) {
              bar.dataset.animated = 'true';
              const width = bar.style.width;
              bar.style.width = '0%';
              setTimeout(() => bar.style.width = width, 200);
            }
          });
        }
      });
    }, { threshold: 0.5 });

    observer.observe(skillsSection);
    observers.push(observer);
  }

  // ----------------------------
  // CONTACT LINKS
  // ----------------------------
  function initContactLinks() {
    const inquiryForm = document.getElementById('clientInquiryForm');
    if (!inquiryForm) return;

    inquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const values = new FormData(inquiryForm);
      const name = String(values.get('name') || '').trim();
      const email = String(values.get('email') || '').trim();
      const service = String(values.get('service') || '').trim();
      const timeline = String(values.get('timeline') || '').trim();
      const brief = String(values.get('brief') || '').trim();
      const subject = `Graphic design inquiry: ${service}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${service}`,
        `Timeline: ${timeline}`,
        '',
        'Project details:',
        brief
      ].join('\n');
      const mailto = `mailto:jane@miraditechtribe.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      const status = document.getElementById('inquiryStatus');
      if (status) {
        status.textContent = 'Opening a pre-filled email. Review your details, then press Send in your email app.';
      }
      window.location.href = mailto;
    });
  }

  // ----------------------------
  // PROJECT GALLERY FILTERS
  // ----------------------------
  function initProjectFilters() {
    const filters = Array.from(document.querySelectorAll('[data-project-filter]'));
    const cards = Array.from(document.querySelectorAll('#projects [data-project-category]'));
    const status = document.getElementById('projectFilterStatus');
    if (!filters.length || !cards.length) return;

    const applyFilter = (category) => {
      let visibleCount = 0;
      cards.forEach((card) => {
        const visible = category === 'all' || card.dataset.projectCategory === category;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      filters.forEach((filter) => {
        const selected = filter.dataset.projectFilter === category;
        filter.classList.toggle('active', selected);
        filter.setAttribute('aria-pressed', String(selected));
      });

      if (status) {
        const label = category === 'all' ? 'all' : category === 'design' ? 'graphic design' : 'coding';
        status.textContent = category === 'all'
          ? `Showing all ${visibleCount} projects.`
          : `Showing ${visibleCount} ${label} projects.`;
      }
    };

    filters.forEach((filter) => {
      filter.addEventListener('click', () => applyFilter(filter.dataset.projectFilter));
    });

    document.querySelectorAll('[data-show-design-projects]').forEach((link) => {
      link.addEventListener('click', () => applyFilter('design'));
    });

    applyFilter('all');
  }

  // ----------------------------
  // PROJECTS ANIMATION
  // ----------------------------
  function initProjectsAnimation() {
    const projectCards = document.querySelectorAll('.project-card');
    if (!projectCards.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
        }
      });
    }, { threshold: 0.1 });

    projectCards.forEach(card => {
      card.classList.add('fade-up');
      observer.observe(card);
    });

    observers.push(observer);
  }

  // ----------------------------
  // SCROLL SECTION ANIMATIONS
  // ----------------------------
  function initScrollAnimations() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
        }
      });
    }, { 
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => {
      observer.observe(section);
    });

    observers.push(observer);
  }

  // ----------------------------
  // CLEANUP
  // ----------------------------
  function cleanup() {
    if (typingTimeout) clearTimeout(typingTimeout);
    if (codeBackgroundInterval) clearInterval(codeBackgroundInterval);
    observers.forEach(o => o.disconnect());
  }

  // ----------------------------
  // INITIALIZE APP
  // ----------------------------
  function initializeApp() {
    initMobileMenu();
    initContactLinks();
    initSmoothScrolling();
    initNavbarScroll();
    initTypingAnimation();
    initCodeBackground();
    initSkillsTabs();
    initSkillsAnimation();
    initProjectFilters();
    initProjectsAnimation();
    initScrollAnimations();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initializeApp)
    : initializeApp();

  window.addEventListener('beforeunload', cleanup);
}
if (window.appInitialized) {
  console.log("App already initialized");
} else {
  window.appInitialized = true;

  let typingTimeout = null;
  let codeBackgroundInterval = null;
  let typingPaused = false;
  const observers = [];
  const cleanupCallbacks = [];
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function registerCleanup(fn) {
    cleanupCallbacks.push(fn);
  }

  function addMotionListener(listener) {
    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", listener);
      return () => reducedMotionQuery.removeEventListener("change", listener);
    }

    reducedMotionQuery.addListener(listener);
    return () => reducedMotionQuery.removeListener(listener);
  }

  function shouldUseHeavyMotion() {
    return !reducedMotionQuery.matches;
  }

  function initMobileMenu() {
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");
    if (!mobileMenuToggle || !mobileNav) return;

    const closeMobileMenu = () => {
      mobileMenuToggle.classList.remove("active");
      mobileNav.classList.remove("active");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    const openMobileMenu = () => {
      mobileMenuToggle.classList.add("active");
      mobileNav.classList.add("active");
      mobileNav.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const onToggleClick = (event) => {
      event.stopPropagation();
      if (mobileNav.classList.contains("active")) closeMobileMenu();
      else openMobileMenu();
    };

    const onToggleKeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggleClick(event);
      }
    };

    const onDocumentClick = (event) => {
      if (!mobileNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
        closeMobileMenu();
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") closeMobileMenu();
    };

    const onResize = () => {
      if (window.innerWidth > 968) closeMobileMenu();
    };

    mobileMenuToggle.addEventListener("click", onToggleClick);
    mobileMenuToggle.addEventListener("keydown", onToggleKeydown);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("resize", onResize);

    const mobileSectionLinks = Array.from(mobileNav.querySelectorAll('a[href^="#"]'));
    const onMobileLinkClick = () => closeMobileMenu();

    mobileSectionLinks.forEach((link) => {
      link.addEventListener("click", onMobileLinkClick);
    });

    registerCleanup(() => {
      mobileMenuToggle.removeEventListener("click", onToggleClick);
      mobileMenuToggle.removeEventListener("keydown", onToggleKeydown);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("resize", onResize);
      mobileSectionLinks.forEach((link) => {
        link.removeEventListener("click", onMobileLinkClick);
      });
    });
  }

  function initSmoothScrolling() {
    const allNavLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    const sections = Array.from(document.querySelectorAll("section[id]"));
    if (!allNavLinks.length || !sections.length) return;

    const activeSelector =
      ".nav-link.active, .mobile-nav-link.active, .mobile-dock-item.active, .mobile-contact-shortcut.active";

    const setActiveSection = (id) => {
      if (!id) return;
      document.querySelectorAll(activeSelector).forEach((el) => el.classList.remove("active"));
      document.querySelectorAll(`a[href="#${id}"]`).forEach((el) => el.classList.add("active"));
    };

    const getLayoutHeights = () => {
      const navbar = document.querySelector(".navbar");
      const dock = document.querySelector(".mobile-bottom-dock");
      const navHeight = navbar ? navbar.offsetHeight : 70;
      const dockVisible = dock && window.getComputedStyle(dock).display !== "none";
      const dockHeight = dockVisible ? dock.offsetHeight : 0;
      return { navHeight, dockHeight };
    };

    const getActiveSectionId = () => {
      const { navHeight, dockHeight } = getLayoutHeights();
      const viewportUsableHeight = Math.max(1, window.innerHeight - navHeight - dockHeight);
      const probeY = window.scrollY + navHeight + Math.max(28, viewportUsableHeight * 0.36);

      let activeId = sections[0].id;

      sections.forEach((section) => {
        const top = window.scrollY + section.getBoundingClientRect().top;
        const bottom = top + Math.max(section.offsetHeight, 1);

        if (probeY >= top) activeId = section.id;
        if (probeY >= top && probeY < bottom) activeId = section.id;
      });

      return activeId;
    };

    let rafId = null;
    const requestActiveUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        setActiveSection(getActiveSectionId());
      });
    };

    const linkHandlers = [];

    allNavLinks.forEach((link) => {
      const onClick = (event) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        event.preventDefault();

        const { navHeight } = getLayoutHeights();
        const targetTop =
          window.scrollY + targetSection.getBoundingClientRect().top - navHeight + 1;

        setActiveSection(targetSection.id);

        window.scrollTo({
          top: Math.max(0, Math.floor(targetTop)),
          behavior: "smooth"
        });

        setTimeout(() => {
          window.history.pushState({}, "", targetId);
          requestActiveUpdate();
        }, 560);
      };

      link.addEventListener("click", onClick);
      linkHandlers.push([link, onClick]);
    });

    const onScroll = () => requestActiveUpdate();
    const onResize = () => requestActiveUpdate();
    const onHashChange = () => requestActiveUpdate();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);

    requestActiveUpdate();

    registerCleanup(() => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }

      linkHandlers.forEach(([link, handler]) => link.removeEventListener("click", handler));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    });
  }

  function initNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 48);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    registerCleanup(() => window.removeEventListener("scroll", onScroll));
  }

  function initMobileDock() {
    const dockRoot = document.querySelector(".mobile-bottom-dock");
    const dockPanel = document.querySelector(".mobile-dock-panel");
    if (!dockRoot || !dockPanel) return;

    const dockItems = Array.from(dockPanel.querySelectorAll(".mobile-dock-item"));
    if (!dockItems.length) return;

    const hoverCapableQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const maxDistance = 108;
    const maxBoost = 0.28;
    let activePointerId = null;
    let resetTimeout = null;

    const resetDockScale = () => {
      dockItems.forEach((item) => item.style.setProperty("--dock-scale", "1"));
    };

    const setInteracting = (active) => {
      dockRoot.classList.toggle("is-interacting", active);
    };

    const clearResetTimeout = () => {
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }
    };

    const scheduleReset = (delay = 120) => {
      clearResetTimeout();
      resetTimeout = setTimeout(() => {
        setInteracting(false);
        resetDockScale();
      }, delay);
    };

    const applyDockScale = (x) => {
      dockItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(x - center);
        const t = Math.max(0, 1 - distance / maxDistance);
        const scale = 1 + t * maxBoost;
        item.style.setProperty("--dock-scale", scale.toFixed(3));
      });
    };

    const startInteraction = () => {
      clearResetTimeout();
      setInteracting(true);
    };

    const onPointerMove = (event) => {
      const isTouchDrag = activePointerId !== null && event.pointerId === activePointerId;
      if (!hoverCapableQuery.matches && !isTouchDrag) return;
      startInteraction();
      applyDockScale(event.clientX);
    };

    const onPointerDown = (event) => {
      activePointerId = event.pointerId;
      startInteraction();
      applyDockScale(event.clientX);

      if (typeof dockPanel.setPointerCapture === "function") {
        try {
          dockPanel.setPointerCapture(event.pointerId);
        } catch (_) {
          // Ignore capture errors for unsupported pointer types.
        }
      }
    };

    const endInteraction = () => {
      activePointerId = null;
      scheduleReset(100);
    };

    const onPointerLeave = () => {
      if (!hoverCapableQuery.matches) return;
      scheduleReset(80);
    };

    const onResize = () => {
      setInteracting(false);
      resetDockScale();
    };

    const onHoverCapabilitiesChanged = () => {
      setInteracting(false);
      resetDockScale();
    };

    dockPanel.addEventListener("pointerdown", onPointerDown);
    dockPanel.addEventListener("pointermove", onPointerMove, { passive: true });
    dockPanel.addEventListener("pointerup", endInteraction);
    dockPanel.addEventListener("pointercancel", endInteraction);
    dockPanel.addEventListener("lostpointercapture", endInteraction);
    dockPanel.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);

    if (typeof hoverCapableQuery.addEventListener === "function") {
      hoverCapableQuery.addEventListener("change", onHoverCapabilitiesChanged);
    } else {
      hoverCapableQuery.addListener(onHoverCapabilitiesChanged);
    }

    registerCleanup(() => {
      dockPanel.removeEventListener("pointerdown", onPointerDown);
      dockPanel.removeEventListener("pointermove", onPointerMove);
      dockPanel.removeEventListener("pointerup", endInteraction);
      dockPanel.removeEventListener("pointercancel", endInteraction);
      dockPanel.removeEventListener("lostpointercapture", endInteraction);
      dockPanel.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);

      if (typeof hoverCapableQuery.addEventListener === "function") {
        hoverCapableQuery.removeEventListener("change", onHoverCapabilitiesChanged);
      } else {
        hoverCapableQuery.removeListener(onHoverCapabilitiesChanged);
      }

      clearResetTimeout();
      setInteracting(false);
      resetDockScale();
    });
  }

  function initTypingAnimation() {
    const typingElement = document.getElementById("typingText");
    if (!typingElement) return;

    const phrases = [
      "digital experiences that feel alive",
      "web apps that load fast and think smart",
      "software that solves problems before you notice them",
      "AI systems that learn like humans, work like machines",
      "machine learning models that turn data into decisions",
      "tools that blend logic and imagination",
      "tech that thinks, moves, and feels",
      "progressive apps that evolve with every click",
      "smart systems with soul - clean code, real impact",
      "ideas turned into interfaces, data turned into stories"
    ];

    if (!shouldUseHeavyMotion()) {
      typingElement.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typingSpeed = 92;
    const deletingSpeed = 52;
    const holdDelay = 1500;
    const restartDelay = 360;

    function clearTypingTimeout() {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
      }
    }

    function typeFrame() {
      if (typingPaused) return;

      const currentPhrase = phrases[phraseIndex];
      if (deleting) charIndex = Math.max(0, charIndex - 1);
      else charIndex = Math.min(currentPhrase.length, charIndex + 1);

      typingElement.textContent = currentPhrase.slice(0, charIndex);

      if (!deleting && charIndex === currentPhrase.length) {
        deleting = true;
        typingTimeout = setTimeout(typeFrame, holdDelay);
        return;
      }

      if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingTimeout = setTimeout(typeFrame, restartDelay);
        return;
      }

      typingTimeout = setTimeout(typeFrame, deleting ? deletingSpeed : typingSpeed);
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        typingPaused = true;
        clearTypingTimeout();
      } else {
        typingPaused = false;
        clearTypingTimeout();
        typeFrame();
      }
    };

    const removeMotionListener = addMotionListener(() => {
      clearTypingTimeout();
      if (!shouldUseHeavyMotion()) {
        typingElement.textContent = phrases[0];
        return;
      }

      typingPaused = false;
      typeFrame();
    });

    document.addEventListener("visibilitychange", onVisibilityChange);
    typingTimeout = setTimeout(typeFrame, 800);

    registerCleanup(() => {
      clearTypingTimeout();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      removeMotionListener();
    });
  }

  function initCodeBackground() {
    const codeBg = document.getElementById("codeBg");
    if (!codeBg || !shouldUseHeavyMotion()) return;

    const snippets = [
      "function init() {",
      "const app = new App();",
      "await fetch('/api/hello');",
      "return data.map(renderCard);",
      "if (isReady) start();",
      "requestAnimationFrame(loop);",
      "const state = { loading: false };",
      "component.render();",
      "const model = train(dataset);",
      "export default Portfolio;"
    ];

    const maxLines = 40;

    function createLine() {
      if (!shouldUseHeavyMotion() || codeBg.childElementCount >= maxLines) return;

      const line = document.createElement("div");
      line.className = "code-line";
      line.textContent = snippets[Math.floor(Math.random() * snippets.length)];
      line.style.left = `${Math.random() * 100}%`;
      line.style.top = `${Math.random() * 100 - 50}%`;
      line.style.animationDuration = `${5 + Math.random() * 6}s`;
      codeBg.appendChild(line);

      line.addEventListener("animationend", () => line.remove(), { once: true });
    }

    for (let i = 0; i < 22; i += 1) createLine();
    codeBackgroundInterval = setInterval(createLine, 1100);

    const removeMotionListener = addMotionListener(() => {
      if (!shouldUseHeavyMotion()) {
        if (codeBackgroundInterval) {
          clearInterval(codeBackgroundInterval);
          codeBackgroundInterval = null;
        }
        codeBg.innerHTML = "";
      } else if (!codeBackgroundInterval) {
        for (let i = 0; i < 18; i += 1) createLine();
        codeBackgroundInterval = setInterval(createLine, 1100);
      }
    });

    registerCleanup(() => {
      if (codeBackgroundInterval) clearInterval(codeBackgroundInterval);
      codeBackgroundInterval = null;
      removeMotionListener();
    });
  }

  function initSkillsAnimation() {
    const skillsSection = document.querySelector(".skills");
    if (!skillsSection) return;

    const skillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.querySelectorAll(".skill-progress").forEach((bar) => {
            if (bar.dataset.animated === "true") return;

            const width = bar.style.width;
            bar.dataset.animated = "true";
            bar.style.width = "0%";
            setTimeout(() => {
              bar.style.width = width;
            }, 140);
          });
        });
      },
      { threshold: 0.42 }
    );

    skillsObserver.observe(skillsSection);
    observers.push(skillsObserver);
  }

  function initProjectsAnimation() {
    const projectCards = Array.from(document.querySelectorAll(".project-card"));
    if (!projectCards.length) return;

    const projectsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const delay = Number(entry.target.dataset.stagger || "0");
          setTimeout(() => entry.target.classList.add("visible"), delay);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    projectCards.forEach((card, index) => {
      card.classList.add("fade-up");
      card.dataset.stagger = String((index % 6) * 90);
      projectsObserver.observe(card);
    });

    observers.push(projectsObserver);
  }

  function initSocialIconsAnimation() {
    const socialIcons = Array.from(document.querySelectorAll(".social-icon"));
    if (!socialIcons.length) return;

    socialIcons.forEach((icon, index) => {
      icon.style.setProperty("--icon-index", String(index));
    });

    const socialObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-live");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    socialIcons.forEach((icon) => socialObserver.observe(icon));
    observers.push(socialObserver);
  }

  function initParallaxStorytelling() {
    const panels = Array.from(document.querySelectorAll(".story-panel"));
    if (!panels.length) return;

    let ticking = false;

    const updatePanels = () => {
      const viewportHeight = window.innerHeight || 1;
      const allowMotion = shouldUseHeavyMotion() && window.innerWidth > 768;

      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const speed = Number.parseFloat(panel.dataset.parallaxSpeed || "0.1");
        const panelCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const centerDistance = panelCenter - viewportCenter;
        const range = viewportHeight * 0.8 + rect.height / 2;
        const progress = 1 - Math.min(1, Math.abs(centerDistance) / range);
        const clampedProgress = Math.max(0, progress);
        const shift = allowMotion ? centerDistance * speed * -1 : 0;

        panel.style.setProperty("--parallax-shift", `${shift.toFixed(2)}px`);
        panel.style.setProperty("--story-progress", clampedProgress.toFixed(3));

        if (panel.id === "home") {
          const zoomValue = allowMotion ? 1 + clampedProgress * 0.065 : 1;
          panel.style.setProperty("--hero-zoom", zoomValue.toFixed(3));
        }
      });

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updatePanels);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const removeMotionListener = addMotionListener(onScroll);

    registerCleanup(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      removeMotionListener();
    });

    updatePanels();
  }

  function initTiltEffects() {
    const prefersFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!prefersFinePointer || !shouldUseHeavyMotion()) return;

    const tiltTargets = Array.from(
      document.querySelectorAll(".project-card, .skill-item, .social-icon, .profile-container")
    );
    if (!tiltTargets.length) return;

    const disposeFns = [];

    tiltTargets.forEach((element) => {
      const isSocial = element.classList.contains("social-icon");
      const isProfile = element.classList.contains("profile-container");
      const intensity = isSocial ? 8 : isProfile ? 10 : 7;
      const hoverScale = isSocial ? 1.06 : 1.02;
      const hoverLift = isSocial ? -7 : isProfile ? -8 : -9;

      const resetElement = () => {
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
        element.style.setProperty("--glint-x", "50%");
        element.style.setProperty("--glint-y", "50%");

        if (!element.matches(":hover")) {
          element.style.setProperty("--lift", "0px");
          element.style.setProperty("--scale", "1");
        }
      };

      const onPointerMove = (event) => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const pointerX = (event.clientX - rect.left) / rect.width;
        const pointerY = (event.clientY - rect.top) / rect.height;

        const rotateY = (pointerX - 0.5) * intensity * 2;
        const rotateX = (0.5 - pointerY) * intensity * 2;

        element.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
        element.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
        element.style.setProperty("--glint-x", `${(pointerX * 100).toFixed(1)}%`);
        element.style.setProperty("--glint-y", `${(pointerY * 100).toFixed(1)}%`);
        element.style.setProperty("--lift", `${hoverLift}px`);
        element.style.setProperty("--scale", String(hoverScale));
      };

      const onPointerLeave = () => resetElement();

      element.addEventListener("pointermove", onPointerMove);
      element.addEventListener("pointerleave", onPointerLeave);
      element.addEventListener("pointercancel", onPointerLeave);

      disposeFns.push(() => {
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerleave", onPointerLeave);
        element.removeEventListener("pointercancel", onPointerLeave);
      });
    });

    const removeMotionListener = addMotionListener(() => {
      if (shouldUseHeavyMotion()) return;

      tiltTargets.forEach((element) => {
        element.style.setProperty("--tilt-x", "0deg");
        element.style.setProperty("--tilt-y", "0deg");
        element.style.setProperty("--glint-x", "50%");
        element.style.setProperty("--glint-y", "50%");
        element.style.setProperty("--lift", "0px");
        element.style.setProperty("--scale", "1");
      });
    });

    registerCleanup(() => {
      disposeFns.forEach((dispose) => dispose());
      removeMotionListener();
    });
  }

  function initClickSpark() {
    if (!shouldUseHeavyMotion()) return;

    const sparkColor = "#fff";
    const sparkSize = 10;
    const sparkRadius = 15;
    const sparkCount = 8;
    const duration = 400;
    const easing = "ease-out";
    const extraScale = 1.0;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      display: "block",
      pointerEvents: "none",
      userSelect: "none",
      zIndex: "1300"
    });

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }

    const sparks = [];
    let rafId = null;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    const easeFunc = (t) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    };

    const resizeCanvas = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(viewportWidth * dpr));
      canvas.height = Math.max(1, Math.floor(viewportHeight * dpr));
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    };

    const drawFrame = (timestamp) => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i];
        const elapsed = timestamp - spark.startTime;

        if (elapsed >= duration) {
          sparks.splice(i, 1);
          continue;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      if (sparks.length > 0) {
        rafId = window.requestAnimationFrame(drawFrame);
      } else {
        rafId = null;
      }
    };

    const queueSparkRender = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(drawFrame);
    };

    const spawnSparks = (x, y) => {
      const now = performance.now();

      for (let i = 0; i < sparkCount; i += 1) {
        sparks.push({
          x,
          y,
          angle: (2 * Math.PI * i) / sparkCount,
          startTime: now
        });
      }

      queueSparkRender();
    };

    const onPointerDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      spawnSparks(event.clientX, event.clientY);
    };

    const onResize = () => resizeCanvas();

    const onMotionPreferenceChange = () => {
      if (shouldUseHeavyMotion()) return;
      sparks.length = 0;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    };

    resizeCanvas();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    const removeMotionListener = addMotionListener(onMotionPreferenceChange);

    registerCleanup(() => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPointerDown);
      removeMotionListener();

      sparks.length = 0;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      canvas.remove();
    });
  }

  function cleanup() {
    if (typingTimeout) clearTimeout(typingTimeout);
    if (codeBackgroundInterval) clearInterval(codeBackgroundInterval);

    observers.forEach((observer) => observer.disconnect());
    cleanupCallbacks.forEach((callback) => callback());
  }

  function initializeApp() {
    initMobileMenu();
    initMobileDock();
    initSmoothScrolling();
    initNavbarScroll();
    initTypingAnimation();
    initSkillsAnimation();
    initProjectsAnimation();
    initSocialIconsAnimation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
  } else {
    initializeApp();
  }

  window.addEventListener("beforeunload", cleanup);
}
