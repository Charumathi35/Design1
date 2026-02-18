/**
 * main.js - Structured & Refactored
 * Modular architecture for easier maintenance.
 */

// --- CONFIGURATION ---
const CONFIG = {
    lenis: {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
        smoothTouch: false,
        mouseMultiplier: 1,
        touchMultiplier: 2
    },
    bgMap: {
        1: '#canvas-limited',
        2: '#canvas-precision',
        3: '#canvas-engineering',
        4: '#canvas-travel',
        5: '#canvas-bluorb',
        6: '#canvas-gourmet',
        7: '#canvas-retreats',
        8: '#canvas-durapack',
        9: '#canvas-logistics',
        10: '#bg-asia',
        11: '#bg-surya',
        12: '#bg-holdings'
    },
    canvasIds: {
        intro: 'intro-canvas',
        fog: 'fog-sequence-canvas'
    },
    // Element Selectors
    selectors: {
        loader: '#loader',
        progressBar: '.progress',
        hero: '.hero',
        companySections: '.company',
        bgLayer: '.bg-layer',
        cloudMistWrapper: '.cloud-mist-wrapper-v2'
    }
};

// --- STATE MANAGEMENT ---
const STATE = {
    threeApp: null,
    sequences: {}, // Stores active CanvasImageSequence instances
    resizeTimeout: null
};

// --- MAIN ENTRY POINT ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Setup Utilities
    setupSmoothScroll();
    setupThreeJS();

    // 2. Setup Loading Screen
    setupLoader().then(() => {
        // 3. Initialize Content on Load Complete (or immediately if no loader)
        initContent();
    });

    // 4. Global Events
    window.addEventListener('resize', debounce(handleResize, 200));
}

function initContent() {
    setupIntroAnimation();
    setupCompanySections();
    setupAtmospherics();

    // Delayed restoration to ensure layout is settled
    setTimeout(() => {
        ScrollTrigger.refresh();
        handleScrollRestoration();
    }, 100);

    setupBackToTop();
}

// --- MODULES ---

function setupSmoothScroll() {
    if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    const lenis = new Lenis(CONFIG.lenis);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

function setupThreeJS() {
    if (document.getElementById('webgl')) {
        window.threeApp = new ThreeScene();
        STATE.threeApp = window.threeApp;

        // Drive Three.js via GSAP Ticker for sync
        gsap.ticker.add((time) => {
            if (window.threeApp) {
                window.threeApp.render();
            }
        });

        // --- GLOBAL SCROLL DRIVE ---
        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (self) => {
                if (window.threeApp && window.threeApp.updateScroll) {
                    window.threeApp.updateScroll(self.progress);
                }
            }
        });
    }
}

function setupLoader() {
    return new Promise((resolve) => {
        const loader = document.querySelector(CONFIG.selectors.loader);
        const progressBar = document.querySelector(CONFIG.selectors.progressBar);

        if (loader && progressBar) {
            gsap.to(progressBar, {
                width: '100%',
                duration: 0.1,
                ease: 'power2.inOut',
                onComplete: () => {
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 0.2,
                        onComplete: () => {
                            loader.style.display = 'none';
                            resolve();
                        }
                    });
                }
            });
        } else {
            resolve();
        }
    });
}

