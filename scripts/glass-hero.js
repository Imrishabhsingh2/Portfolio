/**
 * Glass Hero Motion Controller & Full Portfolio Interactivity
 * Vanilla ES2020 Module
 */

const DESKTOP_RADIUS = 235;
const MOBILE_RADIUS = 150;

// Module-scoped pointer & animation state container
const pointerState = {
  rawX: -999,
  rawY: -999,
  smoothX: -999,
  smoothY: -999,
  currentRadius: 0,
  targetRadius: 0,
  isTracking: false,
  frameId: null,
};

// Reduced motion media query check
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initGlassHero() {
  const heroElement = document.getElementById('hero');
  if (!heroElement) return;

  // Single requestAnimationFrame loop for liquid-glass mask
  function tick() {
    const factorPos = prefersReducedMotion.matches ? 1 : 0.14;
    const factorRad = prefersReducedMotion.matches ? 1 : 0.12;

    pointerState.smoothX += (pointerState.rawX - pointerState.smoothX) * factorPos;
    pointerState.smoothY += (pointerState.rawY - pointerState.smoothY) * factorPos;
    pointerState.currentRadius += (pointerState.targetRadius - pointerState.currentRadius) * factorRad;

    heroElement.style.setProperty('--reveal-x', `${pointerState.smoothX}px`);
    heroElement.style.setProperty('--reveal-y', `${pointerState.smoothY}px`);
    heroElement.style.setProperty('--reveal-radius', `${pointerState.currentRadius}px`);

    pointerState.frameId = requestAnimationFrame(tick);
  }

  // Start single loop
  pointerState.frameId = requestAnimationFrame(tick);

  // Desktop PointerEnter Handler
  heroElement.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      const rect = heroElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointerState.rawX = x;
      pointerState.rawY = y;
      if (pointerState.smoothX < -500) {
        pointerState.smoothX = x;
        pointerState.smoothY = y;
      }
      pointerState.targetRadius = DESKTOP_RADIUS;
    }
  });

  // Continuous PointerMove Handler
  heroElement.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || pointerState.isTracking) {
      const rect = heroElement.getBoundingClientRect();
      pointerState.rawX = e.clientX - rect.left;
      pointerState.rawY = e.clientY - rect.top;
    }
  });

  // Desktop PointerLeave Handler
  heroElement.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') {
      pointerState.targetRadius = 0;
    }
  });

  // Touch PointerDown Handler
  heroElement.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') {
      pointerState.isTracking = true;
      try {
        if (typeof heroElement.setPointerCapture === 'function') {
          heroElement.setPointerCapture(e.pointerId);
        }
      } catch (_) {}
      const rect = heroElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointerState.rawX = x;
      pointerState.rawY = y;
      pointerState.smoothX = x;
      pointerState.smoothY = y;
      pointerState.targetRadius = MOBILE_RADIUS;
    }
  });

  // Touch PointerUp & PointerCancel Handler
  const handlePointerUpOrCancel = (e) => {
    if (e.pointerType !== 'mouse') {
      pointerState.targetRadius = 0;
      pointerState.isTracking = false;
      try {
        if (typeof heroElement.hasPointerCapture === 'function' && heroElement.hasPointerCapture(e.pointerId)) {
          heroElement.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
    }
  };

  heroElement.addEventListener('pointerup', handlePointerUpOrCancel);
  heroElement.addEventListener('pointercancel', handlePointerUpOrCancel);

  // Mobile Hamburger Toggle Logic
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    const toggleMenu = (shouldOpen) => {
      const isExpanded = shouldOpen !== undefined ? shouldOpen : menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      menuToggle.classList.toggle('is-active', isExpanded);
      mobileMenu.classList.toggle('is-open', isExpanded);
      mobileMenu.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
    };

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('is-open') && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });
  }

  // Work Filtering Tabs Logic
  const workTabs = document.querySelectorAll('.work__tab');
  const workItems = document.querySelectorAll('.work-item');

  workTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter');
      workTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      workItems.forEach((item) => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.classList.remove('is-hidden');
        } else {
          item.classList.add('is-hidden');
        }
      });
    });
  });

  // Certificate Modal Popup Logic
  const certModal = document.getElementById('certModal');
  const certImage = document.getElementById('certImage');
  const closeModalBtn = document.getElementById('closeModal');
  const verifyBtns = document.querySelectorAll('.cert-card__verify-btn');

  if (certModal && certImage) {
    verifyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const imageSrc = btn.getAttribute('data-cert');
        if (imageSrc) {
          certImage.src = imageSrc;
          certModal.classList.add('is-visible');
          certModal.setAttribute('aria-hidden', 'false');
        }
      });
    });

    const closeCertModal = () => {
      certModal.classList.remove('is-visible');
      certModal.setAttribute('aria-hidden', 'true');
    };

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeCertModal);
    }

    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) {
        closeCertModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && certModal.classList.contains('is-visible')) {
        closeCertModal();
      }
    });
  }

  // EmailJS Contact Form Handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm && window.emailjs) {
    try {
      window.emailjs.init('iX2zP4AVjTf2l6xVa');
    } catch (_) {}

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Send Message';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;
      }

      window.emailjs.sendForm('service_gmail', 'template_xpiheup', contactForm)
        .then(() => {
          alert('Message sent successfully! 🚀');
          contactForm.reset();
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
        })
        .catch((error) => {
          alert('Failed to send message ❌ Please try again or email imrishabhsingh2@gmail.com directly.');
          console.error('EmailJS Error:', error);
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
        });
    });
  }

  // Reveal on Scroll Observer
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // Trigger entrance transitions by adding is-loaded class
  requestAnimationFrame(() => {
    heroElement.classList.add('is-loaded');
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlassHero);
} else {
  initGlassHero();
}
