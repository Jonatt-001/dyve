// ui.js

const drawerHTML = `
<div class="drawer-backdrop" id="drawerBackdrop"></div>

<aside
  class="drawer"
  id="drawer"
  aria-label="DYVE|HACKAX navigation"
>

  <!-- =========================
       DRAWER HEADER
  ========================== -->
  <div class="drawer-header">

    <div class="drawer-logo">
      DYVE<span style="opacity:.5">|</span>HACKAX
    </div>

    <button
      class="drawer-close"
      id="drawerClose"
      type="button"
      aria-label="Close navigation"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

  </div>


  <!-- ========================================================
       INTELLIGENCE
  ========================================================= -->
  <section
    class="drawer-section open"
    data-section="intelligence"
  >

    <div
      class="submenu-header"
      role="button"
      tabindex="0"
      aria-expanded="true"
      aria-controls="drawer-intelligence"
    >

      <svg
        class="submenu-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>

      <span class="submenu-label">
        Intelligence
      </span>

    </div>


    <div
      class="drawer-section-content"
      id="drawer-intelligence"
    >

      <div class="drawer-section-content-inner">

        <nav
          class="drawer-nav"
          aria-label="Intelligence"
        >

          <a href="/index.html">

            <svg
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>

            <span>Intel Feed</span>

          </a>


          <a href="/intelligence/index.html">

            <svg
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              ></circle>

              <path
                d="M12 7v5l3 2"
              ></path>

              <path
                d="M8.5 3.8A9 9 0 0118.2 5"
              ></path>

              <path
                d="M5.8 6.2A9 9 0 003 12"
              ></path>

              <path
                d="M5.8 17.8A9 9 0 0012 21"
              ></path>

              <path
                d="M18.2 17.8A9 9 0 0021 12"
              ></path>
            </svg>

            <span>Intelligence Hub</span>

          </a>


          <a href="/breaches/index.html">

            <svg
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
              ></rect>

              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>

            <span>Breach Surveillance</span>

          </a>


          <a href="/dark-web/index.html">

            <svg
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              ></circle>

              <path
                d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"
              ></path>

              <path d="M2 12h20"></path>
            </svg>

            <span>Dark Web Intelligence</span>

          </a>


          <a href="/ransomware/index.html">

            <svg
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              ></path>

              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              ></line>

              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
              ></line>
            </svg>

            <span>Ransomware Intelligence</span>

          </a>


          <a href="/tech/index.html">

            <svg
              class="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
              ></rect>

              <rect
                x="9"
                y="9"
                width="6"
                height="6"
              ></rect>

              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>

              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>

              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>

              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>

            <span>Latest on Tech</span>

          </a>

        </nav>

      </div>

    </div>

  </section>


  <!-- ========================================================
       ADVANCED INTELLIGENCE
  ========================================================= -->
  <section
    class="drawer-section"
    data-section="advanced"
  >

    <div
      class="submenu-header"
      role="button"
      tabindex="0"
      aria-expanded="false"
      aria-controls="drawer-advanced"
    >

      <svg
        class="submenu-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.77z"
        ></path>
      </svg>

      <span class="submenu-label">
        Advanced Intelligence
      </span>

    </div>


    <div
      class="drawer-section-content"
      id="drawer-advanced"
    >

      <div class="drawer-section-content-inner">

        <div class="submenu-items">

          <a href="/signals/index.html">

            <svg
              class="submenu-item-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>

            <span>Threat Signals</span>

          </a>


          <a href="/threat-actors/index.html">

            <svg
              class="submenu-item-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
              ></path>

              <circle
                cx="9"
                cy="7"
                r="4"
              ></circle>

              <path
                d="M23 21v-2a4 4 0 00-3-3.87"
              ></path>

              <path
                d="M16 3.13a4 4 0 010 7.75"
              ></path>
            </svg>

            <span>Threat Actors</span>

          </a>


          <a href="/analysis/index.html">

            <svg
              class="submenu-item-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <line
                x1="18"
                y1="20"
                x2="18"
                y2="10"
              ></line>

              <line
                x1="12"
                y1="20"
                x2="12"
                y2="4"
              ></line>

              <line
                x1="6"
                y1="20"
                x2="6"
                y2="14"
              ></line>
            </svg>

            <span>Threat Analysis</span>

          </a>

        </div>

      </div>

    </div>

  </section>


  <!-- ========================================================
       REGIONAL INTELLIGENCE
  ========================================================= -->
  <section
    class="drawer-section"
    data-section="regional"
  >

    <div
      class="submenu-header"
      role="button"
      tabindex="0"
      aria-expanded="false"
      aria-controls="drawer-regional"
    >

      <svg
        class="submenu-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        ></circle>

        <path
          d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"
        ></path>

        <path d="M2 12h20"></path>
      </svg>

      <span class="submenu-label">
        Regional Intelligence
      </span>

    </div>


    <div
      class="drawer-section-content"
      id="drawer-regional"
    >

      <div class="drawer-section-content-inner">

        <div class="submenu-items">

          <a href="/nigeria/index.html">

            <svg
              class="submenu-item-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              ></circle>

              <path
                d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"
              ></path>

              <path d="M2 12h20"></path>
            </svg>

            <span>Nigeria Cyber Intelligence</span>

          </a>

        </div>

      </div>

    </div>

  </section>


  <!-- ========================================================
       DYVE
  ========================================================= -->
  <section
    class="drawer-section"
    data-section="dyve"
  >

    <div
      class="submenu-header"
      role="button"
      tabindex="0"
      aria-expanded="false"
      aria-controls="drawer-dyve"
    >

      <svg
        class="submenu-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        ></circle>

        <path d="M12 16v-4"></path>

        <path d="M12 8h.01"></path>
      </svg>

      <span class="submenu-label">
        Dyve
      </span>

    </div>


    <div
      class="drawer-section-content"
      id="drawer-dyve"
    >

      <div class="drawer-section-content-inner">

        <div class="drawer-extra">

          <a href="/about-dyve/index.html">

            <svg
              class="extra-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              ></circle>

              <path d="M12 16v-4"></path>

              <path d="M12 8h.01"></path>

              <path
                d="M9.5 9a3 3 0 015.5 1.5c0 2-3 2.5-3 4.5"
              ></path>
            </svg>

            <span>About Dyve</span>

          </a>


          <a href="/about-us/index.html">

            <svg
              class="extra-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
              ></path>

              <circle
                cx="9"
                cy="7"
                r="4"
              ></circle>

              <path
                d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              ></path>
            </svg>

            <span>About Us</span>

          </a>


          <a href="/faq/index.html">

            <svg
              class="extra-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              ></circle>

              <path
                d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
              ></path>

              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
              ></line>
            </svg>

            <span>FAQ</span>

          </a>

        </div>

      </div>

    </div>

  </section>


  <!-- ========================================================
       LEGAL
  ========================================================= -->
  <section
    class="drawer-section"
    data-section="legal"
  >

    <div
      class="submenu-header"
      role="button"
      tabindex="0"
      aria-expanded="false"
      aria-controls="drawer-legal"
    >

      <svg
        class="submenu-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="11"
          width="18"
          height="11"
          rx="2"
          ry="2"
        ></rect>

        <path
          d="M7 11V7a5 5 0 0110 0v4"
        ></path>
      </svg>

      <span class="submenu-label">
        Legal
      </span>

    </div>


    <div
      class="drawer-section-content"
      id="drawer-legal"
    >

      <div class="drawer-section-content-inner">

        <div class="drawer-extra">

          <a href="/privacy-policy/index.html">

            <svg
              class="extra-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
              ></rect>

              <path
                d="M7 11V7a5 5 0 0110 0v4"
              ></path>
            </svg>

            <span>Privacy Policy</span>

          </a>


          <a href="/terms-of-service/index.html">

            <svg
              class="extra-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
              ></path>

              <polyline points="14,2 14,8 20,8"></polyline>

              <line
                x1="16"
                y1="13"
                x2="8"
                y2="13"
              ></line>

              <line
                x1="16"
                y1="17"
                x2="8"
                y2="17"
              ></line>

              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>

            <span>Terms of Service</span>

          </a>

        </div>

      </div>

    </div>

  </section>

</aside>
`;


