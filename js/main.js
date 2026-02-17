// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- LENIS SMOOTH SCROLL SETUP ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Get ScrollTrigger to update on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis's ticker to GSAP's ticker for smoothness
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Disable GSAP's lag smoothing to prevent stutter causing jumps
    gsap.ticker.lagSmoothing(0);

    /* 
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    */

    // const threeApp = new ThreeScene(); // REPLACED WITH WINDOW ASSIGNMENT
    if (document.getElementById('webgl')) {
        window.threeApp = new ThreeScene();

        // OPTIMIZATION: Drive Three.js via GSAP Ticker
        gsap.ticker.add((time) => {
            if (window.threeApp) {
                window.threeApp.render();
            }
        });
    }

    const threeApp = window.threeApp; // Local ref for compatibility

    // Loader
    const loader = document.querySelector('#loader');
    const progressBar = document.querySelector('.progress');

    if (loader && progressBar) {
        gsap.to(progressBar, {
            width: '100%',
            duration: 0.1, // Instant load
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.to(loader, {
                    opacity: 0,
                    duration: 0.2, // Quick fade out
                    onComplete: () => {
                        loader.style.display = 'none';
                        initScrollInteraction(threeApp);
                    }
                });
            }
        });
    } else {
        // If no loader, just start interaction
        initScrollInteraction(threeApp);
    }

    initAtmosphericEffects();

    // Handle Resize
    // Handle Resize (Debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 200);
    });


});

