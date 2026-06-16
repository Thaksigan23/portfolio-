document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.getElementById('blog-posts');
    const emptyEl = document.getElementById('blog-empty');
    const searchInput = document.getElementById('blog-search');
    const categoriesEl = document.getElementById('blog-categories');

    if (!postsContainer) return;

    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatDate(iso) {
        if (!iso) return '';
        // Keep it deterministic: show YYYY-MM-DD to avoid timezone shifts.
        return String(iso);
    }

    let posts = [];
    let activeCategory = 'all';
    const query = { value: '' };

    function renderCategoryButtons(categories) {
        if (!categoriesEl) return;

        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'blog-filter active';
        allBtn.dataset.filter = 'all';
        allBtn.textContent = 'All';
        allBtn.setAttribute('aria-selected', 'true');

        categoriesEl.innerHTML = '';
        categoriesEl.appendChild(allBtn);

        categories.forEach((cat) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'blog-filter';
            btn.dataset.filter = cat;
            btn.textContent = cat;
            btn.setAttribute('aria-selected', 'false');
            categoriesEl.appendChild(btn);
        });
    }

    function matchesFilters(post) {
        const categoryOk = activeCategory === 'all' || post.category === activeCategory;
        if (!categoryOk) return false;

        const q = query.value.trim().toLowerCase();
        if (!q) return true;

        const haystack = `${post.title} ${post.excerpt}`.toLowerCase();
        return haystack.includes(q);
    }

    function renderPosts(list) {
        if (!postsContainer) return;
        postsContainer.innerHTML = '';

        const visible = list.filter(matchesFilters);
        if (emptyEl) emptyEl.hidden = visible.length > 0;

        postsContainer.style.gridAutoRows = '1fr';

        visible
            .sort((a, b) => String(b.date).localeCompare(String(a.date)))
            .forEach((post) => {
                const article = document.createElement('article');
                article.className = 'blog-card';
                article.setAttribute('data-category', post.category || '');

                const href = `blog/posts/${post.slug}.html`;
                article.innerHTML = `
                    <div class="blog-meta">
                        <span class="blog-date">${escapeHtml(formatDate(post.date))}</span>
                        <span class="blog-dot" aria-hidden="true"></span>
                        <span class="blog-category">${escapeHtml(post.category || '')}</span>
                    </div>
                    <h3 class="blog-title">${escapeHtml(post.title || '')}</h3>
                    <p class="blog-excerpt">${escapeHtml(post.excerpt || '')}</p>
                    <a class="blog-post-link" href="${href}">
                        <span>Read</span>
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </a>
                `;

                postsContainer.appendChild(article);
            });

        // Staggered reveal for newly created cards
        const cards = Array.from(postsContainer.querySelectorAll('.blog-card'));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.filter = 'blur(0px)';
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(18px)';
            card.style.filter = 'blur(3px)';
            card.style.transition = `opacity 0.6s ease ${i * 60}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 60}ms, filter 0.6s ease ${i * 60}ms`;
            observer.observe(card);
        });
    }

    function applyAllWiring() {
        if (categoriesEl) {
            categoriesEl.addEventListener('click', (event) => {
                const target = event.target.closest('button.blog-filter');
                if (!target) return;

                const next = target.dataset.filter || 'all';
                activeCategory = next;

                categoriesEl.querySelectorAll('button.blog-filter').forEach((b) => {
                    b.classList.toggle('active', b === target);
                    b.setAttribute('aria-selected', b === target ? 'true' : 'false');
                });

                renderPosts(posts);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                query.value = searchInput.value || '';
                renderPosts(posts);
            });
        }
    }

    try {
        const res = await fetch('data/posts.json', { cache: 'no-store' });
        const json = await res.json();
        posts = Array.isArray(json.posts) ? json.posts : [];

        const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort();
        renderCategoryButtons(categories);
        applyAllWiring();
        renderPosts(posts);
    } catch (err) {
        console.error('Failed to load blog posts:', err);
        if (emptyEl) {
            emptyEl.hidden = false;
            emptyEl.textContent = 'Sorry, blog posts could not be loaded.';
        }
    }
});

