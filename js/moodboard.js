/* ==========================================================================
   Mood Board — Interactions
   Horizontal drag-to-scroll, progress bar slider, wheel hijack
   ========================================================================== */

(function () {
    'use strict';

    const canvas = document.getElementById('mbCanvas');
    const board = document.getElementById('mbBoard');
    const progressTrack = document.getElementById('mbProgressTrack');
    const progressFill = document.getElementById('mbProgressFill');
    const progressThumb = document.getElementById('mbProgressThumb');
    const progressPct = document.getElementById('mbProgressPct');

    if (!canvas || !board) return;

    // ---- Sync progress bar with scroll ----
    function syncProgress() {
        const maxScroll = canvas.scrollWidth - canvas.clientWidth;
        if (maxScroll <= 0) return;
        const pct = canvas.scrollLeft / maxScroll;
        const pctClamped = Math.max(0, Math.min(1, pct));
        if (progressFill) progressFill.style.width = (pctClamped * 100) + '%';
        if (progressThumb) progressThumb.style.left = (pctClamped * 100) + '%';
        if (progressPct) progressPct.textContent = Math.round(pctClamped * 100) + '%';
    }

    canvas.addEventListener('scroll', syncProgress, { passive: true });

    // ---- Drag-to-scroll on the canvas ----
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;

    canvas.addEventListener('mousedown', (e) => {
        if (e.target.closest('a, button')) return;
        isDragging = true;
        startX = e.pageX;
        scrollStart = canvas.scrollLeft;
        canvas.style.cursor = 'grabbing';
        canvas.style.userSelect = 'none';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.pageX - startX;
        canvas.scrollLeft = scrollStart - dx;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'grab';
            canvas.style.userSelect = '';
        }
    });

    // Touch drag support
    let touchStartX = 0;
    let touchScrollStart = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].pageX;
        touchScrollStart = canvas.scrollLeft;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        const dx = e.touches[0].pageX - touchStartX;
        canvas.scrollLeft = touchScrollStart - dx;
    }, { passive: true });

    // ---- Mouse wheel → horizontal scroll ----
    canvas.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        canvas.scrollLeft += e.deltaY * 2;
    }, { passive: false });

    // ---- Progress thumb drag ----
    let isThumbDragging = false;

    function startThumbDrag(e) {
        isThumbDragging = true;
        e.preventDefault();
        e.stopPropagation();
    }

    function moveThumbDrag(e) {
        if (!isThumbDragging || !progressTrack) return;
        const rect = progressTrack.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let pct = (clientX - rect.left) / rect.width;
        pct = Math.max(0, Math.min(1, pct));
        const maxScroll = canvas.scrollWidth - canvas.clientWidth;
        canvas.scrollLeft = pct * maxScroll;
    }

    function stopThumbDrag() {
        isThumbDragging = false;
    }

    if (progressThumb) {
        progressThumb.addEventListener('mousedown', startThumbDrag);
        progressThumb.addEventListener('touchstart', startThumbDrag, { passive: false });
    }

    window.addEventListener('mousemove', moveThumbDrag);
    window.addEventListener('touchmove', moveThumbDrag, { passive: false });
    window.addEventListener('mouseup', stopThumbDrag);
    window.addEventListener('touchend', stopThumbDrag);

    // ---- Click on progress track to jump ----
    if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
            if (isThumbDragging) return;
            const rect = progressTrack.getBoundingClientRect();
            let pct = (e.clientX - rect.left) / rect.width;
            pct = Math.max(0, Math.min(1, pct));
            const maxScroll = canvas.scrollWidth - canvas.clientWidth;
            canvas.scrollTo({ left: pct * maxScroll, behavior: 'smooth' });
        });
    }

    // ---- Keyboard navigation ----
    document.addEventListener('keydown', (e) => {
        // Only if moodboard is visible
        if (!canvas.offsetParent) return;
        const step = canvas.clientWidth * 0.4;
        if (e.key === 'ArrowRight') {
            canvas.scrollBy({ left: step, behavior: 'smooth' });
        } else if (e.key === 'ArrowLeft') {
            canvas.scrollBy({ left: -step, behavior: 'smooth' });
        }
    });

    // Initialize
    syncProgress();
})();
