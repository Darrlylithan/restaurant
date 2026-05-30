(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    initNav();
    initScrollAnimations();
    initCarousel();
    initFormValidation();
    initContactForm();
    initCopyrightYear();
  });


  /* =============================================
     THEME TOGGLE — light / dark preference
     ============================================= */
  function initThemeToggle() {
    var btn  = document.getElementById('theme-toggle');
    var html = document.documentElement;

    if (!btn) return;

    // Read saved preference; default to dark
    var saved = 'dark';
    try {
      saved = localStorage.getItem('theme') || 'dark';
    } catch (err) { /* storage unavailable */ }

    function applyTheme(theme) {
      if (theme === 'light') {
        html.dataset.theme = 'light';
        btn.setAttribute('aria-pressed', 'true');
      } else {
        delete html.dataset.theme;
        btn.setAttribute('aria-pressed', 'false');
      }
    }

    applyTheme(saved);

    btn.addEventListener('click', function () {
      var current = html.dataset.theme === 'light' ? 'light' : 'dark';
      var next    = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem('theme', next);
      } catch (err) { /* storage unavailable */ }
    });
  }


  /* =============================================
     NAV — scroll background swap + hamburger
     ============================================= */
  function initNav() {
    var header   = document.getElementById('main-header');
    var toggle   = document.getElementById('nav-toggle');
    var navLinks = document.getElementById('nav-links');

    if (!header || !toggle || !navLinks) return;

    // Swap background when scrolled past the nav bar
    function onScroll() {
      if (window.scrollY > 80) {
        header.classList.add('nav--scrolled');
      } else {
        header.classList.remove('nav--scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load in case page is already scrolled

    // Hamburger open / close
    toggle.addEventListener('click', function () {
      var isOpen = navLinks.getAttribute('data-open') === 'true';
      navLinks.setAttribute('data-open', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close mobile nav when any link is clicked
    var links = navLinks.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        navLinks.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* =============================================
     SCROLL ANIMATIONS — IntersectionObserver
     ============================================= */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    // If browser doesn't support IntersectionObserver, just show everything
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(function (el) { observer.observe(el); });
  }


  /* =============================================
     CAROUSEL — testimonials
     ============================================= */
  function initCarousel() {
    var carousel   = document.getElementById('carousel');
    var track      = document.getElementById('carousel-track');
    var prevBtn    = document.getElementById('carousel-prev');
    var nextBtn    = document.getElementById('carousel-next');
    var dots       = document.querySelectorAll('.carousel__dot');
    var liveRegion = document.getElementById('carousel-live');

    if (!carousel || !track) return;

    var totalSlides = track.children.length;
    var currentIndex = 0;
    var autoplayTimer = null;

    function goToSlide(index) {
      // Wrap around
      index = ((index % totalSlides) + totalSlides) % totalSlides;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';

      // Update dots
      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.setAttribute('aria-selected', String(active));
        dot.classList.toggle('carousel__dot--active', active);
        // Keep the CSS class in sync with aria (for style hook)
        if (active) {
          dot.style.background = '';
        }
      });

      // Announce to screen readers
      if (liveRegion) {
        liveRegion.textContent = 'Showing testimonial ' + (index + 1) + ' of ' + totalSlides;
      }

      currentIndex = index;
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () {
        goToSlide(currentIndex + 1);
      }, 4000);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Restart autoplay after manual interaction
    function resetAndPlay() {
      stopAutoplay();
      startAutoplay();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(currentIndex - 1);
        resetAndPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(currentIndex + 1);
        resetAndPlay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToSlide(parseInt(dot.getAttribute('data-index'), 10));
        resetAndPlay();
      });
    });

    // Pause on hover / focus (accessibility)
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    // Swipe support on touch devices
    var touchStartX = 0;
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
        resetAndPlay();
      }
    }, { passive: true });

    // Init
    goToSlide(0);
    startAutoplay();
  }


  /* =============================================
     FORM VALIDATION
     ============================================= */
  function initFormValidation() {
    var form          = document.getElementById('reservation-form');
    var successBanner = document.getElementById('reservation-success');

    if (!form || !successBanner) return;

    // Set minimum date to today
    var dateInput = document.getElementById('res-date');
    if (dateInput) {
      dateInput.setAttribute('min', todayString());
    }

    // Validator rules: return error string or empty string if valid
    var validators = {
      fullName: function (val) {
        return val.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).';
      },
      email: function (val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Please enter a valid email address.';
      },
      phone: function (val) {
        return /^[\d\s\+\-\(\)]{7,20}$/.test(val.trim()) ? '' : 'Please enter a valid phone number (7–20 digits).';
      },
      date: function (val) {
        if (!val) return 'Please select a date.';
        var selected = new Date(val);
        var today = new Date(todayString());
        return selected >= today ? '' : 'Please select today or a future date.';
      },
      time: function (val) {
        return val ? '' : 'Please select a time.';
      },
      guests: function (val) {
        return val ? '' : 'Please select the number of guests.';
      }
    };

    function todayString() {
      var d = new Date();
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + mm + '-' + dd;
    }

    function validateField(input) {
      var name = input.name;
      if (!validators[name]) return true;

      var errorId = input.getAttribute('aria-describedby');
      var errorEl = errorId ? document.getElementById(errorId) : null;
      var message = validators[name](input.value);

      if (message) {
        input.classList.add('is-invalid');
        if (errorEl) errorEl.textContent = message;
        return false;
      } else {
        input.classList.remove('is-invalid');
        if (errorEl) errorEl.textContent = '';
        return true;
      }
    }

    // Attach blur + live-re-validate listeners to all required fields
    var requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
      field.addEventListener('change', function () {
        if (field.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });

    // Submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Hide any previous success banner
      successBanner.hidden = true;

      // Validate all required fields
      var valid = true;
      requiredFields.forEach(function (field) {
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        var firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      showSuccess(form);
    });

    function showSuccess(formEl) {
      // Read values before reset
      var name    = formEl.querySelector('#full-name').value.trim();
      var guests  = formEl.querySelector('#guests').value;
      var dateVal = formEl.querySelector('#res-date').value;
      var timeVal = formEl.querySelector('#res-time').value;

      var guestsLabel = guests === '1' ? '1 guest' : guests + ' guests';

      // Format date nicely
      var formattedDate = dateVal;
      try {
        // Append T00:00 so the date is parsed in local time, not UTC
        var dateObj = new Date(dateVal + 'T00:00');
        formattedDate = dateObj.toLocaleDateString('en-SG', {
          weekday: 'long',
          year:    'numeric',
          month:   'long',
          day:     'numeric'
        });
      } catch (err) { /* fallback to raw dateVal */ }

      // Format time as 12-hour
      var formattedTime = timeVal;
      try {
        var parts = timeVal.split(':');
        var hrs = parseInt(parts[0], 10);
        var mins = parts[1];
        var period = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12 || 12;
        formattedTime = hrs + ':' + mins + ' ' + period;
      } catch (err) { /* fallback */ }

      successBanner.innerHTML =
        '<strong>Reservation request received!</strong>' +
        'Thank you, ' + escapeHtml(name) + '! Your reservation request for ' +
        escapeHtml(guestsLabel) + ' on <em>' + escapeHtml(formattedDate) + '</em> at ' +
        escapeHtml(formattedTime) + ' has been received. We will confirm your booking within 24 hours.';

      successBanner.hidden = false;
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Reset form and clear error states
      formEl.reset();
      form.querySelectorAll('.is-invalid').forEach(function (el) {
        el.classList.remove('is-invalid');
      });
      form.querySelectorAll('.form-error').forEach(function (el) {
        el.textContent = '';
      });
    }

    // Minimal XSS-safe HTML escape for user-supplied strings inserted via innerHTML
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }


  /* =============================================
     CONTACT FORM — lead capture + localStorage
     ============================================= */
  function initContactForm() {
    var form          = document.getElementById('contact-form');
    var successBanner = document.getElementById('contact-success');

    if (!form || !successBanner) return;

    var validators = {
      contactName: function (val) {
        return val.trim().length >= 2 ? '' : 'Please enter your full name (at least 2 characters).';
      },
      contactEmail: function (val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Please enter a valid email address.';
      },
      contactInterest: function (val) {
        return val ? '' : 'Please select an enquiry type.';
      },
      contactMessage: function (val) {
        return val.trim().length >= 10 ? '' : 'Please enter a message (at least 10 characters).';
      }
    };

    function validateField(input) {
      var name    = input.name;
      if (!validators[name]) return true;

      var errorId = input.getAttribute('aria-describedby');
      var errorEl = errorId ? document.getElementById(errorId) : null;
      var message = validators[name](input.value);

      if (message) {
        input.classList.add('is-invalid');
        if (errorEl) errorEl.textContent = message;
        return false;
      } else {
        input.classList.remove('is-invalid');
        if (errorEl) errorEl.textContent = '';
        return true;
      }
    }

    var requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(function (field) {
      field.addEventListener('blur',   function () { validateField(field); });
      field.addEventListener('input',  function () { if (field.classList.contains('is-invalid')) validateField(field); });
      field.addEventListener('change', function () { if (field.classList.contains('is-invalid')) validateField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      successBanner.hidden = true;

      var valid = true;
      requiredFields.forEach(function (field) {
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        var firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      saveLead(form);
      showContactSuccess(form);
    });

    function saveLead(formEl) {
      var lead = {
        id:        Date.now(),
        timestamp: new Date().toISOString(),
        name:      formEl.querySelector('#contact-name').value.trim(),
        email:     formEl.querySelector('#contact-email').value.trim(),
        phone:     formEl.querySelector('#contact-phone').value.trim(),
        company:   formEl.querySelector('#contact-company').value.trim(),
        interest:  formEl.querySelector('#contact-interest').value,
        message:   formEl.querySelector('#contact-message').value.trim()
      };

      try {
        var existing = JSON.parse(localStorage.getItem('crimsonpalace_leads') || '[]');
        existing.push(lead);
        localStorage.setItem('crimsonpalace_leads', JSON.stringify(existing));
      } catch (err) { /* storage unavailable — continue silently */ }
    }

    function speakSuccess() {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      var utterance = new SpeechSynthesisUtterance(
        'Hurray! Thank you for your submission. We will get back to you in one business day.'
      );
      utterance.rate  = 1;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }

    function showContactSuccess(formEl) {
      var name     = escapeHtml(formEl.querySelector('#contact-name').value.trim());
      var select   = formEl.querySelector('#contact-interest');
      var category = escapeHtml(select.options[select.selectedIndex].text);

      successBanner.innerHTML =
        '<strong>Enquiry received!</strong>' +
        'Thank you, ' + name + '! Your ' + category + ' enquiry has been received. ' +
        'Our team will be in touch within one business day.';

      successBanner.hidden = false;
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });

      speakSuccess();

      formEl.reset();
      form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
      form.querySelectorAll('.form-error').forEach(function (el) { el.textContent = ''; });
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }


  /* =============================================
     COPYRIGHT YEAR
     ============================================= */
  function initCopyrightYear() {
    var el = document.getElementById('copyright-year');
    if (el) el.textContent = new Date().getFullYear();
  }

}());