function setupIntroAnimation() {
    // 1. Intro Video Sequence
    const introSequence = new CanvasImageSequence({
        canvasId: CONFIG.canvasIds.intro,
        framePaths: SEQUENCE_DATA.intro.map(f => `images/ExtractedFrames_2026-02-06_10-07-33/${f}`),
        onLoadComplete: () => { }
    });

    // 2. Reveal Timeline (Mountains, etc)
    const revealTl = gsap.timeline({
        scrollTrigger: {
            trigger: CONFIG.selectors.hero,
            start: 'top top',
            end: '+=4000',
            scrub: 1,
            pin: true
        }
    });

    // Intro Canvas Scale/Fade
    revealTl.from(`#${CONFIG.canvasIds.intro}`, { scale: 1.1, ease: 'none' }, 0);

    // Sky Fog Overlay
    revealTl.fromTo('.sky-fog-overlay',
        { autoAlpha: 0, y: '-20%' },
        { autoAlpha: 1, y: '0%', duration: 0.4, ease: 'power1.out' },
        0.3
    );
    revealTl.to('.sky-fog-overlay',
        { autoAlpha: 0, duration: 0.2, ease: 'power1.in' },
        0.7
    );

    // Frame Animation (Backwards)
    const introObj = { frame: introSequence.frameCount - 1 };
    revealTl.to(introObj, {
        frame: 0,
        snap: "frame",
        ease: "none",
        onUpdate: () => introSequence.render(introObj.frame)
    }, 0);

    // Cross-fade to Pricol Limited Canvas
    revealTl.fromTo('#canvas-limited',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'none' },
        0.3
    );

    revealTl.to(`#${CONFIG.canvasIds.intro}`, {
        opacity: 0,
        duration: 0.6,
        ease: 'none'
    }, 0.85);

    // Hero Text Animations
    revealTl.to('.hero-brand', {
        opacity: 0,
        scale: 1.1,
        ease: 'power1.in',
        duration: 0.1
    }, 0);

    revealTl.to('.hero-about', {
        opacity: 1,
        y: -20,
        ease: 'power1.out',
        duration: 0.2
    }, 0.3);

    revealTl.to('.hero-about', {
        opacity: 0,
        y: -40,
        ease: 'power1.in',
        duration: 0.1
    }, 0.7);

    // Cloud Reveal Layer
    revealTl.to('.cloud-reveal-layer', {
        autoAlpha: 0,
        scale: 1.5,
        ease: 'power1.in',
        duration: 0.1
    }, 0);

    // Initial Hero Entry
    const heroTl = gsap.timeline();
    heroTl.from('.hero-brand > *', {
        y: 40, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out'
    });

    // Hero Story Trigger
    ScrollTrigger.create({
        trigger: CONFIG.selectors.hero,
        start: 'top center',
        onEnter: () => STATE.threeApp?.highlightSection(0),
        onEnterBack: () => STATE.threeApp?.highlightSection(0)
    });
}

function setupCompanySections() {
    const companySections = document.querySelectorAll(CONFIG.selectors.companySections);

    // Initialize Sequences
    const sequenceMap = {
        1: new CanvasImageSequence({ canvasId: 'canvas-limited', framePaths: SEQUENCE_DATA.limited }),
        2: new CanvasImageSequence({ canvasId: 'canvas-precision', framePaths: SEQUENCE_DATA.precision.map(f => `images/Precision scroll/${f}`) }),
        3: new CanvasImageSequence({ canvasId: 'canvas-engineering', framePaths: SEQUENCE_DATA.engineering.map(f => `images/Engineering scroll/${f}`) }),
        4: new CanvasImageSequence({ canvasId: 'canvas-travel', framePaths: SEQUENCE_DATA.travel.map(f => `images/Travel scroll/${f}`) }),
        5: new CanvasImageSequence({ canvasId: 'canvas-bluorb', framePaths: SEQUENCE_DATA.bluorb.map(f => `images/Bluorb scroll/${f}`) }),
        6: new CanvasImageSequence({ canvasId: 'canvas-gourmet', framePaths: SEQUENCE_DATA.gourmet.map(f => `images/Gouemet scroll/${f}`) }),
        7: new CanvasImageSequence({ canvasId: 'canvas-retreats', framePaths: SEQUENCE_DATA.retreats.map(f => `images/Retreats scroll/${f}`) }),
        8: new CanvasImageSequence({ canvasId: 'canvas-durapack', framePaths: SEQUENCE_DATA.durapack.map(f => `images/Durapack Scroll/${f}`) }),
        9: new CanvasImageSequence({ canvasId: 'canvas-logistics', framePaths: SEQUENCE_DATA.logistics.map(f => `images/logistics scroll new/${f}`) })
    };

    // Store in STATE for shared access
    Object.assign(STATE.sequences, sequenceMap);

    companySections.forEach((section, index) => {
        setupSectionAnimations(section, index);
    });
}