const headerHTML = `
<div class="header">

  <div class="topbar">

    <div class="menu-icon" id="menuToggle"></div>

    <div class="logo">
      DYVE<span style="opacity:.5">|</span>HACKAX
    </div>

    <div class="icons">
      <div class="icon"></div>
      <div class="icon"></div>
    </div>

  </div>

  <div class="nav">
    <span data-link="/index.html">Feed</span>
    <span data-link="/breaches/index.html">Breaches</span>
    <span data-link="/dark-web/index.html">Dark Web</span>
    <span data-link="/ransomware/index.html">Ransomware</span>
    <span data-link="/tech/index.html">Tech</span>
  </div>

</div>
`;


// ============================================================
// INITIALIZE GLOBAL UI
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------------------------
  // 1. Inject HTML into placeholders
  // ----------------------------------------------------------

  const drawerContainer =
    document.getElementById("global-drawer");

  const headerContainer =
    document.getElementById("global-header");


  if (drawerContainer) {
    drawerContainer.innerHTML = drawerHTML;
  }


  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }


  // ----------------------------------------------------------
  // 2. Current URL
  // ----------------------------------------------------------

  const normalizePath = path => {

    if (!path) {
      return "/";
    }

    let normalized = path;

    try {
      normalized = decodeURIComponent(normalized);
    } catch (error) {
      // Keep original path if decoding fails.
    }

    normalized = normalized.split("?")[0];
    normalized = normalized.split("#")[0];

    if (normalized.length > 1) {
      normalized = normalized.replace(/\/+$/, "");
    }

    return normalized || "/";
  };


  const currentPath =
    normalizePath(window.location.pathname);


  // ----------------------------------------------------------
  // 3. Drawer Elements
  // ----------------------------------------------------------

  const drawer =
    document.getElementById("drawer");

  const backdrop =
    document.getElementById("drawerBackdrop");

  const toggle =
    document.getElementById("menuToggle");

  const closeBtn =
    document.getElementById("drawerClose");


  // ----------------------------------------------------------
  // 4. Active Drawer Link
  // ----------------------------------------------------------

  const drawerLinks =
    document.querySelectorAll("#global-drawer a");


  let activeSection = null;


  drawerLinks.forEach(link => {

    const href =
      link.getAttribute("href");


    if (!href) {
      return;
    }


    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }


    const linkPath =
      normalizePath(href);


    if (linkPath === currentPath) {

      link.classList.add("active");


      const section =
        link.closest(".drawer-section");


      if (section) {
        activeSection = section;
      }

    }

  });


  // ----------------------------------------------------------
  // 5. Accordion System
  // ----------------------------------------------------------

  const drawerSections =
    document.querySelectorAll(
      "#global-drawer .drawer-section"
    );


  const setSectionState = (
    section,
    shouldOpen,
    animate = true
  ) => {

    if (!section) {
      return;
    }


    const header =
      section.querySelector(":scope > .submenu-header");


    if (!header) {
      return;
    }


    if (shouldOpen) {

      section.classList.add("open");

      header.setAttribute(
        "aria-expanded",
        "true"
      );

    } else {

      section.classList.remove("open");

      header.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  };


  const openSection = section => {

    if (!section) {
      return;
    }


    drawerSections.forEach(otherSection => {

      if (otherSection !== section) {
        setSectionState(
          otherSection,
          false
        );
      }

    });


    setSectionState(
      section,
      true
    );

  };


  const toggleSection = section => {

    if (!section) {
      return;
    }


    const isOpen =
      section.classList.contains("open");


    if (isOpen) {

      setSectionState(
        section,
        false
      );

    } else {

      openSection(section);

    }

  };


  // ----------------------------------------------------------
  // 6. Section Click / Keyboard Controls
  // ----------------------------------------------------------

  drawerSections.forEach(section => {

    const header =
      section.querySelector(
        ":scope > .submenu-header"
      );


    if (!header) {
      return;
    }


    header.addEventListener(
      "click",
      event => {

        event.preventDefault();

        toggleSection(section);

      }
    );


    header.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          toggleSection(section);

        }

      }
    );

  });


  // ----------------------------------------------------------
  // 7. Initial Accordion State
  // ----------------------------------------------------------

  if (activeSection) {

    openSection(activeSection);

  } else {

    const intelligenceSection =
      document.querySelector(
        '#global-drawer .drawer-section[data-section="intelligence"]'
      );


    if (intelligenceSection) {
      openSection(intelligenceSection);
    }

  }


  // ----------------------------------------------------------
  // 8. Drawer Controls
  // ----------------------------------------------------------

  const openDrawer = () => {

    if (!drawer || !backdrop) {
      return;
    }


    drawer.classList.add("active");

    backdrop.classList.add("active");

    document.body.classList.add(
      "drawer-open"
    );


    if (toggle) {
      toggle.setAttribute(
        "aria-expanded",
        "true"
      );
    }

  };


  const closeDrawer = () => {

    if (!drawer || !backdrop) {
      return;
    }


    drawer.classList.remove("active");

    backdrop.classList.remove("active");

    document.body.classList.remove(
      "drawer-open"
    );


    if (toggle) {
      toggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }

  };


  if (toggle && drawer && backdrop) {

    toggle.setAttribute(
      "role",
      "button"
    );

    toggle.setAttribute(
      "tabindex",
      "0"
    );

    toggle.setAttribute(
      "aria-label",
      "Open navigation"
    );

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );


    toggle.addEventListener(
      "click",
      openDrawer
    );


    toggle.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          openDrawer();

        }

      }
    );


    backdrop.addEventListener(
      "click",
      closeDrawer
    );


    if (closeBtn) {

      closeBtn.addEventListener(
        "click",
        closeDrawer
      );

    }


    // --------------------------------------------------------
    // Swipe To Close
    // --------------------------------------------------------

    let startX = 0;
    let startY = 0;


    drawer.addEventListener(
      "touchstart",
      event => {

        if (
          !event.touches ||
          !event.touches.length
        ) {
          return;
        }


        startX =
          event.touches[0].clientX;

        startY =
          event.touches[0].clientY;

      },
      {
        passive: true
      }
    );


    drawer.addEventListener(
      "touchend",
      event => {

        if (
          !event.changedTouches ||
          !event.changedTouches.length
        ) {
          return;
        }


        const endX =
          event.changedTouches[0].clientX;

        const endY =
          event.changedTouches[0].clientY;


        const deltaX =
          endX - startX;

        const deltaY =
          endY - startY;


        if (
          deltaX < -70 &&
          Math.abs(deltaX) > Math.abs(deltaY)
        ) {

          closeDrawer();

        }

      },
      {
        passive: true
      }
    );

  }


  // ----------------------------------------------------------
  // 9. Close Drawer With Escape
  // ----------------------------------------------------------

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        drawer &&
        drawer.classList.contains("active")
      ) {

        closeDrawer();

      }

    }
  );


  // ----------------------------------------------------------
  // 10. Page Transitions
  // ----------------------------------------------------------

  document.querySelectorAll("a").forEach(link => {

    link.addEventListener(
      "click",
      function(event) {

        const href =
          this.getAttribute("href");


        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("//") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          return;
        }


        if (
          this.target === "_blank" ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }


        event.preventDefault();


        // Close drawer before navigation.
        if (
          drawer &&
          drawer.classList.contains("active")
        ) {

          closeDrawer();

        }


        document.body.classList.add(
          "exit"
        );


        setTimeout(
          () => {

            window.location.href =
              href;

          },
          220
        );

      }
    );

  });


  // ----------------------------------------------------------
  // 11. Top Navigation
  // ----------------------------------------------------------

  document
    .querySelectorAll(".nav span")
    .forEach(item => {

      const link =
        item.getAttribute("data-link");


      if (
        link &&
        normalizePath(link) === currentPath
      ) {

        item.classList.add("active");

      }


      item.addEventListener(
        "click",
        () => {

          const destination =
            item.getAttribute("data-link");


          if (
            !destination ||
            destination === "#"
          ) {
            return;
          }


          if (
            normalizePath(destination) ===
            currentPath
          ) {
            return;
          }


          document.body.classList.add(
            "exit"
          );


          setTimeout(
            () => {

              window.location.href =
                destination;

            },
            200
          );

        }
      );

    });


  // ----------------------------------------------------------
  // 12. Prevent Background Scroll While Drawer Is Open
  // ----------------------------------------------------------

  let previousScrollY = 0;


  const observer =
    new MutationObserver(() => {

      if (
        drawer &&
        drawer.classList.contains("active")
      ) {

        if (
          !document.body.dataset.drawerLocked
        ) {

          previousScrollY =
            window.scrollY;

          document.body.dataset.drawerLocked =
            "true";

        }

      } else {

        if (
          document.body.dataset.drawerLocked
        ) {

          delete document.body.dataset.drawerLocked;

        }

      }

    });


  if (drawer) {

    observer.observe(
      drawer,
      {
        attributes: true,
        attributeFilter: ["class"]
      }
    );

  }

});