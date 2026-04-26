(function () {
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const menuToggle = document.getElementById("menuToggle");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const appShell = document.querySelector(".app-shell");

  const loader = document.getElementById("pageLoader");
  const loaderType = document.getElementById("loaderType");
  const loaderProgress = document.getElementById("loaderProgress");
  const topProgress = document.getElementById("pageProgress");
  const cursorFollower = document.getElementById("cursorFollower");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      body.classList.toggle("sidebar-open");
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", function () {
      body.classList.remove("sidebar-open");
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      body.classList.remove("sidebar-open");
    }
  });

  const setNavOrder = function () {
    const navItems = Array.from(document.querySelectorAll(".sidebar .file-item, .sidebar .folder-toggle"));
    navItems.forEach(function (item, index) {
      item.style.setProperty("--nav-order", index);
    });

    const childItems = Array.from(document.querySelectorAll(".folder-children .child-file"));
    childItems.forEach(function (item, index) {
      item.style.setProperty("--child-order", index);
    });
  };
  setNavOrder();

  const folderToggles = document.querySelectorAll("[data-folder-toggle]");
  folderToggles.forEach(function (toggle) {
    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : toggle.nextElementSibling;
    if (!panel) {
      return;
    }

    const setFolderState = function (isOpen) {
      toggle.classList.toggle("is-open", isOpen);
      panel.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    const hasActiveChild = !!panel.querySelector(".file-item.active");
    if (hasActiveChild) {
      setFolderState(true);
    }

    toggle.addEventListener("click", function () {
      const isOpen = toggle.classList.contains("is-open");
      setFolderState(!isOpen);
    });
  });

  const revealHero = function () {
    const heroWordOne = document.querySelector(".hero .word-one");
    const heroWordTwo = document.querySelector(".hero .word-two");
    const heroRole = document.querySelector(".hero .hero-role-line");
    const heroCta = document.querySelector(".hero .primary-btn");

    if (!heroWordOne || !heroWordTwo || !heroRole || !heroCta) {
      return;
    }

    if (reducedMotion) {
      heroWordOne.classList.add("is-visible");
      heroWordTwo.classList.add("is-visible");
      heroRole.classList.add("is-visible");
      heroCta.classList.add("is-visible");
      body.classList.add("hero-ready");
      return;
    }

    window.setTimeout(function () {
      heroWordOne.classList.add("is-visible");
    }, 20);

    window.setTimeout(function () {
      heroWordTwo.classList.add("is-visible");
    }, 130);

    window.setTimeout(function () {
      heroRole.classList.add("is-visible");
    }, 280);

    window.setTimeout(function () {
      heroCta.classList.add("is-visible");
    }, 580);

    window.setTimeout(function () {
      body.classList.add("hero-ready");
    }, 760);
  };

  const initializeLoader = function () {
    if (!loader) {
      body.classList.add("loaded");
      revealHero();
      return;
    }

    if (reducedMotion) {
      body.classList.add("loaded");
      loader.style.display = "none";
      revealHero();
      return;
    }

    const phrase = loaderType ? loaderType.getAttribute("data-text") || "homin.dev" : "homin.dev";
    const startTime = performance.now();
    let pageReady = document.readyState === "complete";

    if (loaderProgress) {
      requestAnimationFrame(function () {
        loaderProgress.classList.add("is-animating");
      });
    }

    if (loaderType) {
      loaderType.textContent = "";
      let index = 0;
      const typeInterval = window.setInterval(function () {
        index += 1;
        loaderType.textContent = phrase.slice(0, index);
        if (index >= phrase.length) {
          window.clearInterval(typeInterval);
          window.setTimeout(attemptExit, 240);
        }
      }, 85);
    }

    const onLoad = function () {
      pageReady = true;
    };

    window.addEventListener("load", onLoad, { once: true });

    const attemptExit = function () {
      const elapsed = performance.now() - startTime;
      const minVisible = 1150;
      const maxVisible = 2250;

      if (elapsed < minVisible) {
        window.setTimeout(attemptExit, minVisible - elapsed);
        return;
      }

      if (!pageReady && elapsed < maxVisible) {
        window.setTimeout(attemptExit, 80);
        return;
      }

      loader.classList.add("is-exit");
      window.setTimeout(function () {
        body.classList.add("loaded");
        loader.setAttribute("aria-hidden", "true");
        revealHero();
      }, 420);
    };

    if (!loaderType) {
      window.setTimeout(attemptExit, 300);
    }
  };

  const setupCursorFollower = function () {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!cursorFollower || reducedMotion || !finePointer) {
      return;
    }

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let currentX = targetX;
    let currentY = targetY;
    let hoverScale = 1;

    const animateFollower = function () {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      cursorFollower.style.transform =
        "translate3d(" + currentX + "px, " + currentY + "px, 0) translate(-50%, -50%) scale(" + hoverScale + ")";
      window.requestAnimationFrame(animateFollower);
    };

    document.addEventListener("mousemove", function (event) {
      targetX = event.clientX;
      targetY = event.clientY;
      cursorFollower.classList.add("is-visible");
    });

    const interactive = document.querySelectorAll("a, button, .service-tab");
    interactive.forEach(function (element) {
      element.addEventListener("mouseenter", function () {
        hoverScale = 1.5;
        cursorFollower.classList.add("is-hovering");
      });

      element.addEventListener("mouseleave", function () {
        hoverScale = 1;
        cursorFollower.classList.remove("is-hovering");
      });
    });

    animateFollower();
  };

  const setupSectionTypewriter = function () {
    const commentTargets = Array.from(document.querySelectorAll(".section-comment"));
    commentTargets.forEach(function (el) {
      if (!el.dataset.fullText) {
        el.dataset.fullText = el.textContent;
      }
      if (!reducedMotion) {
        el.textContent = "";
      }
    });

    const typeText = function (el) {
      if (!el || el.dataset.typed === "true") {
        return;
      }

      const fullText = el.dataset.fullText || "";
      if (reducedMotion) {
        el.textContent = fullText;
        el.dataset.typed = "true";
        return;
      }

      let index = 0;
      el.classList.add("is-typing");
      const timer = window.setInterval(function () {
        index += 1;
        el.textContent = fullText.slice(0, index);
        if (index >= fullText.length) {
          window.clearInterval(timer);
          el.classList.remove("is-typing");
          el.dataset.typed = "true";
        }
      }, 30);
    };

    if (reducedMotion || !("IntersectionObserver" in window)) {
      commentTargets.forEach(typeText);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          typeText(entry.target);
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.48,
      }
    );

    commentTargets.forEach(function (target) {
      observer.observe(target);
    });
  };

  const setupRevealAnimations = function () {
    const applyStagger = function (containerSelector, itemSelector, step) {
      document.querySelectorAll(containerSelector).forEach(function (container) {
        const items = Array.from(container.querySelectorAll(itemSelector));
        items.forEach(function (item, index) {
          item.classList.add("reveal-item");
          item.style.setProperty("--reveal-delay", index * step + "ms");
        });
      });
    };

    applyStagger(".project-grid", ".project-card", 80);
    applyStagger(".testimonials-set:not(.is-clone)", ".testimonial-card", 80);

    const revealItems = Array.from(document.querySelectorAll(".reveal-item"));

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("in-view");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
      }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  };

  const setupTestimonialCarousel = function () {
    const row = document.querySelector("[data-testimonials-carousel]");
    if (!row) {
      return;
    }

    const track = row.querySelector(".testimonials-track");
    const originalSet = row.querySelector(".testimonials-set");
    if (!track || !originalSet) {
      return;
    }

    if (!track.querySelector(".testimonials-set.is-clone")) {
      const cloneSet = originalSet.cloneNode(true);
      cloneSet.classList.add("is-clone");
      cloneSet.setAttribute("aria-hidden", "true");
      cloneSet.querySelectorAll("a, button, input, textarea, select").forEach(function (element) {
        element.setAttribute("tabindex", "-1");
      });
      track.appendChild(cloneSet);
    }

    const mobileQuery = window.matchMedia("(max-width: 700px)");
    let isDragging = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;
    let resumeTimer = 0;

    const pauseTrack = function () {
      window.clearTimeout(resumeTimer);
      track.classList.add("is-paused");
    };

    const resumeTrackSoon = function () {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        if (!isDragging) {
          track.classList.remove("is-paused");
        }
      }, 2000);
    };

    row.addEventListener("pointerdown", function (event) {
      if (mobileQuery.matches || (event.pointerType === "mouse" && event.button !== 0)) {
        return;
      }

      isDragging = true;
      didDrag = false;
      startX = event.clientX;
      startScrollLeft = row.scrollLeft;
      row.classList.add("is-dragging");
      pauseTrack();
      row.setPointerCapture(event.pointerId);
    });

    row.addEventListener("pointermove", function (event) {
      if (!isDragging) {
        return;
      }

      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) {
        didDrag = true;
      }

      row.scrollLeft = startScrollLeft - distance;
      event.preventDefault();
    });

    const endDrag = function (event) {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      row.classList.remove("is-dragging");
      if (row.hasPointerCapture(event.pointerId)) {
        row.releasePointerCapture(event.pointerId);
      }
      resumeTrackSoon();
    };

    row.addEventListener("pointerup", endDrag);
    row.addEventListener("pointercancel", endDrag);

    row.addEventListener(
      "click",
      function (event) {
        if (!didDrag) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
      },
      true
    );
  };

  const setupTestimonialModal = function () {
    const triggers = Array.from(document.querySelectorAll(".testimonial-media"));
    if (!triggers.length) {
      return;
    }

    const modal = document.createElement("div");
    const modalContent = document.createElement("div");
    const closeButton = document.createElement("button");
    let closeTimer = 0;
    let lastActiveElement = null;

    modal.className = "testimonial-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-label", "Expanded testimonial image");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("role", "dialog");

    modalContent.className = "testimonial-modal-content";

    closeButton.className = "testimonial-modal-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close testimonial image");
    closeButton.textContent = "X";

    modal.appendChild(closeButton);
    modal.appendChild(modalContent);
    body.appendChild(modal);

    const getInitials = function (trigger) {
      const initials = trigger.getAttribute("data-testimonial-initials");
      if (initials) {
        return initials;
      }

      return trigger.textContent.trim().slice(0, 2).toUpperCase() || "CN";
    };

    const buildModalContent = function (trigger) {
      const triggerImage = trigger.querySelector("img");
      const imageSource =
        trigger.getAttribute("data-testimonial-image") ||
        (triggerImage ? triggerImage.currentSrc || triggerImage.src : "");

      if (imageSource) {
        const image = new Image();
        image.className = "testimonial-modal-image";
        image.src = imageSource;
        image.alt =
          trigger.getAttribute("data-testimonial-alt") ||
          (triggerImage ? triggerImage.alt : "Testimonial image");
        return image;
      }

      const placeholder = document.createElement("div");
      placeholder.className = "testimonial-modal-placeholder";
      placeholder.textContent = getInitials(trigger);
      return placeholder;
    };

    const openModal = function (trigger) {
      window.clearTimeout(closeTimer);
      lastActiveElement = document.activeElement;
      modalContent.replaceChildren(buildModalContent(trigger));
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "false");
      body.classList.add("testimonial-modal-open");

      window.requestAnimationFrame(function () {
        modal.classList.add("is-open");
        closeButton.focus({ preventScroll: true });
      });
    };

    const closeModal = function () {
      if (!modal.classList.contains("is-open")) {
        return;
      }

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      body.classList.remove("testimonial-modal-open");

      closeTimer = window.setTimeout(function () {
        modalContent.replaceChildren();
        if (lastActiveElement && typeof lastActiveElement.focus === "function") {
          lastActiveElement.focus({ preventScroll: true });
        }
      }, reducedMotion ? 0 : 300);
    };

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openModal(trigger);
      });
    });

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    closeButton.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  };

  const setupServiceTabs = function () {
    const tabGroups = document.querySelectorAll(".service-tabs");

    tabGroups.forEach(function (group) {
      const tabs = Array.from(group.querySelectorAll(".service-tab"));
      const panels = tabs
        .map(function (tab) {
          return document.getElementById(tab.getAttribute("data-target"));
        })
        .filter(Boolean);

      if (!tabs.length || !panels.length) {
        return;
      }

      const moveIndicator = function (activeTab, immediate) {
        const groupRect = group.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const x = tabRect.left - groupRect.left;
        const width = tabRect.width;

        if (immediate) {
          group.style.transition = "none";
        }

        group.style.setProperty("--indicator-x", x + "px");
        group.style.setProperty("--indicator-w", width + "px");
      };

      const switchTo = function (nextTab) {
        const targetId = nextTab.getAttribute("data-target");
        const nextPanel = document.getElementById(targetId);
        if (!nextPanel) {
          return;
        }

        const currentTab = tabs.find(function (tab) {
          return tab.classList.contains("active");
        });

        if (currentTab === nextTab) {
          return;
        }

        const currentPanel = panels.find(function (panel) {
          return panel.classList.contains("active");
        });

        tabs.forEach(function (tab) {
          tab.classList.remove("active");
          tab.setAttribute("aria-selected", "false");
        });

        nextTab.classList.add("active");
        nextTab.setAttribute("aria-selected", "true");
        moveIndicator(nextTab, false);

        if (reducedMotion || !currentPanel || currentPanel === nextPanel) {
          panels.forEach(function (panel) {
            panel.classList.remove("active");
            panel.setAttribute("aria-hidden", "true");
          });
          nextPanel.classList.add("active");
          nextPanel.setAttribute("aria-hidden", "false");
          return;
        }

        const outgoing = currentPanel;
        const incoming = nextPanel;

        incoming.classList.add("active");
        incoming.setAttribute("aria-hidden", "false");

        outgoing.animate(
          [
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
            { opacity: 0, transform: "translate3d(-24px, 0, 0)" },
          ],
          {
            duration: 250,
            easing: "ease",
            fill: "forwards",
          }
        );

        const incomingAnim = incoming.animate(
          [
            { opacity: 0, transform: "translate3d(24px, 0, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration: 250,
            easing: "ease",
            fill: "forwards",
          }
        );

        incomingAnim.onfinish = function () {
          outgoing.classList.remove("active");
          outgoing.setAttribute("aria-hidden", "true");
          outgoing.style.opacity = "";
          outgoing.style.transform = "";
          incoming.style.opacity = "";
          incoming.style.transform = "";
        };
      };

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          switchTo(tab);
        });
      });

      const initialActive = group.querySelector(".service-tab.active") || tabs[0];
      if (initialActive) {
        tabs.forEach(function (tab) {
          tab.classList.remove("active");
          tab.setAttribute("aria-selected", "false");
        });

        panels.forEach(function (panel) {
          panel.classList.remove("active");
          panel.setAttribute("aria-hidden", "true");
        });

        initialActive.classList.add("active");
        initialActive.setAttribute("aria-selected", "true");

        const startPanel = document.getElementById(initialActive.getAttribute("data-target"));
        if (startPanel) {
          startPanel.classList.add("active");
          startPanel.setAttribute("aria-hidden", "false");
        }

        moveIndicator(initialActive, true);
      }
    });
  };

  const setupInternalNavigation = function () {
    const internalLinks = document.querySelectorAll('a[href$=".html"]');

    internalLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const href = link.getAttribute("href");
        const target = link.getAttribute("target");

        if (!href || target === "_blank") {
          return;
        }

        const currentPath = window.location.pathname.split("/").pop();
        if (href === currentPath) {
          return;
        }

        event.preventDefault();

        if (topProgress) {
          topProgress.classList.add("is-active");
        }

        body.classList.add("page-fade-out");

        window.setTimeout(function () {
          window.location.href = href;
        }, 220);
      });
    });
  };

  initializeLoader();
  setupTestimonialCarousel();
  setupTestimonialModal();
  setupCursorFollower();
  setupSectionTypewriter();
  setupRevealAnimations();
  setupServiceTabs();
  setupInternalNavigation();

  if (!loader) {
    body.classList.add("loaded");
  }

  if (appShell && reducedMotion) {
    appShell.classList.remove("page-transition");
  }
})();