function setupSectionAnimations(section, index) {
    const content = section.querySelector('.content');
    const h3 = content.querySelector('h3');
    const p = content.querySelector('p');

    // 1. Text Reveal
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom 20%',
            toggleActions: 'play reverse play reverse'
        }
    });

    tl.fromTo(content, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power1.out' })
        .fromTo(h3, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, ease: 'power1.out' }, "-=0.25")
        .fromTo(p, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, ease: 'power1.out' }, "-=0.15");

    // 2. 3D Card Tilt (Desktop)
    if (window.matchMedia("(min-width: 900px)").matches) {
        section.addEventListener('mousemove', (e) => {
            const rect = content.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(content, {
                rotationX: rotateX,
                rotationY: rotateY,
                scale: 1.02,
                perspective: 1000,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        section.addEventListener('mouseleave', () => {
            gsap.to(content, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.5, ease: 'power2.out' });
        });
    }

    // 3. Background Animation
    const sectionIndex = index + 1;
    const bgId = CONFIG.bgMap[sectionIndex];

    if (bgId) {
        const bgEl = document.querySelector(bgId);
        const seq = STATE.sequences[sectionIndex];

        if (seq) {
            // Canvases
            const obj = { frame: 0 };
            gsap.to(obj, {
                frame: seq.frameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0,
                    onUpdate: () => seq.render(obj.frame)
                }
            });
        } else if (bgEl && bgEl.tagName !== 'CANVAS') {
            // Images (Asia, Surya, Holdings)
            gsap.fromTo(bgEl,
                { scale: 1.0, y: 0 },
                {
                    scale: 1.15,
                    y: 50,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        }
    }

    // 4. Background Focus (Trigger updateBackground)
    ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            STATE.threeApp?.highlightSection(sectionIndex);
            updateBackground(sectionIndex);
        },
        onEnterBack: () => {
            STATE.threeApp?.highlightSection(sectionIndex);
            updateBackground(sectionIndex);
        },
        onLeaveBack: () => {
            if (index === 0) updateBackground(0);
        }
    });
}

function setupAtmospherics() {
    // 1. Fog Sequence
    const fogSequence = new CanvasImageSequence({
        canvasId: CONFIG.canvasIds.fog,
        framePaths: SEQUENCE_DATA.fog.map(f => `images/fog/${f}?v=${new Date().getTime()}`)
    });

    // Note: Fog scroll logic seemed unfinished in original, preserving structure.

    // 2. Cloud Mist V2
    if (document.querySelector(CONFIG.selectors.cloudMistWrapper)) {
        const cloudTlV2 = gsap.timeline({
            scrollTrigger: {
                trigger: CONFIG.selectors.cloudMistWrapper,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });

        cloudTlV2.to('.cloud-scroll-layer', { opacity: 1, duration: 1, stagger: 0.1 }, 0);
        cloudTlV2.to('.layer-top', { yPercent: -30 }, 0);
        cloudTlV2.to('.layer-bottom', { yPercent: -60, scale: 1.1 }, 0);
        cloudTlV2.to('.cloud-scroll-layer', { opacity: 0, duration: 0.5, stagger: 0 }, 2.5);
    }

    // 3. Parallax Layers & Fog Opacity
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const fogContainer = document.querySelector('.fog-container');
    const isMobile = window.innerWidth <= 768;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            layer.style.setProperty('--scroll-offset', `${scrollY * speed * 2.5}px`);
        });

        if (fogContainer) fogContainer.style.opacity = 1;
    });

    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
                const depth = speed * 150;
                const x = (mouseX - 0.5) * depth;
                const y = (mouseY - 0.5) * depth;
                layer.style.setProperty('--mouse-x', `${x}px`);
                layer.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }
}

function setupBackToTop() {
    // 1. Logic Reset
    ScrollTrigger.create({
        trigger: 'body',
        start: 'top 100px',
        onLeaveBack: () => {
            STATE.threeApp?.highlightSection(0);
        }
    });

    // 2. Button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 3. Footer Animation
    gsap.from('.footer .container', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 90%',
        },
        y: 30, opacity: 0, duration: 1
    });
}

