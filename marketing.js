/**
 * Shared behavior for digital-marketing hub and poster collection pages.
 * Theme toggle + poster lightbox + image fallbacks (no dependency on script.js).
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        body.setAttribute('data-theme', savedTheme);
        if (icon) icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        themeToggle.addEventListener('click', () => {
            const current = body.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            if (icon) icon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }

    const posterLightbox = document.getElementById('poster-lightbox');
    const posterLightboxImg = document.getElementById('poster-lightbox-img');
    const posterLightboxCaption = document.getElementById('poster-lightbox-caption');
    const posterLightboxClose = document.getElementById('poster-lightbox-close');

    function closePosterLightbox() {
        if (!posterLightbox) return;
        posterLightbox.classList.remove('active');
        posterLightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (posterLightboxImg) posterLightboxImg.src = '';
    }

    function openPosterLightbox(imgEl, caption) {
        if (!posterLightbox || !posterLightboxImg) return;
        posterLightboxImg.src = imgEl.currentSrc || imgEl.src;
        posterLightboxImg.alt = imgEl.alt || 'Poster';
        if (posterLightboxCaption) posterLightboxCaption.textContent = caption || '';
        posterLightbox.classList.add('active');
        posterLightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.poster-tile img[data-fallback]').forEach((img) => {
        img.addEventListener('error', function onPosterImgError() {
            img.removeEventListener('error', onPosterImgError);
            const fb = img.getAttribute('data-fallback');
            if (fb) img.src = fb;
        });
    });

    document.querySelectorAll('.js-poster-open').forEach((btn) => {
        btn.addEventListener('click', () => {
            const imgEl = btn.querySelector('img');
            if (!imgEl) return;
            openPosterLightbox(imgEl, btn.dataset.caption || '');
        });
    });

    if (posterLightboxClose) posterLightboxClose.addEventListener('click', closePosterLightbox);
    if (posterLightbox) {
        posterLightbox.addEventListener('click', (event) => {
            if (event.target === posterLightbox) closePosterLightbox();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && posterLightbox && posterLightbox.classList.contains('active')) {
            closePosterLightbox();
        }
    });

    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
