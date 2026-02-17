class CanvasImageSequence {
    constructor(options) {
        this.canvasId = options.canvasId;
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) {
            console.error(`Canvas element #${this.canvasId} not found.`);
            return;
        }

        this.ctx = this.canvas.getContext('2d', { alpha: options.alpha !== undefined ? options.alpha : false });
        this.ctx.imageSmoothingEnabled = true;

        this.framePaths = options.framePaths || [];
        this.frameCount = this.framePaths.length;

        this.images = [];
        this.currentFrameIndex = 0;
        this.loadedCount = 0;
        this.onLoadComplete = options.onLoadComplete || null;

        // Configuration
        this.scaling = options.scaling || 'cover'; // 'cover' or 'contain'
        this.alignment = options.alignment || 'center'; // 'center', 'top', etc.

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
        if (this.framePaths.length > 0) {
            this.preloadImages();
        }
    }

    preloadImages() {
        this.framePaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                this.loadedCount++;
                if (this.loadedCount === 1 && index === 0) {
                    this.render(0); // Render first frame immediately
                }
                if (this.loadedCount === this.frameCount && this.onLoadComplete) {
                    this.onLoadComplete();
                }
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${path}`);
                this.loadedCount++; // Still count to avoid stalling
            };
            img.src = path;
            this.images[index] = img;
        });
    }

    resize() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;

        // Setup context scale so logic works in CSS pixels
        this.ctx.scale(dpr, dpr);

        this.render(this.currentFrameIndex);
    }

    render(frameIndex) {
        if (!this.canvas || this.images.length === 0) return;

        // Clamp frame index
        const idx = Math.max(0, Math.min(Math.round(frameIndex), this.frameCount - 1));
        this.currentFrameIndex = idx;

        const img = this.images[idx];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const cw = window.innerWidth; // CSS pixels due to scale()
        const ch = window.innerHeight;

        // Clear (using robust clear)
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to clear full buffer
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        // Calculate aspect ratios
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cw / ch;

        let renderW, renderH, offsetX, offsetY;

        // Logic for 'cover'
        if (this.scaling === 'cover') {
            if (canvasRatio > imgRatio) {
                renderW = cw;
                renderH = cw / imgRatio;
                offsetX = 0;
                offsetY = (ch - renderH) / 2;
            } else {
                renderW = ch * imgRatio;
                renderH = ch;
                offsetX = (cw - renderW) / 2;
                offsetY = 0;
            }

            // Optional: slight overscale to prevent bleed
            const scale = 1.02;
            const cx = offsetX + renderW / 2;
            const cy = offsetY + renderH / 2;

            renderW *= scale;
            renderH *= scale;
            offsetX = cx - renderW / 2;
            offsetY = cy - renderH / 2;
        }

        this.ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    }

    get progress() {
        return this.currentFrameIndex / (this.frameCount - 1);
    }

    set progress(val) {
        const frame = val * (this.frameCount - 1);
        this.render(frame);
    }

    // Cleanup to free memory if needed (optional)
    destroy() {
        window.removeEventListener('resize', this.resize.bind(this));
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.images = [];
    }
}

// Expose to window for global access
window.CanvasImageSequence = CanvasImageSequence;