function handleScrollRestoration() {
    const companySections = document.querySelectorAll(CONFIG.selectors.companySections);
    let activeIndex = 0;

    // Check Hero
    const hero = document.querySelector(CONFIG.selectors.hero);
    if (hero && hero.getBoundingClientRect().bottom > window.innerHeight * 0.2) {
        activeIndex = 0;
    } else {
        companySections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
                activeIndex = index + 1;
            }
        });
    }

    console.log("Initial Active Index:", activeIndex);
    updateBackground(activeIndex);
    STATE.threeApp?.highlightSection(activeIndex);

    if (activeIndex > 0) {
        const seq = STATE.sequences[activeIndex];
        if (seq) {
            seq.resize();
            ScrollTrigger.refresh();
        }
    }

    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 100);
}

// Helper: Update Background Opacity
function updateBackground(index) {
    document.querySelectorAll(CONFIG.selectors.bgLayer).forEach(el => el.style.opacity = '0');
    const targetId = CONFIG.bgMap[index];
    if (targetId) {
        const el = document.querySelector(targetId);
        if (el) el.style.opacity = '1';
    }
}

// Helper: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleResize() {
    ScrollTrigger.refresh();
}

// --- DATA ---
const SEQUENCE_DATA = {
    intro: [
        "frame_0_00_1f.jpeg", "frame_0_00_4f.jpeg", "frame_0_00_7f.jpeg", "frame_0_00_9f.jpeg", "frame_0_00_12f.jpeg",
        "frame_0_00_18f.jpeg", "frame_0_01_4f.jpeg", "frame_0_01_13f.jpeg", "frame_0_01_18f.jpeg", "frame_0_01_23f.jpeg",
        "frame_0_02_2f.jpeg", "frame_0_02_5f.jpeg", "frame_0_02_8f.jpeg", "frame_0_02_13f.jpeg", "frame_0_02_16f.jpeg",
        "frame_0_02_21f.jpeg", "frame_0_03_0f.jpeg", "frame_0_03_2f.jpeg", "frame_0_03_4f.jpeg", "frame_0_03_6f.jpeg",
        "frame_0_03_9f.jpeg", "frame_0_03_11f.jpeg", "frame_0_03_13f.jpeg", "frame_0_03_16f.jpeg", "frame_0_03_22f.jpeg",
        "frame_0_04_1f.jpeg", "frame_0_04_5f.jpeg", "frame_0_04_8f.jpeg", "frame_0_04_12f.jpeg", "frame_0_04_15f.jpeg",
        "frame_0_04_18f.jpeg", "frame_0_04_21f.jpeg", "frame_0_05_0f.jpeg", "frame_0_05_2f.jpeg", "frame_0_05_6f.jpeg",
        "frame_0_05_8f.jpeg", "frame_0_05_10f.jpeg", "frame_0_05_12f.jpeg", "frame_0_05_14f.jpeg", "frame_0_05_16f.jpeg",
        "frame_0_05_18f.jpeg", "frame_0_06_1f.jpeg", "frame_0_06_7f.jpeg", "frame_0_06_11f.jpeg", "frame_0_06_12f.jpeg",
        "frame_0_06_15f.jpeg", "frame_0_06_21f.jpeg", "frame_0_07_3f.jpeg", "frame_0_07_8f.jpeg", "frame_0_07_13f.jpeg",
        "frame_0_08_0f.jpeg"
    ],
    fog: [
        "frame_0_00_0f.jpeg", "frame_0_00_9f.jpeg", "frame_0_01_1f.jpeg", "frame_0_01_7f.jpeg", "frame_0_01_18f.jpeg",
        "frame_0_02_3f.jpeg", "frame_0_02_20f.jpeg", "frame_0_03_2f.jpeg", "frame_0_03_9f.jpeg", "frame_0_03_19f.jpeg",
        "frame_0_04_11f.jpeg", "frame_0_04_22f.jpeg", "frame_0_05_3f.jpeg", "frame_0_05_9f.jpeg", "frame_0_05_15f.jpeg",
        "frame_0_05_21f.jpeg", "frame_0_06_3f.jpeg", "frame_0_06_6f.jpeg", "frame_0_06_12f.jpeg", "frame_0_06_15f.jpeg",
        "frame_0_06_21f.jpeg", "frame_0_07_3f.jpeg", "frame_0_07_7f.jpeg", "frame_0_07_12f.jpeg", "frame_0_07_15f.jpeg",
        "frame_0_07_19f.jpeg"
    ],
    limited: Array.from({ length: 40 }, (_, i) =>
        `images/ezgif-4b345fe35756b584-jpg/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.jpg`
    ),
    precision: [
        "frame_0_00_0f.jpeg", "frame_0_00_2f.jpeg", "frame_0_00_5f.jpeg", "frame_0_00_11f.jpeg", "frame_0_00_17f.jpeg",
        "frame_0_01_9f.jpeg", "frame_0_01_15f.jpeg", "frame_0_01_24f.jpeg", "frame_0_02_4f.jpeg", "frame_0_02_9f.jpeg",
        "frame_0_02_12f.jpeg", "frame_0_02_16f.jpeg", "frame_0_02_19f.jpeg", "frame_0_03_1f.jpeg", "frame_0_03_5f.jpeg",
        "frame_0_03_7f.jpeg", "frame_0_03_12f.jpeg", "frame_0_03_15f.jpeg", "frame_0_03_18f.jpeg", "frame_0_03_21f.jpeg",
        "frame_0_04_1f.jpeg", "frame_0_04_4f.jpeg", "frame_0_04_7f.jpeg", "frame_0_04_10f.jpeg", "frame_0_04_12f.jpeg",
        "frame_0_04_14f.jpeg", "frame_0_04_17f.jpeg", "frame_0_04_20f.jpeg", "frame_0_04_24f.jpeg", "frame_0_05_2f.jpeg",
        "frame_0_05_4f.jpeg"
    ],
    engineering: [
        "frame_0_00_0f.jpeg", "frame_0_00_3f.jpeg", "frame_0_00_6f.jpeg", "frame_0_00_10f.jpeg", "frame_0_00_16f.jpeg", "frame_0_00_42f.jpeg",
        "frame_0_01_8f.jpeg", "frame_0_01_35f.jpeg", "frame_0_02_5f.jpeg", "frame_0_02_28f.jpeg", "frame_0_02_52f.jpeg",
        "frame_0_03_14f.jpeg", "frame_0_03_42f.jpeg", "frame_0_04_9f.jpeg", "frame_0_04_35f.jpeg", "frame_0_05_8f.jpeg",
        "frame_0_05_33f.jpeg", "frame_0_06_4f.jpeg", "frame_0_06_31f.jpeg", "frame_0_06_51f.jpeg", "frame_0_07_7f.jpeg",
        "frame_0_07_24f.jpeg", "frame_0_07_43f.jpeg", "frame_0_07_54f.jpeg", "frame_0_08_5f.jpeg", "frame_0_08_19f.jpeg",
        "frame_0_08_28f.jpeg", "frame_0_08_43f.jpeg", "frame_0_09_0f.jpeg"
    ],
    logistics: [
        "frame_0_00_0f.jpeg", "frame_0_00_4f.jpeg", "frame_0_00_9f.jpeg", "frame_0_00_16f.jpeg", "frame_0_00_26f.jpeg",
        "frame_0_01_0f.jpeg", "frame_0_01_10f.jpeg", "frame_0_01_18f.jpeg", "frame_0_01_21f.jpeg", "frame_0_01_27f.jpeg",
        "frame_0_02_26f.jpeg", "frame_0_03_10f.jpeg", "frame_0_04_8f.jpeg", "frame_0_04_22f.jpeg", "frame_0_05_1f.jpeg",
        "frame_0_05_4f.jpeg", "frame_0_05_7f.jpeg", "frame_0_05_10f.jpeg", "frame_0_05_15f.jpeg", "frame_0_05_19f.jpeg",
        "frame_0_05_23f.jpeg", "frame_0_05_26f.jpeg", "frame_0_05_26f(1).jpeg", "frame_0_06_0f.jpeg", "frame_0_06_7f.jpeg",
        "frame_0_06_11f.jpeg", "frame_0_06_28f.jpeg", "frame_0_07_7f.jpeg", "frame_0_07_12f.jpeg", "frame_0_07_23f.jpeg",
        "frame_0_08_10f.jpeg", "frame_0_09_3f.jpeg", "frame_0_09_21f.jpeg", "frame_0_10_8f.jpeg", "frame_0_10_23f.jpeg",
        "frame_0_11_3f.jpeg", "frame_0_11_17f.jpeg", "frame_0_11_27f.jpeg", "frame_0_12_6f.jpeg", "frame_0_12_16f.jpeg",
        "frame_0_12_26f.jpeg", "frame_0_13_0f.jpeg"
    ],
    travel: [
        "frame_0_00_0f.jpeg", "frame_0_01_6f.jpeg", "frame_0_02_0f.jpeg", "frame_0_02_21f.jpeg", "frame_0_02_29f.jpeg",
        "frame_0_03_4f.jpeg", "frame_0_03_19f.jpeg", "frame_0_03_25f.jpeg", "frame_0_04_15f.jpeg", "frame_0_05_11f.jpeg",
        "frame_0_05_18f.jpeg", "frame_0_05_23f.jpeg", "frame_0_05_29f.jpeg", "frame_0_06_5f.jpeg", "frame_0_06_8f.jpeg",
        "frame_0_06_10f.jpeg", "frame_0_06_17f.jpeg", "frame_0_06_23f.jpeg", "frame_0_07_2f.jpeg", "frame_0_07_10f.jpeg",
        "frame_0_07_29f.jpeg", "frame_0_08_19f.jpeg", "frame_0_09_2f.jpeg", "frame_0_09_29f.jpeg", "frame_0_10_16f.jpeg",
        "frame_0_11_6f.jpeg", "frame_0_11_24f.jpeg", "frame_0_12_6f.jpeg", "frame_0_12_24f.jpeg", "frame_0_13_8f.jpeg",
        "frame_0_13_25f.jpeg", "frame_0_14_6f.jpeg", "frame_0_14_21f.jpeg", "frame_0_15_5f.jpeg", "frame_0_15_13f.jpeg",
        "frame_0_16_1f.jpeg", "frame_0_16_12f.jpeg", "frame_0_16_17f.jpeg", "frame_0_16_25f.jpeg", "frame_0_17_5f.jpeg",
        "frame_0_17_18f.jpeg", "frame_0_18_0f.jpeg", "frame_0_18_13f.jpeg", "frame_0_18_24f.jpeg", "frame_0_19_0f.jpeg",
        "frame_0_19_11f.jpeg", "frame_0_19_19f.jpeg", "frame_0_19_24f.jpeg"
    ],
    bluorb: [
        "frame_0_00_0f.jpeg", "frame_0_00_3f.jpeg", "frame_0_00_7f.jpeg", "frame_0_00_14f.jpeg", "frame_0_00_18f.jpeg",
        "frame_0_00_22f.jpeg", "frame_0_01_1f.jpeg", "frame_0_01_3f.jpeg", "frame_0_01_7f.jpeg", "frame_0_01_10f.jpeg",
        "frame_0_01_15f.jpeg", "frame_0_01_19f.jpeg", "frame_0_01_23f.jpeg", "frame_0_02_1f.jpeg", "frame_0_02_9f.jpeg",
        "frame_0_02_16f.jpeg", "frame_0_02_21f.jpeg", "frame_0_03_3f.jpeg", "frame_0_03_9f.jpeg", "frame_0_03_16f.jpeg",
        "frame_0_04_1f.jpeg", "frame_0_04_8f.jpeg", "frame_0_04_15f.jpeg", "frame_0_05_0f.jpeg", "frame_0_05_4f.jpeg",
        "frame_0_05_10f.jpeg", "frame_0_05_14f.jpeg", "frame_0_05_18f.jpeg", "frame_0_05_21f.jpeg", "frame_0_06_4f.jpeg",
        "frame_0_06_13f.jpeg", "frame_0_06_23f.jpeg", "frame_0_08_16f.jpeg", "frame_0_08_20f.jpeg", "frame_0_08_21f.jpeg",
        "frame_0_08_23f.jpeg"
    ],
    gourmet: [
        "frame_0_00_0f.jpeg", "frame_0_00_12f.jpeg", "frame_0_00_20f.jpeg", "frame_0_00_4f.jpeg", "frame_0_00_9f.jpeg",
        "frame_0_01_13f.jpeg", "frame_0_01_15f.jpeg", "frame_0_01_20f.jpeg", "frame_0_01_24f.jpeg", "frame_0_01_3f.jpeg",
        "frame_0_01_9f.jpeg", "frame_0_02_13f.jpeg", "frame_0_02_18f.jpeg", "frame_0_02_21f.jpeg", "frame_0_02_3f.jpeg",
        "frame_0_02_7f.jpeg", "frame_0_03_17f.jpeg", "frame_0_03_21f.jpeg", "frame_0_03_4f.jpeg", "frame_0_03_8f.jpeg",
        "frame_0_04_12f.jpeg", "frame_0_04_16f.jpeg", "frame_0_04_20f.jpeg", "frame_0_04_5f.jpeg", "frame_0_05_1f.jpeg",
        "frame_0_06_16f.jpeg", "frame_0_07_10f.jpeg", "frame_0_07_13f.jpeg", "frame_0_07_17f.jpeg", "frame_0_07_4f.jpeg",
        "frame_0_08_10f.jpeg", "frame_0_08_15f.jpeg", "frame_0_08_24f.jpeg", "frame_0_08_2f.jpeg", "frame_0_09_19f.jpeg",
        "frame_0_10_16f.jpeg", "frame_0_11_17f.jpeg", "frame_0_11_20f.jpeg", "frame_0_11_23f.jpeg", "frame_0_11_6f.jpeg",
        "frame_0_12_13f.jpeg", "frame_0_12_6f.jpeg", "frame_0_13_13f.jpeg", "frame_0_13_1f.jpeg", "frame_0_14_0f.jpeg",
        "frame_0_14_10f.jpeg", "frame_0_14_22f.jpeg", "frame_0_15_19f.jpeg", "frame_0_15_7f.jpeg", "frame_0_16_13f.jpeg",
        "frame_0_16_19f(1).jpeg", "frame_0_16_19f.jpeg", "frame_0_16_1f.jpeg", "frame_0_16_2f.jpeg", "frame_0_16_6f.jpeg",
        "frame_0_17_20f.jpeg", "frame_0_17_5f.jpeg", "frame_0_17_9f.jpeg", "frame_0_18_10f.jpeg", "frame_0_18_23f.jpeg",
        "frame_0_19_10f.jpeg",
        "frame_0_20_16f.jpeg", "frame_0_20_1f.jpeg", "frame_0_21_10f.jpeg", "frame_0_22_21f.jpeg", "frame_0_22_6f.jpeg",
        "frame_0_23_11f.jpeg", "frame_0_24_0f.jpeg", "frame_0_24_15f.jpeg", "frame_0_25_6f.jpeg", "frame_0_26_0f.jpeg",
        "frame_0_26_19f.jpeg", "frame_0_27_5f.jpeg", "frame_0_28_0f.jpeg"
    ],
    retreats: [
        "frame_0_00_0f.jpeg", "frame_0_00_20f.jpeg", "frame_0_01_17f.jpeg", "frame_0_02_8f.jpeg", "frame_0_02_9f.jpeg",
        "frame_0_02_22f.jpeg", "frame_0_03_19f.jpeg", "frame_0_04_12f.jpeg", "frame_0_05_6f.jpeg", "frame_0_06_0f.jpeg",
        "frame_0_06_18f.jpeg", "frame_0_07_12f.jpeg", "frame_0_08_5f.jpeg", "frame_0_08_23f.jpeg", "frame_0_09_16f.jpeg",
        "frame_0_10_9f.jpeg", "frame_0_11_2f.jpeg", "frame_0_11_20f.jpeg", "frame_0_12_14f.jpeg", "frame_0_13_7f.jpeg",
        "frame_0_14_0f.jpeg", "frame_0_14_18f.jpeg", "frame_0_15_11f.jpeg", "frame_0_16_4f.jpeg", "frame_0_16_22f.jpeg",
        "frame_0_17_15f.jpeg", "frame_0_18_8f.jpeg", "frame_0_19_2f.jpeg", "frame_0_19_19f.jpeg", "frame_0_20_12f.jpeg",
        "frame_0_21_5f.jpeg", "frame_0_21_23f.jpeg", "frame_0_22_16f.jpeg", "frame_0_23_9f.jpeg", "frame_0_24_2f.jpeg",
        "frame_0_24_20f.jpeg", "frame_0_25_13f.jpeg", "frame_0_26_6f.jpeg", "frame_0_26_23f.jpeg", "frame_0_27_16f.jpeg",
        "frame_0_28_9f.jpeg", "frame_0_29_2f.jpeg", "frame_0_29_20f.jpeg", "frame_0_30_13f.jpeg", "frame_0_31_6f.jpeg",
        "frame_0_31_23f.jpeg", "frame_0_32_16f.jpeg", "frame_0_33_9f.jpeg", "frame_0_34_2f.jpeg", "frame_0_34_20f.jpeg",
        "frame_0_35_17f.jpeg", "frame_0_36_10f.jpeg", "frame_0_37_1f.jpeg", "frame_0_38_3f.jpeg", "frame_0_38_17f.jpeg",
        "frame_0_39_8f.jpeg", "frame_0_40_1f.jpeg", "frame_0_40_20f.jpeg", "frame_0_41_12f.jpeg", "frame_0_42_1f.jpeg",
        "frame_0_42_17f.jpeg", "frame_0_43_8f.jpeg", "frame_0_44_3f.jpeg", "frame_0_44_20f.jpeg", "frame_0_45_11f.jpeg",
        "frame_0_46_2f.jpeg", "frame_0_46_21f.jpeg", "frame_0_47_11f.jpeg", "frame_0_48_3f.jpeg", "frame_0_48_20f.jpeg",
        "frame_0_49_9f.jpeg", "frame_0_49_23f.jpeg", "frame_0_50_14f.jpeg", "frame_0_50_20f.jpeg", "frame_0_51_8f.jpeg",
        "frame_0_51_22f.jpeg", "frame_0_52_0f.jpeg", "frame_0_52_14f.jpeg", "frame_0_52_17f.jpeg", "frame_0_56_0f.jpeg",
        "frame_0_56_18f.jpeg", "frame_0_58_1f.jpeg", "frame_0_59_3f.jpeg", "frame_1_00_8f.jpeg", "frame_1_01_3f.jpeg",
        "frame_1_02_5f.jpeg", "frame_1_03_1f.jpeg", "frame_1_03_20f.jpeg", "frame_1_04_17f.jpeg", "frame_1_05_13f.jpeg",
        "frame_1_06_12f.jpeg", "frame_1_07_15f.jpeg", "frame_1_08_14f.jpeg", "frame_1_09_15f.jpeg", "frame_1_10_15f.jpeg",
        "frame_1_11_10f.jpeg", "frame_1_12_7f.jpeg", "frame_1_13_7f.jpeg", "frame_1_13_21f.jpeg"
    ],
    durapack: [
        "frame_0_00_0f.jpeg", "frame_0_00_4f.jpeg", "frame_0_00_12f.jpeg", "frame_0_00_23f.jpeg", "frame_0_01_18f.jpeg",
        "frame_0_02_6f.jpeg", "frame_0_02_17f.jpeg", "frame_0_03_4f.jpeg", "frame_0_03_21f.jpeg", "frame_0_04_9f.jpeg",
        "frame_0_05_0f.jpeg", "frame_0_05_12f.jpeg", "frame_0_06_0f.jpeg", "frame_0_06_12f.jpeg", "frame_0_07_3f.jpeg",
        "frame_0_07_15f.jpeg", "frame_0_08_7f.jpeg", "frame_0_08_21f.jpeg", "frame_0_09_13f.jpeg", "frame_0_10_5f.jpeg",
        "frame_0_10_8f.jpeg", "frame_0_10_12f.jpeg", "frame_0_10_16f.jpeg", "frame_0_10_22f.jpeg", "frame_0_11_1f.jpeg",
        "frame_0_11_5f.jpeg", "frame_0_11_9f.jpeg", "frame_0_11_14f.jpeg", "frame_0_11_19f.jpeg", "frame_0_11_23f.jpeg",
        "frame_0_12_3f.jpeg", "frame_0_12_8f.jpeg", "frame_0_12_12f.jpeg", "frame_0_12_17f.jpeg", "frame_0_12_22f.jpeg",
        "frame_0_13_3f.jpeg", "frame_0_13_11f.jpeg", "frame_0_13_15f.jpeg", "frame_0_13_23f.jpeg", "frame_0_14_10f.jpeg",
        "frame_0_14_13f.jpeg", "frame_0_14_21f.jpeg"
    ]
};
