/* =====================================================================
   OM-Time — editorial animation layer.
   Splash, scroll progress, kinetic hero, asymmetric trust grid,
   horizontal pinned methodology, sticky day rail, editorial
   testimonials, FAQ, footer.
   ===================================================================== */

(function () {
  'use strict';

  var prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = function () { return window.innerWidth < 900; };
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  function waitForReact(cb, attempts) {
    attempts = attempts || 0;
    var root = document.getElementById('root');
    if (root && root.children.length > 0 && root.querySelector('[data-animate], [data-screen-label]')) {
      setTimeout(cb, 60);
    } else if (attempts < 80) {
      setTimeout(function () { waitForReact(cb, attempts + 1); }, 100);
    } else {
      cb();
    }
  }

  function dismissSplash() {
    var splash = document.getElementById('om-splash');
    if (!splash) return;
    setTimeout(function () {
      splash.classList.add('om-splash-out');
      setTimeout(function () { splash.remove(); }, 800);
    }, 900);
  }

  function initProgress() {
    var bar = document.getElementById('om-progress-bar');
    if (!bar) return;
    var raf = null;
    function update() {
      var doc = document.documentElement;
      var scroll = (window.scrollY || doc.scrollTop) || 0;
      var height = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.max(0, Math.min(1, scroll / height));
      bar.style.width = (pct * 100).toFixed(2) + '%';
      raf = null;
    }
    window.addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  waitForReact(function () {
    initProgress();

    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('[OM-Time anim] GSAP not loaded — revealing elements');
      document.documentElement.classList.add('om-anim-ready');
      dismissSplash();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('om-anim-ready');

    if (prefersReduced) initReducedMotion();
    else initAnimations();

    ScrollTrigger.refresh();
    setTimeout(function () { ScrollTrigger.refresh(); }, 400);
    dismissSplash();
  });

  function initReducedMotion() {
    gsap.utils.toArray('[data-animate]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1, duration: 0.4,
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
    });
    document.querySelectorAll('.om-counter-num').forEach(function (el) {
      var t = parseFloat(el.dataset.counterTarget);
      var prefix = el.dataset.counterPrefix || '';
      var suffix = el.dataset.counterSuffix || '';
      if (!isNaN(t)) el.textContent = prefix + t + suffix;
    });
  }

  function initAnimations() {
    initHeader();
    initHero();
    initTrustNumbers();
    initPainCards();
    initMethodologyLevels();
    initIntensiveDays();
    initComparisonTable();
    initSchedule();
    initSuitability();
    initTestimonials();
    initFAQ();
    initCtaBand();
    initFooter();
  }

  function initHeader() {
    var header = document.querySelector('[data-animate="header"]');
    if (!header) return;
    ScrollTrigger.create({
      start: 'top -40',
      end: 'top -200',
      onUpdate: function (self) {
        var p = self.progress;
        gsap.set(header, {
          backgroundColor: 'rgba(251,248,242,' + (0.72 + p * 0.24) + ')',
          boxShadow: '0 1px 0 rgba(27,24,64,' + (p * 0.10) + '), 0 8px 24px rgba(27,24,64,' + (p * 0.06) + ')',
          borderBottomColor: 'rgba(27,24,64,' + (p * 0.08) + ')',
        });
      },
    });
  }

  /* HERO — word-split kinetic reveal that preserves nested <span class="om-italic"> */
  function splitWords(el) {
    if (!el || el.dataset.split === '1') return [];
    el.dataset.split = '1';
    var lines = el.querySelectorAll('.om-hero-line');
    if (lines.length === 0) return [];
    var allSpans = [];
    lines.forEach(function (line) {
      var html = '';
      Array.prototype.forEach.call(line.childNodes, function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (w) {
            if (w.trim() === '') html += w;
            else html += '<span class="om-word-mask"><span>' + w + '</span></span>';
          });
        } else if (node.nodeType === 1) {
          html += '<span class="om-word-mask"><span>' + node.outerHTML + '</span></span>';
        }
      });
      line.innerHTML = html;
    });
    el.querySelectorAll('.om-word-mask > span').forEach(function (s) { allSpans.push(s); });
    return allSpans;
  }

  function initHero() {
    var h1 = document.getElementById('hero-h1');
    var words = splitWords(h1);

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    var meta = document.querySelector('.om-hero-meta');
    if (meta) tl.from(meta, { y: 16, opacity: 0, duration: 0.6 }, 0);

    if (words.length) {
      tl.from(words, { yPercent: 120, opacity: 0, duration: 0.95, stagger: 0.06 }, 0.05);
    }
    if (document.getElementById('hero-sub')) {
      tl.from('#hero-sub', { y: 28, opacity: 0, duration: 0.6 }, '-=0.55');
    }
    var ctaChildren = document.querySelectorAll('#hero-cta > *');
    if (ctaChildren.length) {
      tl.from(ctaChildren, { y: 22, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.35');
    }
    var trustChildren = document.querySelectorAll('#hero-trust > *');
    if (trustChildren.length) {
      tl.from(trustChildren, { y: 14, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.3');
    }

    var card = document.querySelector('[data-animate="hero-card"]');
    var stage = document.querySelector('.om-hero-card-stage');
    if (stage) {
      tl.from(stage, {
        scale: 0.92, opacity: 0, duration: 1.0, ease: 'power3.out',
      }, 0.2);
    }
    var chip = document.querySelector('.om-hero-chip');
    if (chip) tl.from(chip, { y: 24, opacity: 0, duration: 0.6 }, '-=0.4');

    var foot = document.querySelector('.om-hero-foot');
    if (foot) tl.from(foot.children, { y: 12, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.3');

    var counterEl = card && card.querySelector('.om-counter-num');
    if (counterEl) {
      var target = parseFloat(counterEl.dataset.counterTarget) || 0;
      var prefix = counterEl.dataset.counterPrefix || '';
      var suffix = counterEl.dataset.counterSuffix || '';
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2.0, ease: 'power2.out', delay: 0.7,
        onUpdate: function () { counterEl.textContent = prefix + Math.round(obj.val) + suffix; },
      });
    }

    if (stage && !isMobile()) {
      gsap.to(stage, {
        yPercent: -18, ease: 'none',
        scrollTrigger: {
          trigger: '.om-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }
  }

  function runCounter(el) {
    var target = parseFloat(el.dataset.counterTarget);
    if (isNaN(target)) return;
    var prefix = el.dataset.counterPrefix || '';
    var suffix = el.dataset.counterSuffix || '';
    var obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target, duration: 1.9, ease: 'power2.out',
          onUpdate: function () { el.textContent = prefix + Math.round(obj.val) + suffix; },
        });
      },
    });
  }

  function initTrustNumbers() {
    var section = document.querySelector('[data-screen-label="Marketing site / Trust numbers"]');
    if (!section) return;

    var head = section.querySelector('[data-animate="trust-head"]');
    if (head) {
      gsap.from(head.children, {
        y: 32, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: head, start: 'top 82%' },
      });
    }

    ScrollTrigger.batch('[data-animate="trust-card"]', {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 80, scale: 0.94, opacity: 0,
          duration: 0.85, stagger: 0.12, ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      },
    });

    section.querySelectorAll('.om-counter-num').forEach(runCounter);
  }

  function initPainCards() {
    var head = document.querySelector('[data-animate="pains-head"]');
    if (head) {
      gsap.from(head.children, {
        y: 26, opacity: 0, duration: 0.65, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: head, start: 'top 82%' },
      });
    }

    ScrollTrigger.batch('[data-animate="pain-card"]', {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 80, scale: 0.94, opacity: 0,
          duration: 0.85, stagger: 0.12, ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      },
    });
  }

  function initMethodologyLevels() {
    var pin = document.querySelector('[data-method-pin]');
    var track = document.querySelector('[data-method-track]');
    var counter = document.querySelector('[data-method-counter]');
    var progress = document.querySelector('[data-method-progress]');
    var heading = document.querySelector('[data-animate="method-heading"]');
    var closer = document.querySelector('[data-animate="method-closer"]');

    if (heading) {
      gsap.from(heading, {
        y: 28, opacity: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: heading, start: 'top 82%' },
      });
    }
    if (closer) {
      gsap.from(closer, {
        opacity: 0, y: 24, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: closer, start: 'top 88%' },
      });
    }

    if (!pin || !track || isMobile()) return;

    var panels = track.querySelectorAll('[data-method-panel]');
    if (!panels.length) return;

    function computeDistance() {
      var last = panels[panels.length - 1];
      var lastCenter = last.offsetLeft + last.offsetWidth / 2;
      var d = lastCenter - window.innerWidth / 2;
      return d > 0 ? d : 0;
    }

    var distance = computeDistance();
    if (distance < 50) return;

    gsap.to(track, {
      x: function () { return -computeDistance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: function () { return '+=' + (computeDistance() + 160); },
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;
          if (progress) progress.style.width = (p * 100).toFixed(2) + '%';
          if (counter && panels.length) {
            var idx = Math.min(panels.length - 1, Math.round(p * (panels.length - 1)));
            var n = String(idx + 1).padStart(2, '0');
            if (counter.textContent !== n) counter.textContent = n;
          }
        },
      },
    });
  }

  function setActiveDay(i, items) {
    items.forEach(function (it, j) {
      if (j === i) it.classList.add('is-active');
      else it.classList.remove('is-active');
    });
  }

  function initIntensiveDays() {
    var head = document.querySelector('[data-animate="intensive-head"]');
    if (head) {
      gsap.from(head.children, {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: head, start: 'top 82%' },
      });
    }

    ScrollTrigger.batch('[data-animate="day-card"]', {
      start: 'top 86%',
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 90, opacity: 0, scale: 0.94, duration: 0.85,
          stagger: 0.16, ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
        batch.forEach(function (card, i) {
          gsap.fromTo(card,
            { boxShadow: '0 0 0 rgba(242,193,46,0)' },
            {
              boxShadow: '0 0 48px rgba(242,193,46,0.28)',
              duration: 0.65, delay: i * 0.16 + 0.4,
              yoyo: true, repeat: 1, ease: 'power2.inOut',
              clearProps: 'boxShadow',
            });
        });
      },
    });

    var cards = document.querySelectorAll('[data-day-card]');
    var items = document.querySelectorAll('[data-day-item]');
    cards.forEach(function (card, i) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: function () { setActiveDay(i, items); },
        onEnterBack: function () { setActiveDay(i, items); },
      });
    });
    items.forEach(function (it, i) {
      it.addEventListener('click', function () {
        var target = cards[i];
        if (!target) return;
        var top = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });

    var footer = document.querySelector('[data-animate="intensive-footer"]');
    if (footer) {
      gsap.from(footer, {
        scale: 0.95, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: footer, start: 'top 88%' },
      });
    }
  }

  function initComparisonTable() {
    var section = document.querySelector('[data-screen-label="Marketing site / Comparison"]');
    if (!section) return;
    var headers = section.querySelectorAll('[data-animate="compare-header"]');
    if (headers.length) {
      gsap.from(headers, {
        y: -18, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 82%' },
      });
    }
    ScrollTrigger.batch('[data-animate="compare-row"]', {
      start: 'top 92%',
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out',
          clearProps: 'transform,opacity',
        });
      },
    });
  }

  function initSchedule() {
    var section = document.querySelector('[data-screen-label="Marketing site / Schedule"]');
    if (!section) return;
    var head = section.querySelector('h2');
    if (head) {
      gsap.from(head, {
        y: 24, opacity: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 82%' },
      });
    }
    var chips = document.querySelectorAll('[data-animate="schedule-chip"]');
    if (chips.length) {
      gsap.from(chips, {
        y: -16, opacity: 0, scale: 0.9, duration: 0.45,
        stagger: 0.08, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: chips[0], start: 'top 86%' },
        clearProps: 'transform,opacity',
      });
    }
    ScrollTrigger.batch('[data-animate="schedule-item"]', {
      start: 'top 90%',
      onEnter: function (batch) {
        gsap.from(batch, {
          x: isMobile() ? 0 : 40,
          y: isMobile() ? 24 : 0,
          opacity: 0, duration: 0.55,
          stagger: 0.1, ease: 'power2.out',
          clearProps: 'transform,opacity',
        });
      },
    });
  }

  function initSuitability() {
    var section = document.querySelector('[data-screen-label="Marketing site / Suitability"]');
    if (!section) return;
    var head = section.querySelector('h2');
    if (head) {
      gsap.from([head, head.nextElementSibling].filter(Boolean), {
        y: 24, opacity: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 82%' },
      });
    }
    var left = document.querySelector('[data-animate="suit-left"]');
    var right = document.querySelector('[data-animate="suit-right"]');
    if (left && right) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: left, start: 'top 80%' },
      });
      tl.from(left, {
          x: isMobile() ? 0 : -60,
          y: isMobile() ? 40 : 0,
          opacity: 0, duration: 0.7, ease: 'power2.out',
        })
        .from(right, {
          x: isMobile() ? 0 : 60,
          y: isMobile() ? 40 : 0,
          opacity: 0, duration: 0.7, ease: 'power2.out',
        }, 0)
        .from('[data-animate="suit-item"]', {
          x: 18, opacity: 0, duration: 0.4, stagger: 0.06,
          ease: 'power2.out', clearProps: 'transform,opacity',
        }, '-=0.35');
    }
  }

  function initTestimonials() {
    var head = document.querySelector('[data-animate="testimonials-head"]');
    if (head) {
      gsap.from(head.children, {
        y: 28, opacity: 0, duration: 0.65, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: head, start: 'top 82%' },
      });
    }
    var marquee = document.querySelector('[data-animate="testimonial-marquee"]');
    if (marquee) {
      gsap.from(marquee, {
        opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: marquee, start: 'top 88%', once: true },
        clearProps: 'transform,opacity',
      });
    }
  }

  function initFAQ() {
    var head = document.querySelector('[data-animate="faq-head"]');
    if (head) {
      gsap.from(head.children, {
        y: 24, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: head, start: 'top 82%' },
      });
    }
    ScrollTrigger.batch('[data-animate="faq-item"]', {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 32, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out',
          clearProps: 'transform,opacity',
        });
      },
    });
    window.omAnimateFaqOpen = function (contentEl, isOpening) {
      if (!contentEl) return;
      gsap.killTweensOf(contentEl);
      if (isOpening) {
        gsap.set(contentEl, { display: 'block', overflow: 'hidden' });
        gsap.fromTo(contentEl,
          { height: 0, opacity: 0 },
          {
            height: 'auto', opacity: 1, duration: 0.42, ease: 'power2.out',
            onComplete: function () {
              gsap.set(contentEl, { height: 'auto', overflow: 'visible' });
              ScrollTrigger.refresh();
            },
          });
      } else {
        gsap.set(contentEl, { overflow: 'hidden' });
        gsap.to(contentEl, {
          height: 0, opacity: 0, duration: 0.32, ease: 'power2.in',
          onComplete: function () { ScrollTrigger.refresh(); },
        });
      }
    };
  }

  function initCtaBand() {
    var card = document.querySelector('[data-animate="cta-band"]');
    if (!card) return;
    var headline = card.querySelector('[data-animate="cta-content"]');
    var side = card.querySelector('[data-animate="cta-side"]');
    var tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 78%' },
    });
    if (headline) tl.from(headline, { y: 40, opacity: 0, duration: 0.85, ease: 'power3.out' });
    if (side) tl.from(side.children, {
      y: 24, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
    }, '-=0.5');
  }

  function initFooter() {
    var columns = document.querySelectorAll('[data-animate="footer-col"]');
    if (!columns.length) return;
    gsap.from(columns, {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: columns[0], start: 'top 92%' },
      clearProps: 'transform,opacity',
    });
  }
})();
