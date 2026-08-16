// ui.js

const drawerHTML = `
<div class="drawer-backdrop" id="drawerBackdrop"></div>

<aside class="drawer" id="drawer">

  <!-- =========================
       DRAWER HEADER
  ========================== -->
  <div class="drawer-header">
    <div class="drawer-logo">
      DYVE<span style="opacity:.5">|</span>HACKAX
    </div>

    <button class="drawer-close" id="drawerClose" aria-label="Close navigation">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>


  <!-- =========================
       PRIMARY INTELLIGENCE
  ========================== -->
  <section class="drawer-section">

    <div class="submenu-header">
      <svg class="submenu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <span class="submenu-label">Intelligence</span>
    </div>

    <nav class="drawer-nav">

      <a href="/index.html">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span>Intel Feed</span>
      </a>

      <a href="/breaches/index.html">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0110 0v4"></path>
        </svg>
        <span>Breach Surveillance</span>
      </a>

      <a href="/dark-web/index.html">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"></path>
          <path d="M2 12h20"></path>
        </svg>
        <span>Dark Web Intelligence</span>
      </a>

      <a href="/ransomware/index.html">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>Ransomware Intelligence</span>
      </a>

      <a href="/tech/index.html">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
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

  </section>


  <div class="drawer-divider"></div>


  <!-- =========================
       ADVANCED INTELLIGENCE
  ========================== -->
  <section class="drawer-section">

    <div class="submenu-header">
      <svg class="submenu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.77z"></path>
      </svg>
      <span class="submenu-label">Advanced Intelligence</span>
    </div>

    <div class="submenu-items">

      <a href="/signals/index.html">
        <svg class="submenu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        <span>Threat Signals</span>
      </a>

      <a href="/threat-actors/index.html">
        <svg class="submenu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
          <path d="M16 3.13a4 4 0 010 7.75"></path>
        </svg>
        <span>Threat Actors</span>
      </a>

      <a href="/analysis/index.html">
        <svg class="submenu-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <span>Threat Analysis</span>
      </a>

    </div>

  </section>


  <div class="drawer-divider"></div>


  <!-- =========================
       ABOUT / SUPPORT
  ========================== -->
  <section class="drawer-section">

    <div class="submenu-header">
      <svg class="submenu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
      </svg>
      <span class="submenu-label">Dyve</span>
    </div>

    <div class="drawer-extra">

      <a href="/about-dyve/index.html">
        <svg class="extra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
          <path d="M9.5 9a3 3 0 015.5 1.5c0 2-3 2.5-3 4.5"></path>
        </svg>
        <span>About Dyve</span>
      </a>

      <a href="/about-us/index.html">
        <svg class="extra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"></path>
        </svg>
        <span>About Us</span>
      </a>

      <a href="/faq/index.html">
        <svg class="extra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>FAQ</span>
      </a>

    </div>

  </section>


  <div class="drawer-divider"></div>


  <!-- =========================
       LEGAL
  ========================== -->
  <section class="drawer-section">

    <div class="submenu-header">
      <svg class="submenu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0110 0v4"></path>
      </svg>
      <span class="submenu-label">Legal</span>
    </div>

    <div class="drawer-extra">

      <a href="/privacy-policy/index.html">
        <svg class="extra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0110 0v4"></path>
        </svg>
        <span>Privacy Policy</span>
      </a>

      <a href="/terms-of-service/index.html">
        <svg class="extra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
        <span>Terms of Service</span>
      </a>

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

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------------
  // 1. Inject HTML into placeholders
  // ----------------------------------------------------------

  const drawerContainer = document.getElementById('global-drawer');
  const headerContainer = document.getElementById('global-header');

  if (drawerContainer) {
    drawerContainer.innerHTML = drawerHTML;
  }

  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }


  // ----------------------------------------------------------
  // 2. Set Active State Based on Current URL
  // ----------------------------------------------------------

  const currentPath = window.location.pathname;


  // Highlight drawer links
  document.querySelectorAll('#global-drawer a').forEach(link => {

    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }

  });


  // Highlight top navigation
  document.querySelectorAll('.nav span').forEach(span => {

    if (span.getAttribute('data-link') === currentPath) {
      span.classList.add('active');
    }

  });


  // ----------------------------------------------------------
  // 3. Drawer Controls
  // ----------------------------------------------------------

  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const toggle = document.getElementById("menuToggle");
  const closeBtn = document.getElementById("drawerClose");


  if (toggle && drawer && backdrop) {

    const openDrawer = () => {
      drawer.classList.add("active");
      backdrop.classList.add("active");
      document.body.classList.add("drawer-open");
    };


    const closeDrawer = () => {
      drawer.classList.remove("active");
      backdrop.classList.remove("active");
      document.body.classList.remove("drawer-open");
    };


    toggle.addEventListener("click", openDrawer);

    backdrop.addEventListener("click", closeDrawer);

    if (closeBtn) {
      closeBtn.addEventListener("click", closeDrawer);
    }


    // --------------------------------------------------------
    // Swipe to Close
    // --------------------------------------------------------

    let startX = 0;

    drawer.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });


    drawer.addEventListener("touchmove", e => {

      if (e.touches[0].clientX - startX < -60) {
        closeDrawer();
      }

    });

  }


  // ----------------------------------------------------------
  // 4. Page Transitions
  // ----------------------------------------------------------

  document.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", function(e) {

      const href = this.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http")
      ) {
        return;
      }

      e.preventDefault();

      document.body.classList.add("exit");

      setTimeout(() => {
        window.location.href = href;
      }, 220);

    });

  });


  // ----------------------------------------------------------
  // 5. Top Navigation Transitions
  // ----------------------------------------------------------

  document.querySelectorAll(".nav span").forEach(item => {

    item.addEventListener("click", () => {

      const link = item.getAttribute("data-link");

      if (!link || link === "#") {
        return;
      }

      document.body.classList.add("exit");

      setTimeout(() => {
        window.location.href = link;
      }, 200);

    });

  });

});