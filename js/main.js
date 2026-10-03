/**
 * NovaTech - Modern Landing Page Logic
 * Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Theme Switcher (Dark/Light) with localStorage persistence
 * - Sticky Header with Backdrop Blur on Scroll
 * - Mobile Navigation Menu with Accessible Toggle
 * - ScrollSpy (Active Navigation Link Highlighting)
 * - Scroll Reveal Animations via IntersectionObserver
 * - Interactive Stat Counter Numbers
 * - Robust Contact Form Validation with Toast Feedback
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. Theme Switcher (Dark / Light Mode)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Retrieve stored theme or fall back to system preference
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('novatech_theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  // Apply theme
  const applyTheme = (theme) => {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('novatech_theme', theme);
  };

  // Initialize theme
  applyTheme(getPreferredTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(newTheme === 'dark' ? 'მუქი თემა გააქტიურდა' : 'ნათელი თემა გააქტიურდა', 'success');
    });
  }

  /* ==========================================================================
     2. Sticky Header on Scroll
     ========================================================================== */
  const siteHeader = document.getElementById('site-header');

  const handleHeaderScroll = () => {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ==========================================================================
     3. Mobile Navigation Menu Toggle
     ========================================================================== */
  const mobileToggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMobileMenu = () => {
    const isOpen = navMenu.classList.toggle('open');
    mobileToggleBtn.classList.toggle('active', isOpen);
    mobileToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      mobileToggleBtn.classList.remove('active');
      mobileToggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!navMenu.contains(event.target) && !mobileToggleBtn.contains(event.target)) {
        closeMobileMenu();
      }
    });

    // Close menu on nav-link click
    navLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* ==========================================================================
     4. ScrollSpy: Highlight Active Nav Item on Scroll
     ========================================================================== */
  const sections = document.querySelectorAll('main section[id]');

  const highlightNavOnScroll = () => {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');
      const matchingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (matchingLink) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach((l) => l.classList.remove('active'));
          matchingLink.classList.add('active');
        }
      }
    });
  };

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

  /* ==========================================================================
     5. Scroll Reveal Animations (IntersectionObserver)
     ========================================================================== */
  const revealElements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay') || 0;
            setTimeout(() => {
              entry.target.classList.add('is-revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  /* ==========================================================================
     6. Stat Counter Animations
     ========================================================================== */
  const statNumbers = document.querySelectorAll('.stat-number');
  let animatedStats = false;

  const animateCounters = () => {
    if (animatedStats) return;

    statNumbers.forEach((stat) => {
      const originalText = stat.textContent;
      const countTo = parseFloat(stat.getAttribute('data-count'));
      if (isNaN(countTo)) return;

      let current = 0;
      const step = countTo / 40;
      const isDecimal = originalText.includes('.');

      const timer = setInterval(() => {
        current += step;
        if (current >= countTo) {
          stat.textContent = originalText;
          clearInterval(timer);
        } else {
          stat.textContent = isDecimal 
            ? current.toFixed(1) + '%' 
            : Math.floor(current) + (originalText.includes('+') ? '+' : originalText.includes('/') ? '/7' : '');
        }
      }, 30);
    });

    animatedStats = true;
  };

  // Trigger stat counter when hero section is in view
  const heroSection = document.getElementById('hero');
  if (heroSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.3 });
    statsObserver.observe(heroSection);
  } else {
    animateCounters();
  }

  /* ==========================================================================
     7. Contact Form Validation & Submission
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');

  // Input fields
  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');
  const messageInput = document.getElementById('user-message');

  // Error feedback containers
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateInput = (input, errorEl, condition, errorMsg) => {
    if (!condition) {
      input.classList.add('is-invalid');
      errorEl.textContent = errorMsg;
      return false;
    } else {
      input.classList.remove('is-invalid');
      errorEl.textContent = '';
      return true;
    }
  };

  // Live input validation on blur / input
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      validateInput(
        nameInput,
        nameError,
        nameInput.value.trim().length >= 2,
        'გთხოვთ შეიყვანოთ მინიმუმ 2 სიმბოლო'
      );
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      validateInput(
        emailInput,
        emailError,
        emailRegex.test(emailInput.value.trim()),
        'გთხოვთ შეიყვანოთ ვალიდური ელექტრონული ფოსტა'
      );
    });
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      validateInput(
        messageInput,
        messageError,
        messageInput.value.trim().length >= 10,
        'შეტყობინება უნდა შედგებოდეს მინიმუმ 10 სიმბოლოსგან'
      );
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous status
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      // Perform validation check
      const isNameValid = validateInput(
        nameInput,
        nameError,
        nameInput.value.trim().length >= 2,
        'გთხოვთ მიუთითოთ თქვენი სახელი და გვარი'
      );

      const isEmailValid = validateInput(
        emailInput,
        emailError,
        emailRegex.test(emailInput.value.trim()),
        'გთხოვთ მიუთითოთ სწორი ელ-ფოსტის მისამართი'
      );

      const isMessageValid = validateInput(
        messageInput,
        messageError,
        messageInput.value.trim().length >= 10,
        'გთხოვთ დაწეროთ შეტყობინება (მინიმუმ 10 სიმბოლო)'
      );

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        showToast('გთხოვთ შეავსოთ ყველა სავალდებულო ველი სწორად', 'error');
        return;
      }

      // Enter loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        // Simulate async network request
        await new Promise((resolve) => setTimeout(resolve, 1400));

        // Success state
        contactForm.reset();
        formStatus.textContent = 'მადლობა! თქვენი შეტყობინება წარმატებით გაიგზავნა.';
        formStatus.classList.add('success');
        showToast('შეტყობინება წარმატებით გაიგზავნა!', 'success');

        // Reset status message after 6 seconds
        setTimeout(() => {
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }, 6000);
      } catch (error) {
        formStatus.textContent = 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.';
        formStatus.classList.add('error');
        showToast('შეცდომა! შეტყობინება ვერ გაიგზავნა', 'error');
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }

  /* ==========================================================================
     8. Toast Notification System
     ========================================================================== */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconSvg = type === 'success'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
      // Safety fallback removal
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

});
