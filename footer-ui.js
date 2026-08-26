/*
 * ============================================================
 * DYVE GLOBAL FOOTER UI
 * ============================================================
 *
 * Reusable footer for:
 *   - Dyve
 *   - Dyve HackaX
 *   - Dyve Tech
 *
 * Required HTML:
 *
 *   <div id="global-footer"></div>
 *   <script src="/footer-ui.js"></script>
 *
 * Optional configuration BEFORE footer-ui.js:
 *
 *   <script>
 *     window.DYVE_FOOTER = {
 *       brand: "HACKAX",
 *       statusService: "HackaX Intelligence"
 *     };
 *   </script>
 *
 * ============================================================
 */

(() => {
  "use strict";

  if (window.__DYVE_GLOBAL_FOOTER__) {
    return;
  }

  window.__DYVE_GLOBAL_FOOTER__ = true;


  /* ==========================================================
     CONFIGURATION
  ========================================================== */

  const config = {
    mount:
      "#global-footer",

    brand:
      window.DYVE_FOOTER?.brand ||
      "HACKAX",

    statusService:
      window.DYVE_FOOTER?.statusService ||
      "HackaX Intelligence",

    statusPage:
      "https://status.dyve.online/",

    statusApi:
      "https://status.dyve.online/api/status",

    heartbeatApi:
      "https://status.dyve.online/api/heartbeat"
  };


  /* ==========================================================
     MARKUP
  ========================================================== */

  const footerHTML = `

    <footer
      class="dyve-global-footer"
      data-dyve-footer
    >

      <!-- ATMOSPHERE -->

      <div
        class="dyve-footer-atmosphere"
        aria-hidden="true"
      >

        <div class="dyve-footer-ambient-glow"></div>

        <div class="dyve-footer-grid"></div>

        <div class="dyve-footer-scanline"></div>

      </div>


      <!-- TOP SIGNAL -->

      <div
        class="dyve-footer-signal"
        aria-hidden="true"
      >

        <span></span>
        <i></i>
        <span></span>

      </div>


      <div class="dyve-footer-shell">


        <!-- ==================================================
             IDENTITY
        ================================================== -->

        <section
          class="dyve-footer-identity"
          aria-label="Dyve identity"
        >


          <!-- ORBITAL MARK -->

          <div
            class="dyve-footer-orbital"
            aria-hidden="true"
          >

            <div class="dyve-footer-orbital-halo"></div>


            <div
              class="dyve-footer-orbit dyve-footer-orbit-a"
            >
              <span></span>
            </div>


            <div
              class="dyve-footer-orbit dyve-footer-orbit-b"
            >
              <span></span>
            </div>


            <div
              class="dyve-footer-orbit dyve-footer-orbit-c"
            >
              <span></span>
            </div>


            <div class="dyve-footer-orbital-ring"></div>


            <div class="dyve-footer-orbital-core">

              <svg
                viewBox="0 0 200 200"
                role="presentation"
              >

                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  opacity=".76"
                />

                <ellipse
                  cx="100"
                  cy="100"
                  rx="76"
                  ry="31"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                  opacity=".72"
                />

                <ellipse
                  cx="100"
                  cy="100"
                  rx="31"
                  ry="76"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                  opacity=".72"
                />

                <ellipse
                  cx="100"
                  cy="100"
                  rx="56"
                  ry="76"
                  fill="none"
                  stroke="currentColor"
                  stroke-width=".7"
                  opacity=".42"
                  transform="rotate(-34 100 100)"
                />

                <polygon
                  points="100,61 130,130 70,130"
                  fill="currentColor"
                  opacity=".94"
                />

              </svg>

            </div>


            <div class="dyve-footer-orbital-crosshair"></div>

          </div>


          <!-- MICRO LABEL -->

          <div class="dyve-footer-eyebrow">

            <span class="dyve-footer-eyebrow-line"></span>

            <span>
              INTELLIGENCE NETWORK
            </span>

            <span class="dyve-footer-eyebrow-line"></span>

          </div>


          <!-- BRAND -->

          <div class="dyve-footer-brand">

            <span class="dyve-footer-brand-main">
              DYVE
            </span>

            <span
              class="dyve-footer-brand-divider"
              aria-hidden="true"
            >
              //
            </span>

            <span class="dyve-footer-brand-product">
              ${escapeHtml(config.brand)}
            </span>

          </div>


          <p class="dyve-footer-description">

            Cyber intelligence, security reporting
            and threat analysis.

            <br>

            <span>
              Monitor. Decode. Understand.
            </span>

          </p>


          <!-- ACTIONS -->

          <div class="dyve-footer-actions">

            <a
              href="/signals/"
              class="dyve-footer-button dyve-footer-button-primary"
            >

              <span>
                Enter Intelligence
              </span>

              <span
                class="dyve-footer-button-arrow"
                aria-hidden="true"
              >
                →
              </span>

            </a>


            <a
              href="/contact/"
              class="dyve-footer-button dyve-footer-button-secondary"
            >

              <span>
                Contact Unit
              </span>

              <span
                class="dyve-footer-button-corner"
                aria-hidden="true"
              ></span>

            </a>

          </div>

        </section>


        <!-- ==================================================
             NAVIGATION
        ================================================== -->

        <nav
          class="dyve-footer-navigation"
          aria-label="Footer navigation"
        >


          <!-- INTELLIGENCE -->

          <div class="dyve-footer-column">

            <div class="dyve-footer-column-index">
              01
            </div>

            <h2>
              Intelligence
            </h2>

            <div class="dyve-footer-links">

              <a href="/signals/">
                <span>Threat Signals</span>
                <i>↗</i>
              </a>

              <a href="/dark-web/">
                <span>Dark Web</span>
                <i>↗</i>
              </a>

              <a href="/breaches/">
                <span>Breaches</span>
                <i>↗</i>
              </a>

              <a href="/ransomware/">
                <span>Ransomware</span>
                <i>↗</i>
              </a>

              <a href="/threat-actors/">
                <span>Threat Actors</span>
                <i>↗</i>
              </a>

            </div>

          </div>


          <!-- RESEARCH -->

          <div class="dyve-footer-column">

            <div class="dyve-footer-column-index">
              02
            </div>

            <h2>
              Research
            </h2>

            <div class="dyve-footer-links">

              <a href="/analysis/">
                <span>Threat Analysis</span>
                <i>↗</i>
              </a>

              <a href="/tech/">
                <span>Technology</span>
                <i>↗</i>
              </a>

              <a href="/vulnerabilities/">
                <span>Vulnerabilities</span>
                <i>↗</i>
              </a>

              <a href="/malware/">
                <span>Malware</span>
                <i>↗</i>
              </a>

              <a href="/ai-security/">
                <span>AI Security</span>
                <i>↗</i>
              </a>

            </div>

          </div>


          <!-- ABOUT -->

          <div class="dyve-footer-column">

            <div class="dyve-footer-column-index">
              03
            </div>

            <h2>
              About
            </h2>

            <div class="dyve-footer-links">

              <a href="/about-us/">
                <span>About Dyve</span>
                <i>↗</i>
              </a>

              <a href="/editorial-policy/">
                <span>Editorial Policy</span>
                <i>↗</i>
              </a>

              <a href="/methodology/">
                <span>Methodology</span>
                <i>↗</i>
              </a>

              <a href="/contact/">
                <span>Contact</span>
                <i>↗</i>
              </a>

              <a href="/faq/">
                <span>FAQ</span>
                <i>↗</i>
              </a>

            </div>

          </div>


          <!-- LEGAL -->

          <div class="dyve-footer-column">

            <div class="dyve-footer-column-index">
              04
            </div>

            <h2>
              Legal
            </h2>

            <div class="dyve-footer-links">

              <a href="/privacy-policy/">
                <span>Privacy</span>
                <i>↗</i>
              </a>

              <a href="/terms-of-service/">
                <span>Terms</span>
                <i>↗</i>
              </a>

              <a href="/corrections/">
                <span>Corrections</span>
                <i>↗</i>
              </a>

              <a href="/feed.xml">
                <span>RSS Feed</span>
                <i>↗</i>
              </a>

              <a href="/sitemap.xml">
                <span>Sitemap</span>
                <i>↗</i>
              </a>

            </div>

          </div>

        </nav>


        <!-- ==================================================
             SYSTEM STATUS
        ================================================== -->

        <a
          href="${config.statusPage}"
          class="dyve-footer-status"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View live Dyve system status"
        >

          <div class="dyve-footer-status-top">

            <div class="dyve-footer-status-heading">

              <span class="dyve-footer-status-live-dot"></span>

              <span>
                LIVE SYSTEM
              </span>

            </div>

            <span class="dyve-footer-status-open">
              OPEN STATUS ↗
            </span>

          </div>


          <div class="dyve-footer-status-main">

            <div class="dyve-footer-status-state">

              <span
                class="dyve-footer-status-dot checking"
                data-dyve-status-dot
                aria-hidden="true"
              ></span>

              <span
                class="dyve-footer-status-text"
                data-dyve-status-text
              >
                Checking system status
              </span>

            </div>


            <div class="dyve-footer-status-service-wrap">

              <span class="dyve-footer-status-service-label">
                SERVICE
              </span>

              <span class="dyve-footer-status-service">
                ${escapeHtml(config.statusService)}
              </span>

            </div>


            <span
              class="dyve-footer-status-arrow"
              aria-hidden="true"
            >
              ↗
            </span>

          </div>

        </a>


        <!-- ==================================================
             BOTTOM
        ================================================== -->

        <div class="dyve-footer-bottom">

          <div class="dyve-footer-copyright">

            <span>
              © ${new Date().getFullYear()} Dyve HackaX.
            </span>

            <span>
              All rights reserved.
            </span>

          </div>


          <div class="dyve-footer-bottom-center">

            <span>
              INTELLIGENCE / SECURITY / RESEARCH
            </span>

          </div>


          <div class="dyve-footer-signature">

            <span>D</span>

            <i>/</i>

            <span>H</span>

          </div>

        </div>


        <!-- FINAL EDGE -->

        <div
          class="dyve-footer-edge"
          aria-hidden="true"
        >

          <span></span>

          <i></i>

          <span></span>

        </div>

      </div>

    </footer>

  `;


  /* ==========================================================
     CSS
  ========================================================== */

  const footerCSS = `

    /*
     * ========================================================
     * BOX MODEL
     * ========================================================
     */

    .dyve-global-footer,
    .dyve-global-footer *,
    .dyve-global-footer *::before,
    .dyve-global-footer *::after {

      box-sizing:
        border-box;

    }


    /*
     * ========================================================
     * ROOT
     * ========================================================
     */

    .dyve-global-footer {

      --dyve-bg:
        #020403;

      --dyve-bg-deep:
        #010201;

      --dyve-white:
        #f1f6f4;

      --dyve-text:
        rgba(241,246,244,.72);

      --dyve-soft:
        rgba(241,246,244,.51);

      --dyve-muted:
        rgba(241,246,244,.31);

      --dyve-faint:
        rgba(241,246,244,.18);

      --dyve-line:
        rgba(241,246,244,.075);

      --dyve-line-strong:
        rgba(241,246,244,.13);

      --dyve-green:
        #00f5a0;

      --dyve-green-bright:
        #1dffb0;

      --dyve-green-soft:
        rgba(0,245,160,.08);

      --dyve-green-dark:
        #00170e;

      position:
        relative;

      width:
        100%;

      margin-top:
        74px;

      overflow:
        hidden;

      color:
        var(--dyve-white);

      background:
        radial-gradient(
          700px 360px at 50% -100px,
          rgba(0,245,160,.065),
          transparent 70%
        ),
        linear-gradient(
          180deg,
          #020403 0%,
          #010201 100%
        );

      border-top:
        1px solid
        var(--dyve-line);

      font-family:
        "Inter",
        "SF Pro Display",
        "SF Pro Text",
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      isolation:
        isolate;

      -webkit-font-smoothing:
        antialiased;

      -moz-osx-font-smoothing:
        grayscale;

      text-rendering:
        optimizeLegibility;

    }


    /*
     * ========================================================
     * ATMOSPHERE
     * ========================================================
     */

    .dyve-footer-atmosphere {

      position:
        absolute;

      inset:
        0;

      pointer-events:
        none;

      z-index:
        -1;

    }


    .dyve-footer-ambient-glow {

      position:
        absolute;

      top:
        -250px;

      left:
        50%;

      width:
        720px;

      height:
        380px;

      transform:
        translateX(-50%);

      border-radius:
        50%;

      background:
        rgba(0,245,160,.055);

      filter:
        blur(105px);

    }


    .dyve-footer-grid {

      position:
        absolute;

      inset:
        0;

      opacity:
        .17;

      background-image:

        linear-gradient(
          rgba(0,245,160,.017) 1px,
          transparent 1px
        ),

        linear-gradient(
          90deg,
          rgba(0,245,160,.017) 1px,
          transparent 1px
        );

      background-size:
        72px 72px;

      mask-image:
        linear-gradient(
          to bottom,
          #000 0%,
          rgba(0,0,0,.55) 38%,
          transparent 82%
        );

      -webkit-mask-image:
        linear-gradient(
          to bottom,
          #000 0%,
          rgba(0,0,0,.55) 38%,
          transparent 82%
        );

    }


    .dyve-footer-scanline {

      position:
        absolute;

      top:
        0;

      left:
        0;

      width:
        100%;

      height:
        1px;

      background:
        linear-gradient(
          90deg,
          transparent 0%,
          rgba(0,245,160,.12) 25%,
          rgba(0,245,160,.42) 50%,
          rgba(0,245,160,.12) 75%,
          transparent 100%
        );

      box-shadow:
        0 0 20px
        rgba(0,245,160,.12);

    }


    /*
     * ========================================================
     * SIGNAL LINE
     * ========================================================
     */

    .dyve-footer-signal {

      position:
        absolute;

      top:
        0;

      left:
        50%;

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      width:
        min(
          320px,
          58vw
        );

      height:
        1px;

      transform:
        translateX(-50%);

    }


    .dyve-footer-signal span {

      flex:
        1;

      height:
        1px;

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(0,245,160,.28)
        );

    }


    .dyve-footer-signal span:last-child {

      background:
        linear-gradient(
          90deg,
          rgba(0,245,160,.28),
          transparent
        );

    }


    .dyve-footer-signal i {

      width:
        68px;

      height:
        2px;

      background:
        var(--dyve-green);

      box-shadow:
        0 0 18px
        rgba(0,245,160,.25);

    }


    /*
     * ========================================================
     * SHELL
     * ========================================================
     */

    .dyve-footer-shell {

      position:
        relative;

      width:
        min(
          calc(100% - 56px),
          1040px
        );

      margin:
        0 auto;

      padding:
        88px 0 30px;

    }


    /*
     * ========================================================
     * IDENTITY
     * ========================================================
     */

    .dyve-footer-identity {

      display:
        flex;

      flex-direction:
        column;

      align-items:
        center;

      width:
        100%;

      text-align:
        center;

    }


    /*
     * ========================================================
     * ORBITAL MARK
     * ========================================================
     */

    .dyve-footer-orbital {

      position:
        relative;

      width:
        152px;

      height:
        152px;

      margin:
        0 auto 31px;

      color:
        rgba(241,246,244,.72);

      transform:
        translateZ(0);

      filter:
        drop-shadow(
          0 0 24px
          rgba(0,245,160,.035)
        );

    }


    .dyve-footer-orbital-halo {

      position:
        absolute;

      inset:
        15px;

      border-radius:
        50%;

      background:
        radial-gradient(
          circle,
          rgba(0,245,160,.055),
          transparent 68%
        );

      filter:
        blur(8px);

      animation:
        dyveFooterHaloPulse
        4s
        ease-in-out
        infinite;

    }


    .dyve-footer-orbital-ring {

      position:
        absolute;

      inset:
        1px;

      border:
        1px solid
        rgba(241,246,244,.075);

      border-radius:
        50%;

      z-index:
        1;

    }


    .dyve-footer-orbital-core {

      position:
        absolute;

      inset:
        12px;

      z-index:
        4;

    }


    .dyve-footer-orbital-core svg {

      display:
        block;

      width:
        100%;

      height:
        100%;

      transform-origin:
        center;

      animation:
        dyveFooterGlobeSpin
        22s
        linear
        infinite;

      will-change:
        transform;

    }


    .dyve-footer-orbital-crosshair {

      position:
        absolute;

      top:
        50%;

      left:
        50%;

      width:
        180px;

      height:
        1px;

      transform:
        translate(-50%, -50%);

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(241,246,244,.08),
          transparent
        );

      z-index:
        2;

    }


    .dyve-footer-orbit {

      position:
        absolute;

      inset:
        -7px;

      border:
        1px solid
        rgba(241,246,244,.14);

      border-radius:
        50%;

      transform-origin:
        center;

      pointer-events:
        none;

      z-index:
        3;

      will-change:
        transform;

    }


    .dyve-footer-orbit::before {

      content:
        "";

      position:
        absolute;

      top:
        -3px;

      left:
        50%;

      width:
        5px;

      height:
        5px;

      margin-left:
        -2.5px;

      border-radius:
        50%;

      background:
        var(--dyve-green);

      box-shadow:
        0 0 10px
        rgba(0,245,160,.85);

    }


    .dyve-footer-orbit span {

      position:
        absolute;

      bottom:
        -2px;

      left:
        50%;

      width:
        3px;

      height:
        3px;

      margin-left:
        -1.5px;

      border-radius:
        50%;

      background:
        rgba(241,246,244,.65);

    }


    .dyve-footer-orbit-a {

      transform:
        rotate(22deg)
        scaleY(.48);

      animation:
        dyveFooterOrbitA
        9s
        linear
        infinite;

    }


    .dyve-footer-orbit-b {

      transform:
        rotate(-38deg)
        scaleY(.52);

      animation:
        dyveFooterOrbitB
        12s
        linear
        infinite;

    }


    .dyve-footer-orbit-c {

      transform:
        rotate(78deg)
        scaleY(.42);

      animation:
        dyveFooterOrbitC
        15s
        linear
        infinite;

    }


    @keyframes dyveFooterGlobeSpin {

      from {
        transform:
          rotate(0deg);
      }

      to {
        transform:
          rotate(360deg);
      }

    }


    @keyframes dyveFooterOrbitA {

      from {
        transform:
          rotate(22deg)
          scaleY(.48);
      }

      to {
        transform:
          rotate(382deg)
          scaleY(.48);
      }

    }


    @keyframes dyveFooterOrbitB {

      from {
        transform:
          rotate(-38deg)
          scaleY(.52);
      }

      to {
        transform:
          rotate(-398deg)
          scaleY(.52);
      }

    }


    @keyframes dyveFooterOrbitC {

      from {
        transform:
          rotate(78deg)
          scaleY(.42);
      }

      to {
        transform:
          rotate(438deg)
          scaleY(.42);
      }

    }


    @keyframes dyveFooterHaloPulse {

      0%,
      100% {
        opacity:
          .45;

        transform:
          scale(.94);
      }

      50% {
        opacity:
          .9;

        transform:
          scale(1.05);
      }

    }


    /*
     * ========================================================
     * EYEBROW
     * ========================================================
     */

    .dyve-footer-eyebrow {

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        10px;

      margin:
        0 0 13px;

      color:
        rgba(241,246,244,.27);

      font-family:
        "JetBrains Mono",
        "SFMono-Regular",
        Consolas,
        monospace;

      font-size:
        7px;

      font-weight:
        600;

      letter-spacing:
        2.8px;

      line-height:
        1;

      text-transform:
        uppercase;

    }


    .dyve-footer-eyebrow-line {

      display:
        block;

      width:
        18px;

      height:
        1px;

      background:
        rgba(0,245,160,.34);

    }


    /*
     * ========================================================
     * BRAND
     * ========================================================
     */

    .dyve-footer-brand {

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        9px;

      width:
        100%;

      color:
        var(--dyve-white);

      font-family:
        "Audiowide",
        "Michroma",
        "Orbitron",
        "Inter",
        sans-serif;

      font-size:
        clamp(
          25px,
          4vw,
          38px
        );

      font-weight:
        400;

      line-height:
        1;

      letter-spacing:
        2.6px;

      white-space:
        nowrap;

    }


    .dyve-footer-brand-main,
    .dyve-footer-brand-product {

      color:
        #f2f7f5;

    }


    .dyve-footer-brand-divider {

      color:
        var(--dyve-green);

      opacity:
        .72;

      font-family:
        "JetBrains Mono",
        monospace;

      font-size:
        .58em;

      letter-spacing:
        1px;

    }


    /*
     * ========================================================
     * DESCRIPTION
     * ========================================================
     */

    .dyve-footer-description {

      width:
        min(
          100%,
          620px
        );

      margin:
        21px auto 0;

      color:
        var(--dyve-soft);

      font-size:
        13px;

      font-weight:
        400;

      line-height:
        1.8;

      letter-spacing:
        .1px;

    }


    .dyve-footer-description span {

      color:
        rgba(241,246,244,.32);

    }


    /*
     * ========================================================
     * ACTIONS
     * ========================================================
     */

    .dyve-footer-actions {

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        10px;

      margin:
        35px auto 0;

    }


    .dyve-footer-button {

      position:
        relative;

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        center;

      min-width:
        176px;

      min-height:
        50px;

      padding:
        0 23px;

      overflow:
        hidden;

      border-radius:
        10px;

      font-family:
        "Inter",
        system-ui,
        sans-serif;

      font-size:
        12px;

      font-weight:
        700;

      line-height:
        1;

      text-decoration:
        none;

      transition:
        transform .24s ease,
        background-color .24s ease,
        border-color .24s ease,
        box-shadow .24s ease,
        color .24s ease;

      -webkit-tap-highlight-color:
        transparent;

    }


    .dyve-footer-button::after {

      content:
        "";

      position:
        absolute;

      top:
        0;

      left:
        -120%;

      width:
        70%;

      height:
        100%;

      transform:
        skewX(-20deg);

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,.16),
          transparent
        );

      transition:
        left .55s ease;

    }


    .dyve-footer-button:hover::after {

      left:
        150%;

    }


    .dyve-footer-button:hover {

      transform:
        translateY(-2px);

    }


    .dyve-footer-button:active {

      transform:
        translateY(0)
        scale(.985);

    }


    .dyve-footer-button-primary {

      display:
        inline-flex;

      gap:
        11px;

      color:
        var(--dyve-green-dark);

      background:
        linear-gradient(
          135deg,
          #00f5a0,
          #0ceca0
        );

      border:
        1px solid
        rgba(0,245,160,.9);

      box-shadow:
        0 12px 35px
        rgba(0,245,160,.075);

    }


    .dyve-footer-button-primary:hover {

      background:
        linear-gradient(
          135deg,
          #19ffb0,
          #00efa0
        );

      box-shadow:
        0 15px 44px
        rgba(0,245,160,.15);

    }


    .dyve-footer-button-arrow {

      font-size:
        17px;

      font-weight:
        400;

      transition:
        transform .22s ease;

    }


    .dyve-footer-button-primary:hover
    .dyve-footer-button-arrow {

      transform:
        translateX(4px);

    }


    .dyve-footer-button-secondary {

      color:
        rgba(241,246,244,.76);

      background:
        rgba(255,255,255,.006);

      border:
        1px solid
        rgba(241,246,244,.14);

      backdrop-filter:
        blur(10px);

      -webkit-backdrop-filter:
        blur(10px);

    }


    .dyve-footer-button-secondary:hover {

      color:
        #ffffff;

      background:
        rgba(255,255,255,.035);

      border-color:
        rgba(241,246,244,.25);

    }


    .dyve-footer-button-corner {

      position:
        absolute;

      right:
        7px;

      bottom:
        6px;

      width:
        5px;

      height:
        5px;

      border-right:
        1px solid
        rgba(0,245,160,.5);

      border-bottom:
        1px solid
        rgba(0,245,160,.5);

    }


    /*
     * ========================================================
     * NAVIGATION
     * ========================================================
     */

    .dyve-footer-navigation {

      display:
        grid;

      grid-template-columns:
        repeat(4, minmax(0,1fr));

      width:
        min(
          100%,
          920px
        );

      margin:
        88px auto 0;

      padding:
        0 0 62px;

      column-gap:
        clamp(
          24px,
          5vw,
          70px
        );

      border-bottom:
        1px solid
        var(--dyve-line);

    }


    .dyve-footer-column {

      min-width:
        0;

      text-align:
        left;

    }


    .dyve-footer-column-index {

      margin:
        0 0 11px;

      color:
        rgba(0,245,160,.34);

      font-family:
        "JetBrains Mono",
        monospace;

      font-size:
        7px;

      font-weight:
        600;

      letter-spacing:
        1.5px;

    }


    .dyve-footer-column h2 {

      margin:
        0 0 20px;

      color:
        rgba(241,246,244,.43);

      font-family:
        "JetBrains Mono",
        "SFMono-Regular",
        Consolas,
        monospace;

      font-size:
        9px;

      font-weight:
        600;

      line-height:
        1;

      letter-spacing:
        2.2px;

      text-transform:
        uppercase;

    }


    .dyve-footer-links {

      display:
        flex;

      flex-direction:
        column;

      align-items:
        flex-start;

    }


    .dyve-footer-links a {

      position:
        relative;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      width:
        100%;

      max-width:
        180px;

      margin:
        0 0 12px;

      padding:
        2px 0;

      color:
        rgba(241,246,244,.52);

      font-family:
        "Inter",
        system-ui,
        sans-serif;

      font-size:
        12px;

      font-weight:
        450;

      line-height:
        1.55;

      text-decoration:
        none;

      transition:
        color .2s ease,
        transform .2s ease;

    }


    .dyve-footer-links a::before {

      content:
        "";

      position:
        absolute;

      left:
        -15px;

      top:
        50%;

      width:
        0;

      height:
        1px;

      transform:
        translateY(-50%);

      background:
        var(--dyve-green);

      transition:
        width .2s ease;

    }


    .dyve-footer-links a i {

      color:
        rgba(0,245,160,.35);

      font-family:
        "JetBrains Mono",
        monospace;

      font-size:
        9px;

      font-style:
        normal;

      opacity:
        0;

      transform:
        translate(
          -4px,
          3px
        );

      transition:
        opacity .2s ease,
        transform .2s ease;

    }


    .dyve-footer-links a:hover {

      color:
        var(--dyve-white);

      transform:
        translateX(5px);

    }


    .dyve-footer-links a:hover::before {

      width:
        8px;

    }


    .dyve-footer-links a:hover i {

      opacity:
        1;

      transform:
        translate(
          0,
          0
        );

    }


    /*
     * ========================================================
     * SYSTEM STATUS
     * ========================================================
     */

    .dyve-footer-status {

      position:
        relative;

      display:
        block;

      width:
        min(
          100%,
          920px
        );

      margin:
        0 auto;

      padding:
        17px 0 18px;

      color:
        var(--dyve-muted);

      text-decoration:
        none;

      border-bottom:
        1px solid
        rgba(241,246,244,.045);

      transition:
        color .22s ease;

    }


    .dyve-footer-status::before {

      content:
        "";

      position:
        absolute;

      inset:
        0;

      background:
        linear-gradient(
          90deg,
          rgba(0,245,160,.025),
          transparent 50%,
          rgba(0,245,160,.012)
        );

      opacity:
        0;

      transition:
        opacity .25s ease;

      pointer-events:
        none;

    }


    .dyve-footer-status:hover::before {

      opacity:
        1;

    }


    .dyve-footer-status-top {

      position:
        relative;

      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        20px;

      margin:
        0 0 13px;

      z-index:
        1;

    }


    .dyve-footer-status-heading {

      display:
        flex;

      align-items:
        center;

      gap:
        7px;

      color:
        rgba(241,246,244,.27);

      font-family:
        "JetBrains Mono",
        monospace;

      font-size:
        7px;

      font-weight:
        600;

      letter-spacing:
        1.7px;

    }


    .dyve-footer-status-live-dot {

      width:
        4px;

      height:
        4px;

      border-radius:
        50%;

      background:
        var(--dyve-green);

      box-shadow:
        0 0 7px
        rgba(0,245,160,.7);

    }


    .dyve-footer-status-open {

      color:
        rgba(0,245,160,.35);

      font-family:
        "JetBrains Mono",
        monospace;

      font-size:
        7px;

      font-weight:
        500;

      letter-spacing:
        1px;

    }


    .dyve-footer-status-main {

      position:
        relative;

      display:
        grid;

      grid-template-columns:
        1fr auto 18px;

      align-items:
        center;

      gap:
        22px;

      min-height:
        30px;

      z-index:
        1;

    }


    .dyve-footer-status-state {

      display:
        flex;

      align-items:
        center;

      gap:
        9px;

      min-width:
        0;

    }


    .dyve-footer-status-text {

      overflow:
        hidden;

      color:
        rgba(241,246,244,.48);

      font-family:
        "JetBrains Mono",
        "SFMono-Regular",
        Consolas,
        monospace;

      font-size:
        9px;

      font-weight:
        500;

      letter-spacing:
        .3px;

      text-overflow:
        ellipsis;

      white-space:
        nowrap;

    }


    .dyve-footer-status-service-wrap {

      display:
        flex;

      align-items:
        center;

      gap:
        9px;

    }


    .dyve-footer-status-service-label {

      color:
        rgba(241,246,244,.17);

      font-family:
        "JetBrains Mono",
        monospace;

      font-size:
        6px;

      letter-spacing:
        1px;

      text-transform:
        uppercase;

    }


    .dyve-footer-status-service {

      color:
        rgba(241,246,244,.32);

      font-family:
        "JetBrains Mono",
        monospace;

      font-size:
        7px;

      font-weight:
        500;

      letter-spacing:
        .9px;

      text-transform:
        uppercase;

      white-space:
        nowrap;

    }


    .dyve-footer-status-arrow {

      display:
        flex;

      align-items:
        center;

      justify-content:
        flex-end;

      color:
        var(--dyve-green);

      font-size:
        16px;

      line-height:
        1;

      opacity:
        .65;

      transition:
        transform .22s ease,
        opacity .22s ease;

    }


    .dyve-footer-status:hover {

      color:
        var(--dyve-text);

    }


    .dyve-footer-status:hover
    .dyve-footer-status-arrow {

      opacity:
        1;

      transform:
        translate(
          2px,
          -2px
        );

    }


    /*
     * STATUS DOT
     */

    .dyve-footer-status-dot {

      position:
        relative;

      width:
        6px;

      height:
        6px;

      flex:
        0 0 6px;

      border-radius:
        50%;

      background:
        #65706b;

    }


    .dyve-footer-status-dot.operational {

      background:
        var(--dyve-green);

      box-shadow:
        0 0 0 3px
        rgba(0,245,160,.045),
        0 0 10px
        rgba(0,245,160,.72);

    }


    .dyve-footer-status-dot.degraded {

      background:
        #e8bd50;

      box-shadow:
        0 0 0 3px
        rgba(232,189,80,.045),
        0 0 9px
        rgba(232,189,80,.5);

    }


    .dyve-footer-status-dot.outage {

      background:
        #ff5c5c;

      box-shadow:
        0 0 0 3px
        rgba(255,92,92,.045),
        0 0 9px
        rgba(255,92,92,.5);

    }


    .dyve-footer-status-dot.checking {

      animation:
        dyveFooterStatusPulse
        1.5s
        ease-in-out
        infinite;

    }


    @keyframes dyveFooterStatusPulse {

      0%,
      100% {
        opacity:
          .3;
      }

      50% {
        opacity:
          1;
      }

    }


    /*
     * ========================================================
     * BOTTOM
     * ========================================================
     */

    .dyve-footer-bottom {

      display:
        grid;

      grid-template-columns:
        1fr auto 1fr;

      align-items:
        center;

      gap:
        20px;

      width:
        min(
          100%,
          920px
        );

      margin:
        0 auto;

      padding:
        22px 0 0;

      color:
        rgba(241,246,244,.22);

      font-family:
        "JetBrains Mono",
        "SFMono-Regular",
        Consolas,
        monospace;

      font-size:
        7px;

      font-weight:
        500;

      line-height:
        1.6;

      letter-spacing:
        .25px;

    }


    .dyve-footer-copyright {

      display:
        flex;

      align-items:
        center;

      gap:
        7px;

      text-align:
        left;

    }


    .dyve-footer-bottom-center {

      color:
        rgba(241,246,244,.13);

      font-size:
        6px;

      letter-spacing:
        1.2px;

      text-align:
        center;

      white-space:
        nowrap;

    }


    .dyve-footer-signature {

      display:
        inline-flex;

      align-items:
        center;

      justify-content:
        flex-end;

      gap:
        7px;

      color:
        rgba(241,246,244,.19);

      letter-spacing:
        2px;

      text-align:
        right;

    }


    .dyve-footer-signature i {

      color:
        rgba(0,245,160,.38);

      font-style:
        normal;

    }


    /*
     * ========================================================
     * FINAL EDGE
     * ========================================================
     */

    .dyve-footer-edge {

      display:
        flex;

      align-items:
        center;

      justify-content:
        center;

      gap:
        7px;

      margin:
        28px auto 0;

    }


    .dyve-footer-edge span {

      width:
        3px;

      height:
        3px;

      border-radius:
        50%;

      background:
        rgba(241,246,244,.12);

    }


    .dyve-footer-edge i {

      width:
        42px;

      height:
        1px;

      background:
        linear-gradient(
          90deg,
          transparent,
          rgba(0,245,160,.28),
          transparent
        );

    }


    /*
     * ========================================================
     * TABLET
     * ========================================================
     */

    @media (max-width: 820px) {

      .dyve-footer-shell {

        width:
          min(
            calc(100% - 46px),
            680px
          );

        padding-top:
          74px;

      }


      .dyve-footer-navigation {

        grid-template-columns:
          repeat(2, minmax(0,1fr));

        max-width:
          610px;

        gap:
          48px 64px;

        margin-top:
          76px;

      }


      .dyve-footer-status,
      .dyve-footer-bottom {

        max-width:
          610px;

      }

    }


    /*
     * ========================================================
     * MOBILE
     * ========================================================
     */

    @media (max-width: 560px) {

      .dyve-global-footer {

        margin-top:
          56px;

      }


      .dyve-footer-signal {

        width:
          190px;

      }


      .dyve-footer-signal i {

        width:
          44px;

      }


      .dyve-footer-shell {

        width:
          calc(100% - 32px);

        max-width:
          390px;

        padding:
          61px 0 21px;

      }


      /*
       * Orbital
       */

      .dyve-footer-orbital {

        width:
          124px;

        height:
          124px;

        margin-bottom:
          27px;

      }


      .dyve-footer-orbital-crosshair {

        width:
          150px;

      }


      /*
       * Eyebrow
       */

      .dyve-footer-eyebrow {

        gap:
          7px;

        margin-bottom:
          11px;

        font-size:
          6px;

        letter-spacing:
          2.2px;

      }


      .dyve-footer-eyebrow-line {

        width:
          12px;

      }


      /*
       * Brand
       */

      .dyve-footer-brand {

        gap:
          6px;

        font-size:
          21px;

        letter-spacing:
          1.7px;

      }


      .dyve-footer-brand-divider {

        font-size:
          .56em;

      }


      /*
       * Description
       */

      .dyve-footer-description {

        width:
          min(
            100%,
            340px
          );

        margin-top:
          17px;

        font-size:
          12px;

        line-height:
          1.8;

      }


      /*
       * Buttons
       */

      .dyve-footer-actions {

        width:
          100%;

        margin-top:
          29px;

        gap:
          9px;

      }


      .dyve-footer-button {

        min-width:
          0;

        width:
          100%;

        min-height:
          48px;

        padding:
          0 10px;

        border-radius:
          10px;

        font-size:
          10.5px;

      }


      .dyve-footer-button-arrow {

        font-size:
          15px;

      }


      /*
       * Navigation
       */

      .dyve-footer-navigation {

        grid-template-columns:
          repeat(2, minmax(0,1fr));

        width:
          100%;

        max-width:
          350px;

        margin-top:
          66px;

        padding-bottom:
          46px;

        gap:
          44px 32px;

      }


      .dyve-footer-column-index {

        margin-bottom:
          9px;

        font-size:
          6px;

      }


      .dyve-footer-column h2 {

        margin-bottom:
          17px;

        font-size:
          8px;

        letter-spacing:
          1.8px;

      }


      .dyve-footer-links a {

        max-width:
          155px;

        margin-bottom:
          11px;

        font-size:
          11.5px;

      }


      .dyve-footer-links a i {

        display:
          none;

      }


      .dyve-footer-links a::before {

        display:
          none;

      }


      .dyve-footer-links a:hover {

        transform:
          translateX(2px);

      }


      /*
       * Status
       */

      .dyve-footer-status {

        width:
          100%;

        padding:
          16px 0 17px;

      }


      .dyve-footer-status-top {

        margin-bottom:
          12px;

      }


      .dyve-footer-status-heading {

        font-size:
          6px;

        letter-spacing:
          1.5px;

      }


      .dyve-footer-status-open {

        font-size:
          6px;

        letter-spacing:
          .8px;

      }


      .dyve-footer-status-main {

        grid-template-columns:
          minmax(0,1fr)
          auto
          16px;

        gap:
          10px;

      }


      .dyve-footer-status-text {

        font-size:
          8px;

      }


      .dyve-footer-status-service-wrap {

        display:
          flex;

        flex-direction:
          column;

        align-items:
          flex-end;

        gap:
          2px;

      }


      .dyve-footer-status-service-label {

        font-size:
          5px;

      }


      .dyve-footer-status-service {

        max-width:
          135px;

        overflow:
          hidden;

        font-size:
          6px;

        letter-spacing:
          .7px;

        text-overflow:
          ellipsis;

      }


      .dyve-footer-status-arrow {

        font-size:
          14px;

      }


      /*
       * Bottom
       */

      .dyve-footer-bottom {

        display:
          flex;

        flex-direction:
          column;

        align-items:
          center;

        justify-content:
          center;

        gap:
          11px;

        padding-top:
          19px;

        text-align:
          center;

      }


      .dyve-footer-copyright {

        justify-content:
          center;

        text-align:
          center;

      }


      .dyve-footer-bottom-center {

        order:
          3;

        font-size:
          5.5px;

        letter-spacing:
          1px;

      }


      .dyve-footer-signature {

        order:
          2;

        justify-content:
          center;

      }


      .dyve-footer-edge {

        margin-top:
          25px;

      }

    }


    /*
     * ========================================================
     * VERY SMALL PHONES
     * ========================================================
     */

    @media (max-width: 375px) {

      .dyve-footer-shell {

        width:
          calc(100% - 28px);

      }


      .dyve-footer-brand {

        font-size:
          19px;

        letter-spacing:
          1.25px;

      }


      .dyve-footer-description {

        font-size:
          11.5px;

      }


      .dyve-footer-navigation {

        column-gap:
          22px;

      }


      .dyve-footer-links a {

        font-size:
          10.8px;

      }


      .dyve-footer-status-service {

        max-width:
          112px;

      }

    }


    /*
     * ========================================================
     * ACCESSIBILITY
     * ========================================================
     */

    .dyve-global-footer a:focus-visible {

      outline:
        1px solid
        var(--dyve-green);

      outline-offset:
        4px;

    }


    /*
     * ========================================================
     * REDUCED MOTION
     * ========================================================
     */

    @media (prefers-reduced-motion: reduce) {

      .dyve-footer-orbital-core svg,
      .dyve-footer-orbit,
      .dyve-footer-orbital-halo,
      .dyve-footer-status-dot.checking {

        animation:
          none !important;

      }


      .dyve-footer-button,
      .dyve-footer-button::after,
      .dyve-footer-button-arrow,
      .dyve-footer-links a,
      .dyve-footer-links a::before,
      .dyve-footer-links a i,
      .dyve-footer-status,
      .dyve-footer-status-arrow,
      .dyve-footer-status::before {

        transition:
          none !important;

      }

    }

  `;


  /* ==========================================================
     HELPERS
  ========================================================== */

  function escapeHtml(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function injectStyles() {

    if (
      document.getElementById(
        "dyve-global-footer-styles"
      )
    ) {
      return;
    }


    const style =
      document.createElement("style");

    style.id =
      "dyve-global-footer-styles";

    style.textContent =
      footerCSS;

    document.head.appendChild(
      style
    );

  }


  function mountFooter() {

    const mount =
      document.querySelector(
        config.mount
      );

    if (!mount) {

      console.warn(
        "[Dyve Footer] #global-footer was not found."
      );

      return null;

    }


    mount.innerHTML =
      footerHTML;

    return mount;

  }


  /* ==========================================================
     STATUS UI
  ========================================================== */

  function setStatus(
    state,
    message
  ) {

    const footer =
      document.querySelector(
        "[data-dyve-footer]"
      );

    if (!footer) {
      return;
    }


    const dot =
      footer.querySelector(
        "[data-dyve-status-dot]"
      );

    const text =
      footer.querySelector(
        "[data-dyve-status-text]"
      );

    if (!dot || !text) {
      return;
    }


    dot.classList.remove(
      "operational",
      "degraded",
      "outage",
      "checking"
    );


    /*
     * OPERATIONAL
     */

    if (
      state === "operational"
    ) {

      dot.classList.add(
        "operational"
      );

      text.textContent =
        "All systems operational";

      return;

    }


    /*
     * DEGRADED
     */

    if (
      state === "degraded"
    ) {

      dot.classList.add(
        "degraded"
      );

      text.textContent =
        "Systems partially degraded";

      return;

    }


    /*
     * OUTAGE
     */

    if (
      state === "major_outage" ||
      state === "outage"
    ) {

      dot.classList.add(
        "outage"
      );

      text.textContent =
        "Service disruption detected";

      return;

    }


    /*
     * UNKNOWN
     *
     * A failed status request must never
     * be interpreted as a Dyve outage.
     */

    dot.classList.add(
      "checking"
    );

    text.textContent =
      message ||
      "Status temporarily unavailable";

  }


  /* ==========================================================
     LIVE STATUS
  ========================================================== */

  async function loadStatus() {

    try {

      const response =
        await fetch(
          `${config.statusApi}?t=${Date.now()}`,
          {
            method:
              "GET",

            cache:
              "no-store",

            credentials:
              "omit"
          }
        );


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );

      }


      const data =
        await response.json();


      setStatus(
        data?.overallStatus ||
        "unknown"
      );

    }

    catch (error) {

      setStatus(
        "unknown",
        "Status temporarily unavailable"
      );


      console.warn(
        "[Dyve Footer] Unable to read live status.",
        error
      );

    }

  }


  /* ==========================================================
     HEARTBEAT
  ========================================================== */

  function sendHeartbeat() {

    try {

      fetch(
        config.heartbeatApi,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          credentials:
            "omit",

          keepalive:
            true,

          body:
            JSON.stringify({
              service:
                config.statusService,

              path:
                window.location.pathname,

              timestamp:
                new Date().toISOString()
            })
        }
      )
      .catch(() => {});

    }

    catch {

      /*
       * Heartbeat is deliberately
       * non-blocking.
       */

    }

  }


  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  function initialize() {

    injectStyles();


    const mount =
      mountFooter();


    if (!mount) {
      return;
    }


    /*
     * Load current status immediately.
     */

    loadStatus();


    /*
     * Register this page visit with
     * the Dyve status infrastructure.
     */

    sendHeartbeat();


    /*
     * Refresh live status every minute.
     */

    window.setInterval(
      loadStatus,
      60 * 1000
    );

  }


  /* ==========================================================
     START
  ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once:
          true
      }
    );

  }

  else {

    initialize();

  }

})();