function initScrollInteraction(threeApp) {
    const isMobile = window.innerWidth < 900;

    // --- GLOBAL SCROLL DRIVE ---
    // The entire page scroll drives the 3D scene's "progress"
    // 0 = Top, 1 = Bottom
    ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // Smooth scrubbing
        onUpdate: (self) => {
            if (threeApp && threeApp.updateScroll) {
                threeApp.updateScroll(self.progress);
            }
        }
    });



    // --- INTRO CANVAS ANIMATION ---
    const introParams = {
        framePaths: [
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
        ].map(f => `images/ExtractedFrames_2026-02-06_10-07-33/${f}`)
    };

    const introSequence = new CanvasImageSequence({
        canvasId: 'intro-canvas',
        framePaths: introParams.framePaths,
        onLoadComplete: () => {
            // Optional: start animation if needed
        }
    });

    // --- MOUNTAIN REVEAL (Multi-Layer) ---
    const revealTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '+=4000',
            scrub: 1,
            pin: true
        }
    });

    // --- FOG SEQUENCE SECTION ---
    const fogParams = {
        framePaths: [
            "frame_0_00_0f.jpeg", "frame_0_00_9f.jpeg", "frame_0_01_1f.jpeg", "frame_0_01_7f.jpeg", "frame_0_01_18f.jpeg",
            "frame_0_02_3f.jpeg", "frame_0_02_20f.jpeg", "frame_0_03_2f.jpeg", "frame_0_03_9f.jpeg", "frame_0_03_19f.jpeg",
            "frame_0_04_11f.jpeg", "frame_0_04_22f.jpeg", "frame_0_05_3f.jpeg", "frame_0_05_9f.jpeg", "frame_0_05_15f.jpeg",
            "frame_0_05_21f.jpeg", "frame_0_06_3f.jpeg", "frame_0_06_6f.jpeg", "frame_0_06_12f.jpeg", "frame_0_06_15f.jpeg",
            "frame_0_06_21f.jpeg", "frame_0_07_3f.jpeg", "frame_0_07_7f.jpeg", "frame_0_07_12f.jpeg", "frame_0_07_15f.jpeg",
            "frame_0_07_19f.jpeg"
        ].map(f => `images/fog/${f}?v=${new Date().getTime()}`) // Cache bust logic preserved
    };

    const fogSequence = new CanvasImageSequence({
        canvasId: 'fog-sequence-canvas',
        framePaths: fogParams.framePaths
    });

    // SCROLL ANIMATION FOR FOG
    // Fade out canvas at the end to reveal content
    // SCROLL ANIMATION FOR FOG - Cleaned up

    // FOG SEQUENCE INTEGRATION (Into RevealTl)

    // --- CLOUD DIVIDER SECTION (Mont-Fort Style) ---
    // 1. Mist Fades IN over Hero
    // 2. Mist Flows
    // 3. Mist Fades OUT revealing Company List (Clean transition)

    const cloudTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.cloud-mist-wrapper',
            // Wrapper starts high up (due to -80vh margin).
            // We scrub through the entire height of the wrapper.
            start: 'top top',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1 // Tight coupling for sequence control
        }
    });



    // 2. Content Reveal (Emerges CLEARLY after mist is gone/fading)
    // The content section is padded down, so it naturally appears later in the scroll.
    gsap.fromTo('.mist-overlay-section',
        { autoAlpha: 0, y: 50 },
        {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.mist-overlay-section',
                start: 'top 50%', // Trigger later, when fog is really dense/clearing
                end: 'top 20%',
                scrub: 1
            }
        }
    );

    // --- CLOUD REVEAL ANIMATION (Initial) ---
    revealTl.to('.cloud-reveal-layer', {
        autoAlpha: 0, // Ensures visibility:hidden at end
        scale: 1.5,
        ease: 'power1.in',
        duration: 0.1 // Fade out instantly (sync with brand text)
    }, 0);









    // Canvas Reveal (renamed from Video)
    revealTl.from('#intro-canvas', { scale: 1.1, ease: 'none' }, 0);

    // SKY FOG OVERLAY (Coming from sky)
    revealTl.fromTo('.sky-fog-overlay',
        { autoAlpha: 0, y: '-20%' },
        { autoAlpha: 1, y: '0%', duration: 0.4, ease: 'power1.out' },
        0.3 // Start mid-way through building scroll
    );
    revealTl.to('.sky-fog-overlay',
        { autoAlpha: 0, duration: 0.2, ease: 'power1.in' },
        0.7 // Fade out as main fog takes over
    );

    // Animate Frames (Backwards 8s -> 0s)
    // Using property-based animation on the sequence object
    const introObj = { frame: introParams.framePaths.length - 1 };
    revealTl.to(introObj, {
        frame: 0,
        snap: "frame",
        ease: "none",
        onUpdate: () => {
            introSequence.render(introObj.frame);
        }
    }, 0);



    // 4. CROSS-FADE: Fade IN Pricol Limited Canvas to prevent white screen
    // Start much earlier to ensure it's visible before Intro fades
    revealTl.fromTo('#canvas-limited',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'none' }, // 'none' for linear consistent fade
        0.3
    );

    // Fade out Intro Canvas LATER, guaranteeing overlap
    revealTl.to('#intro-canvas', {
        opacity: 0,
        duration: 0.6,
        ease: 'none'
    }, 0.85); // Starts fading out well after limited has started appearing




    // --- HERO INTRO ---
    // 1. Brand (Welcome/Logo) - Fades OUT as mountains open / Clouds dissolve
    revealTl.to('.hero-brand', {
        opacity: 0,
        scale: 1.1, // Zoom out slightly with clouds
        ease: 'power1.in',
        duration: 0.1 // Fade out almost instantly on scroll start
    }, 0);

    // 2. About Text - Fades IN over video, then FADES OUT before Fog
    // User Request: "about text should end in building text itself don't need in foggy effect"
    revealTl.to('.hero-about', {
        opacity: 1,
        y: -20,
        ease: 'power1.out',
        duration: 0.2 // Quick fade in
    }, 0.3); // Start earlier

    revealTl.to('.hero-about', {
        opacity: 0,
        y: -40, // Float up and disappear
        ease: 'power1.in',
        duration: 0.1
    }, 0.7); // Fade out BEFORE the zoom/mist (at 0.7)

    // ZOOM into Mist (Sudden) - REMOVED
    // revealTl.to('#intro-canvas', { scale: 15, ... });

    const heroTl = gsap.timeline();

    // Initial Load - Only Brand appears first
    heroTl.from('.hero-brand > *', {
        y: 40, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out'
    });

    // Ensure Hero Story is active at top
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top center',
        onEnter: () => threeApp.highlightSection(0), // Hero Story
        onEnterBack: () => threeApp.highlightSection(0)
    });


    // --- SECTION REVEALS ---
    // Text elements entering "Glass" panes
    const companySections = document.querySelectorAll('.company');

    // Map for Backgrounds (shared for animation)
    const bgMap = {
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
    };

    // --- PRICOL LIMITED ---
    const limitedSequence = new CanvasImageSequence({
        canvasId: 'canvas-limited',
        framePaths: Array.from({ length: 40 }, (_, i) =>
            `images/ezgif-4b345fe35756b584-jpg/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.jpg`)
    });

    // --- PRECISION ---
    const precisionSequence = new CanvasImageSequence({
        canvasId: 'canvas-precision',
        framePaths: [
            "frame_0_00_0f.jpeg", "frame_0_00_2f.jpeg", "frame_0_00_5f.jpeg", "frame_0_00_11f.jpeg", "frame_0_00_17f.jpeg",
            "frame_0_01_9f.jpeg", "frame_0_01_15f.jpeg", "frame_0_01_24f.jpeg", "frame_0_02_4f.jpeg", "frame_0_02_9f.jpeg",
            "frame_0_02_12f.jpeg", "frame_0_02_16f.jpeg", "frame_0_02_19f.jpeg", "frame_0_03_1f.jpeg", "frame_0_03_5f.jpeg",
            "frame_0_03_7f.jpeg", "frame_0_03_12f.jpeg", "frame_0_03_15f.jpeg", "frame_0_03_18f.jpeg", "frame_0_03_21f.jpeg",
            "frame_0_04_1f.jpeg", "frame_0_04_4f.jpeg", "frame_0_04_7f.jpeg", "frame_0_04_10f.jpeg", "frame_0_04_12f.jpeg",
            "frame_0_04_14f.jpeg", "frame_0_04_17f.jpeg", "frame_0_04_20f.jpeg", "frame_0_04_24f.jpeg", "frame_0_05_2f.jpeg",
            "frame_0_05_4f.jpeg"
        ].map(f => `images/Precision scroll/${f}`)
    });

    // --- ENGINEERING ---
    const engineeringSequence = new CanvasImageSequence({
        canvasId: 'canvas-engineering',
        framePaths: [
            "frame_0_00_0f.jpeg", "frame_0_00_3f.jpeg", "frame_0_00_6f.jpeg", "frame_0_00_10f.jpeg", "frame_0_00_16f.jpeg", "frame_0_00_42f.jpeg",
            "frame_0_01_8f.jpeg", "frame_0_01_35f.jpeg", "frame_0_02_5f.jpeg", "frame_0_02_28f.jpeg", "frame_0_02_52f.jpeg",
            "frame_0_03_14f.jpeg", "frame_0_03_42f.jpeg", "frame_0_04_9f.jpeg", "frame_0_04_35f.jpeg", "frame_0_05_8f.jpeg",
            "frame_0_05_33f.jpeg", "frame_0_06_4f.jpeg", "frame_0_06_31f.jpeg", "frame_0_06_51f.jpeg", "frame_0_07_7f.jpeg",
            "frame_0_07_24f.jpeg", "frame_0_07_43f.jpeg", "frame_0_07_54f.jpeg", "frame_0_08_5f.jpeg", "frame_0_08_19f.jpeg",
            "frame_0_08_28f.jpeg", "frame_0_08_43f.jpeg", "frame_0_09_0f.jpeg"
        ].map(f => `images/Engineering scroll/${f}`)
    });

    // --- LOGISTICS ---
    const logisticsSequence = new CanvasImageSequence({
        canvasId: 'canvas-logistics',
        framePaths: [
            "frame_0_00_0f.jpeg", "frame_0_00_4f.jpeg", "frame_0_00_9f.jpeg", "frame_0_00_16f.jpeg", "frame_0_00_26f.jpeg",
            "frame_0_01_0f.jpeg", "frame_0_01_10f.jpeg", "frame_0_01_18f.jpeg", "frame_0_01_21f.jpeg", "frame_0_01_27f.jpeg",
            "frame_0_02_26f.jpeg", "frame_0_03_10f.jpeg", "frame_0_04_8f.jpeg", "frame_0_04_22f.jpeg", "frame_0_05_1f.jpeg",
            "frame_0_05_4f.jpeg", "frame_0_05_7f.jpeg", "frame_0_05_10f.jpeg", "frame_0_05_15f.jpeg", "frame_0_05_19f.jpeg",
            "frame_0_05_23f.jpeg", "frame_0_05_26f.jpeg", "frame_0_05_26f(1).jpeg", "frame_0_06_0f.jpeg", "frame_0_06_7f.jpeg",
            "frame_0_06_11f.jpeg", "frame_0_06_28f.jpeg", "frame_0_07_7f.jpeg", "frame_0_07_12f.jpeg", "frame_0_07_23f.jpeg",
            "frame_0_08_10f.jpeg", "frame_0_09_3f.jpeg", "frame_0_09_21f.jpeg", "frame_0_10_8f.jpeg", "frame_0_10_23f.jpeg",
            "frame_0_11_3f.jpeg", "frame_0_11_17f.jpeg", "frame_0_11_27f.jpeg", "frame_0_12_6f.jpeg", "frame_0_12_16f.jpeg",
            "frame_0_12_26f.jpeg", "frame_0_13_0f.jpeg"
        ].map(f => `images/logistics scroll new/${f}`)
    });

    // --- TRAVEL ---
    const travelSequence = new CanvasImageSequence({
        canvasId: 'canvas-travel',
        framePaths: [
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
        ].map(f => `images/Travel scroll/${f}`)
    });

    // --- BLUORB ---
    const bluorbSequence = new CanvasImageSequence({
        canvasId: 'canvas-bluorb',
        framePaths: [
            "frame_0_00_0f.jpeg", "frame_0_00_3f.jpeg", "frame_0_00_7f.jpeg", "frame_0_00_14f.jpeg", "frame_0_00_18f.jpeg",
            "frame_0_00_22f.jpeg", "frame_0_01_1f.jpeg", "frame_0_01_3f.jpeg", "frame_0_01_7f.jpeg", "frame_0_01_10f.jpeg",
            "frame_0_01_15f.jpeg", "frame_0_01_19f.jpeg", "frame_0_01_23f.jpeg", "frame_0_02_1f.jpeg", "frame_0_02_9f.jpeg",
            "frame_0_02_16f.jpeg", "frame_0_02_21f.jpeg", "frame_0_03_3f.jpeg", "frame_0_03_9f.jpeg", "frame_0_03_16f.jpeg",
            "frame_0_04_1f.jpeg", "frame_0_04_8f.jpeg", "frame_0_04_15f.jpeg", "frame_0_05_0f.jpeg", "frame_0_05_4f.jpeg",
            "frame_0_05_10f.jpeg", "frame_0_05_14f.jpeg", "frame_0_05_18f.jpeg", "frame_0_05_21f.jpeg", "frame_0_06_4f.jpeg",
            "frame_0_06_13f.jpeg", "frame_0_06_23f.jpeg", "frame_0_08_16f.jpeg", "frame_0_08_20f.jpeg", "frame_0_08_21f.jpeg",
            "frame_0_08_23f.jpeg"
        ].map(f => `images/Bluorb scroll/${f}`)
    });

    // --- GOURMET ---
    const gourmetSequence = new CanvasImageSequence({
        canvasId: 'canvas-gourmet',
        framePaths: [
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
        ].map(f => `images/Gouemet scroll/${f}`)
    });

    // --- RETREATS ---
    const retreatsSequence = new CanvasImageSequence({
        canvasId: 'canvas-retreats',
        framePaths: [
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
        ].map(f => `images/Retreats scroll/${f}`)
    });

    // --- DURAPACK ---
    const durapackSequence = new CanvasImageSequence({
        canvasId: 'canvas-durapack',
        framePaths: [
            "frame_0_00_0f.jpeg", "frame_0_00_4f.jpeg", "frame_0_00_12f.jpeg", "frame_0_00_23f.jpeg", "frame_0_01_18f.jpeg",
            "frame_0_02_6f.jpeg", "frame_0_02_17f.jpeg", "frame_0_03_4f.jpeg", "frame_0_03_21f.jpeg", "frame_0_04_9f.jpeg",
            "frame_0_05_0f.jpeg", "frame_0_05_12f.jpeg", "frame_0_06_0f.jpeg", "frame_0_06_12f.jpeg", "frame_0_07_3f.jpeg",
            "frame_0_07_15f.jpeg", "frame_0_08_7f.jpeg", "frame_0_08_21f.jpeg", "frame_0_09_13f.jpeg", "frame_0_10_5f.jpeg",
            "frame_0_10_8f.jpeg", "frame_0_10_12f.jpeg", "frame_0_10_16f.jpeg", "frame_0_10_22f.jpeg", "frame_0_11_1f.jpeg",
            "frame_0_11_5f.jpeg", "frame_0_11_9f.jpeg", "frame_0_11_14f.jpeg", "frame_0_11_19f.jpeg", "frame_0_11_23f.jpeg",
            "frame_0_12_3f.jpeg", "frame_0_12_8f.jpeg", "frame_0_12_12f.jpeg", "frame_0_12_17f.jpeg", "frame_0_12_22f.jpeg",
            "frame_0_13_3f.jpeg", "frame_0_13_11f.jpeg", "frame_0_13_15f.jpeg", "frame_0_13_23f.jpeg", "frame_0_14_10f.jpeg",
            "frame_0_14_13f.jpeg", "frame_0_14_21f.jpeg"
        ].map(f => `images/Durapack Scroll/${f}`)
    });


    companySections.forEach((section, index) => {
        const content = section.querySelector('.content');
        const h3 = content.querySelector('h3');
        const p = content.querySelector('p');

        // 1. Staggered Text Reveal (INSTANT / NO DELAY)
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top center', // SYNCHRONIZED with background change
                end: 'bottom 20%',
                toggleActions: 'play reverse play reverse'
            }
        });

        // Near Instant Reveal
        tl.fromTo(content,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: 'power1.out' }
        )
            .fromTo(h3,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.2, ease: 'power1.out' },
                "-=0.25" // Start BEFORE content finishes
            )
            .fromTo(p,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.2, ease: 'power1.out' },
                "-=0.15"
            );

        // 2. Parallax Effect REMOVED per user request ("content getting upside")

        // 3. 3D Card Tilt (Mouse Interaction)
        // Only on desktop to save resources
        if (window.matchMedia("(min-width: 900px)").matches) {
            section.addEventListener('mousemove', (e) => {
                const rect = content.getBoundingClientRect();
                const x = e.clientX - rect.left; // x position within the element.
                const y = e.clientY - rect.top;  // y position within the element.

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
                const rotateY = ((x - centerX) / centerX) * 10;

                // Use GSAP props to avoid overwriting "y" transform from entrance
                gsap.to(content, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    scale: 1.02,
                    perspective: 1000, // Applied to transform
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            section.addEventListener('mouseleave', () => {
                gsap.to(content, {
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        }

        const sectionIndex = index + 1;
        const bgId = bgMap[sectionIndex];

        // Background Animation (Zoom/Parallax & Canvas Sequence)
        if (bgId) {
            const bgEl = document.querySelector(bgId);

            // 1. Canvas Sequences (Pricol Limited, Precision, etc.)
            // Map index (0-based) to sequence instance
            const sequenceCtx = {
                0: limitedSequence,
                1: precisionSequence,
                2: engineeringSequence,
                3: travelSequence,
                4: bluorbSequence,
                5: gourmetSequence,
                6: retreatsSequence,
                7: durapackSequence,
                8: logisticsSequence
            };

            const seq = sequenceCtx[index];

            if (seq) {
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
            } else if (index === 9) {
                // SPECIAL CASE: Pricol Asia (Image Zoom)
                // Pricol Asia is index 9 (0-based) -> section #c10
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
            } else if (bgEl && bgEl.tagName !== 'CANVAS') {
                // Shared Zoom Effect for Standard Images (Holdings, Surya, etc)
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

    }

    // Background Focus & Image Swap (Inside Loop)
    ScrollTrigger.create({
        trigger: section,
        start: "top center", // Delay switch until section is dominant
        end: "bottom center",
        onEnter: () => {
            if (threeApp && threeApp.highlightSection) threeApp.highlightSection(index + 1);
            updateBackground(index + 1);
        },
        onEnterBack: () => {
            if (threeApp && threeApp.highlightSection) threeApp.highlightSection(index + 1);
            updateBackground(index + 1);
        },
        onLeave: () => {
            // Optional cleanup
        },
        onLeaveBack: () => {
            // If going back up to Hero (index 0)
            if (index === 0) updateBackground(0);
        }
    });
});

// --- FOOTER ---
gsap.from('.footer .container', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
    },
    y: 30, opacity: 0, duration: 1
});

// Helper for Background Switching
function updateBackground(index) {
    // Use global bgMap

    // Reset all specific layers to opacity 0
    document.querySelectorAll('.bg-layer').forEach(el => el.style.opacity = '0');

    // Activate specific layer if exists
    const targetId = bgMap[index];
    if (targetId) {
        const el = document.querySelector(targetId);
        if (el) {
            el.style.opacity = '1';
        }
    }
}

// Reset to Hero when scrolling back to top
ScrollTrigger.create({
    trigger: 'body',
    start: 'top 100px',
    onLeaveBack: () => {
        if (window.threeApp) window.threeApp.highlightSection(0);
    }
});
    // Apply fog wipe between ALL company sections
    // companySections.forEach((section, i) => {
    //     // Skip the first transition (handled by Hero -> Pricol Limited logic above)
    //     // or we can unify it. But Hero transition is special.
    //     // Let's do it for i >= 1 (Pricol Limited -> Pricol Precision and onwards)

    //     if (i >= 0) { // Actually, let's try to apply it to all transitions between companies?
    //         // i=0 is Hero -> Limited (Handled separately in revealTl)
    //         // So we want transition exiting section i to section i+1?
    //         // Or entering section i+1?

    //         // Let's trigger it on entering section i+1
    //         const nextSection = companySections[i + 1];
    //         if (nextSection) {
    //             // Fade out CURRENT section's content as next section enters
    //             // Ensures it's gone before the BG swap at "top 90%"
    //             gsap.to(section.querySelector('.content'), {
    //                 scrollTrigger: {
    //                     trigger: nextSection,
    //                     start: "top bottom",
    //                     end: "top 90%",
    //                     scrub: 1
    //                 },
    //                 opacity: 0,
    //                 y: -30 // Move up slightly
    //             });

    //             ScrollTrigger.create({
    //                 trigger: nextSection,
    //                 start: "top bottom", // Starts when next section enters viewport
    //                 end: "top 60%",   // Ends later (longer duration)
    //                 scrub: 1, // Smooth scrub
    //                 onUpdate: (self) => {
    //                     // We want:
    //                     // 0.0 -> 0.2: Fog Opacity 0 -> 0.75 (Quick Fade In)
    //                     // 0.2 -> 0.8: Fog Opacity 0.75 (Hold while sequence plays)
    //                     // 0.8 -> 1.0: Fog Opacity 0.75 -> 0 (Fade Out cleanup)

    //                     const p = self.progress;
    //                     const opacityIn = Math.min(1, p / 0.2);
    //                     const opacityOut = Math.max(0, (1 - p) / 0.2);

    //                     // Sequence progress (mapped 0.3 to 0.8) - Wiping after background switch (~0.33)
    //                     let frameProgress = (p - 0.3) / 0.5;
    //                     frameProgress = Math.max(0, Math.min(1, frameProgress));

    //                     // Decide Opacity
    //                     let finalOpacity = 0;
    //                     const maxOpacity = 0.75; // Lighter/Cleaner fog

    //                     if (p < 0.2) finalOpacity = opacityIn * maxOpacity;
    //                     else if (p > 0.8) finalOpacity = opacityOut * maxOpacity;
    //                     else finalOpacity = maxOpacity;

    //                     // Set Canvas Opacity
    //                     const fogSection = document.querySelector('.fog-sequence-section');
    //                     if (fogSection) { // reuse the same element
    //                         fogSection.style.opacity = finalOpacity;
    //                     }

    //                     // Render Frame
    //                     // Inverse logic if reusing same frames (or forward?)
    //                     // Hero used backwards (length -> 0). Let's stick to that for consistency?
    //                     // Or forward? "Wipe" usually implies forward movement.
    //                     // Hero was backwards: currentFrame: fogFileList.length - 1 -> 0

    //                     const frameIndex = (1 - frameProgress) * (fogFileList.length - 1);
    //                     fogImagesCtx.currentFrame = frameIndex;
    //                     renderFogFrame();
    //                 }
    //             });
    //         }
    //     }
    // });

}

// --- CLOUD DUAL SCROLL SEQUENCE (Upward Drift) - V2 ---
// Added here to bypass previous code blocks and ensure correct scope


if (document.querySelector('.cloud-mist-wrapper-v2')) {
    const cloudTlV2 = gsap.timeline({
        scrollTrigger: {
            trigger: '.cloud-mist-wrapper-v2',
            // Overlapping hero (-80vh)
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1
        }
    });

    // 1. Fade In (Start of transition)
    cloudTlV2.to('.cloud-scroll-layer', { opacity: 1, duration: 1, stagger: 0.1 }, 0);

    // 2. Upward Drift (Parallax)
    // Moving UP (negative y) as we scroll down to simulate rising mist
    cloudTlV2.to('.layer-top', { yPercent: -30 }, 0);
    cloudTlV2.to('.layer-bottom', { yPercent: -60, scale: 1.1 }, 0);

    // 3. Fade Out (EARLY CLEANUP)
    // Ensure mist is gone before content (Pricol Limited) appears
    cloudTlV2.to('.cloud-scroll-layer', { opacity: 0, duration: 0.5, stagger: 0 }, 2.5);
}

function initAtmosphericEffects() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const fogContainer = document.querySelector('.fog-container');
    const isMobile = window.innerWidth <= 768;

    // Scroll Logic
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // 1. Parallax - ENHANCED MOVEMENT
        parallaxLayers.forEach(layer => {
            // Increased multiplier from default 1x to higher for dramatic effect
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            // Negative direction for "rising mist" effect or positive for falling? 
            // Let's make it move faster.
            layer.style.setProperty('--scroll-offset', `${scrollY * speed * 2.5}px`);
        });

        // 2. Opacity Fade - REMOVED FADE OUT
        // We want the fog to persist throughout all sections
        let opacity = 1;
        // Optional: Make it slightly subtler at the very bottom if needed, but for now constant or slightly dynamic
        // opacity = 0.8 + Math.sin(scrollY * 0.002) * 0.2; // Pulse effect?

        if (fogContainer) {
            fogContainer.style.opacity = opacity;
        }
    });

    // Mouse Logic (Desktop Only)
    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
                const depth = speed * 150; // Increased depth for more interaction

                const x = (mouseX - 0.5) * depth;
                const y = (mouseY - 0.5) * depth;

                layer.style.setProperty('--mouse-x', `${x}px`);
                layer.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // --- RELOAD / INITIAL RESTORATION LOGIC ---
    function checkInitialScrollPosition() {
        const companySections = document.querySelectorAll('.company');
        let activeIndex = 0;
        let minDistance = Infinity;

        // check hero first
        const hero = document.querySelector('.hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            // If hero is mostly in view
            if (rect.bottom > window.innerHeight * 0.2) {
                // Hero is active
                activeIndex = 0;
            } else {
                // Check companies
                companySections.forEach((section, index) => {
                    const rect = section.getBoundingClientRect();
                    // New logic: Only active if top has crossed center screen
                    // And bottom is below center (or simply dominant)
                    if (rect.top <= window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
                        activeIndex = index + 1; // +1 because 0 is hero
                    }
                });
            }
        }

        console.log("Initial Active Index:", activeIndex);
        updateBackground(activeIndex);
        if (window.threeApp) window.threeApp.highlightSection(activeIndex);

        // Force render of the active canvas sequence
        if (activeIndex > 0) {
            const sequenceMap = {
                1: limitedSequence, 2: precisionSequence, 3: engineeringSequence,
                4: travelSequence, 5: bluorbSequence, 6: gourmetSequence,
                7: retreatsSequence, 8: durapackSequence, 9: logisticsSequence
            };
            const seq = sequenceMap[activeIndex];
            if (seq) {
                // Calculate manual progress to ensure *something* shows immediately
                // This prevents white flash before GSAP kicks in
                const section = companySections[activeIndex - 1]; // 0-indexed
                if (section) {
                    const rect = section.getBoundingClientRect();
                    // Simple estimation: how far into the section are we?
                    // 0 = top at bottom of screen, 1 = bottom at top of screen roughly
                    // But our scrollTrigger logic is specific. 
                    // Let's just force frame 0 or middle frame to ensure canvas isn't blank

                    // Force resize first
                    seq.resize();

                    // Attempt to sync with GSAP immediately
                    ScrollTrigger.refresh();
                }
            }
        }

        // Final catch-all refresh to ensure all triggers are correct
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);
    }

    // Call restoration logic after a short delay to ensure layout is settled
    setTimeout(() => {
        ScrollTrigger.refresh();
        checkInitialScrollPosition();
    }, 100);

    // Back to Top Button Logic
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}
