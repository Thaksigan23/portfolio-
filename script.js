// Premium Portfolio Script V2
document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle && themeToggle.querySelector('i');

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    if (icon) updateThemeIcon(savedTheme);

    if (themeToggle && icon) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Mobile drawer nav (index only)
    const hamburger = document.getElementById('nav-hamburger');
    const navOverlay = document.getElementById('nav-drawer-overlay');
    const primaryNav = document.getElementById('primary-navigation');
    function setNavDrawerOpen(open) {
        if (!hamburger) return;
        document.body.classList.toggle('nav-open', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
        if (navOverlay) navOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    if (hamburger && primaryNav) {
        hamburger.addEventListener('click', () => {
            setNavDrawerOpen(!document.body.classList.contains('nav-open'));
        });
        if (navOverlay) {
            navOverlay.addEventListener('click', () => setNavDrawerOpen(false));
        }
        primaryNav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => setNavDrawerOpen(false));
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) setNavDrawerOpen(false);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
                setNavDrawerOpen(false);
            }
        });
    }

    // 2. Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
        }, 80);
    });

    const interactiveElements = document.querySelectorAll('a, button, .stat, .bento-item, .project-card, .theme-toggle, .filter-btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            follower.style.transform = 'scale(2.5)';
            follower.style.background = 'rgba(0, 212, 255, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            follower.style.transform = 'scale(1)';
            follower.style.background = 'transparent';
        });
    });

    // 3. Counter Animation Logic
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-target'));
                animateCounter(target, endValue);
                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(counter => {
        counterObserver.observe(counter);
    });

    function animateCounter(el, target) {
        let current = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 16);
    }

    // 4. Project Filtering Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 500);
                }
            });
        });
    });

    // 5. Typewriter Effect
    const professionElement = document.getElementById('rotating-profession');
    const professions = ['Software Developer', 'UI/UX Enthusiast', 'Full-Stack Engineer', 'Problem Solver'];
    let profIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        const current = professions[profIndex];
        professionElement.textContent = isDeleting ? current.substring(0, charIndex - 1) : current.substring(0, charIndex + 1);
        charIndex = isDeleting ? charIndex - 1 : charIndex + 1;

        let typeSpeed = isDeleting ? 50 : 150;
        if (!isDeleting && charIndex === current.length) { typeSpeed = 2000; isDeleting = true; }
        else if (isDeleting && charIndex === 0) { isDeleting = false; profIndex = (profIndex + 1) % professions.length; typeSpeed = 500; }
        setTimeout(type, typeSpeed);
    }
    type();

    // 6. Scroll Reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-title, .contact-lead, .home-text, .home-image, .about-text, .bento-item, .contact-card, .journey-item, .testimonial-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
        revealObserver.observe(el);
    });

    // 7. Back to Top Logic
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 8. Journey timeline — sort by date, filter by category
    const journeyGrid = document.getElementById('journey-grid');
    const journeyEmpty = document.getElementById('journey-empty');
    const journeyFilters = document.querySelectorAll('.journey-filter');

    if (journeyGrid) {
        const journeyItems = Array.from(journeyGrid.querySelectorAll('.journey-item'));
        journeyItems
            .sort((a, b) => Number(b.dataset.sort) - Number(a.dataset.sort))
            .forEach((item) => journeyGrid.appendChild(item));

        function applyJourneyFilter(filter) {
            let visibleCount = 0;
            journeyItems.forEach((item) => {
                const show = filter === 'all' || item.dataset.category === filter;
                item.classList.toggle('is-hidden', !show);
                if (show) visibleCount += 1;
            });
            if (journeyEmpty) journeyEmpty.hidden = visibleCount > 0;
        }

        journeyFilters.forEach((btn) => {
            btn.addEventListener('click', () => {
                journeyFilters.forEach((b) => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                applyJourneyFilter(btn.dataset.filter);
            });
        });
    }

    // 9. Project Details Modal
    const projectData = {
        careerguide: {
            category: 'Web App',
            title: 'CareerGuide Hub',
            image: 'images/careerguide.png',
            description: 'CareerGuide Hub is a full-stack platform that helps students and early professionals discover the best career path based on skills, interests, and goals. It includes secure authentication, a personalized dashboard, and dynamic recommendation logic that maps user profiles to suitable careers. The system also allows users to track progress, explore learning paths, and access practical guidance resources in one place.',
            points: [
                'Secure login and user profile personalization',
                'Skill-based career recommendations',
                'Dashboard for progress and guidance resources'
            ],
            tech: ['React', 'Node.js', 'Express', 'MySQL'],
            github: 'https://github.com/Thaksigan23/career-guidance-system'
        },
        bookstore: {
            category: 'Web App',
            title: 'Book Selling E-commerce',
            image: 'images/ecombook.png',
            description: 'Book Selling E-commerce is an online bookstore designed to provide a smooth shopping experience for readers. Users can browse books by category, search by title or author, view detailed product pages, and manage their cart before checkout. The platform focuses on a clean user interface, responsive design, and reliable order flow, making it easy for customers to discover and buy books from any device.',
            points: [
                'Book catalog with category and search filters',
                'Cart and checkout flow for easy purchasing',
                'Responsive UI optimized for mobile and desktop'
            ],
            tech: ['React', 'Node.js', 'Express', 'MongoDB'],
            github: '#'
        }
    };

    const modalOverlay = document.getElementById('project-modal-overlay');
    const modalCloseBtn = document.getElementById('project-modal-close');
    const modalImage = document.getElementById('project-modal-image');
    const modalCategory = document.getElementById('project-modal-category');
    const modalTitle = document.getElementById('project-modal-title');
    const modalDescription = document.getElementById('project-modal-description');
    const modalPoints = document.getElementById('project-modal-points');
    const modalTech = document.getElementById('project-modal-tech');
    const modalGithub = document.getElementById('project-modal-github');
    const projectTriggers = document.querySelectorAll('.js-open-project');

    function openProjectModal(projectKey) {
        const project = projectData[projectKey];
        if (!project) return;

        modalImage.src = project.image;
        modalImage.alt = `${project.title} preview`;
        modalCategory.textContent = project.category;
        modalTitle.textContent = project.title;
        modalDescription.textContent = project.description;
        modalPoints.innerHTML = project.points.map(item => `<li>${item}</li>`).join('');
        modalGithub.href = project.github;
        modalGithub.setAttribute('aria-disabled', project.github === '#' ? 'true' : 'false');
        modalGithub.textContent = project.github === '#' ? 'GitHub Link Coming Soon' : 'View GitHub';
        modalTech.innerHTML = project.tech.map(item => `<span>${item}</span>`).join('');

        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        modalOverlay.classList.remove('active');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    projectTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openProjectModal(trigger.dataset.project);
        });
    });

    modalCloseBtn.addEventListener('click', closeProjectModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeProjectModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeProjectModal();
        }
    });

    // 10. Contact form → mailto (no backend)
    const contactForm = document.getElementById('contactForm');
    const contactFormStatus = document.getElementById('contact-form-status');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subjectField = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const to = 'thaksithaksigan@gmail.com';
            const subjectLine = subjectField || `Portfolio inquiry from ${name}`;
            const body = [`From: ${name}`, `Reply-To: ${email}`, '', message].join('\n');
            const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailto;
            if (contactFormStatus) {
                contactFormStatus.textContent =
                    'If your email app did not open, copy your message and send it to thaksithaksigan@gmail.com.';
            }
        });
    }

    // Dynamic Style Injection for Reveal
    const style = document.createElement('style');
    style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    console.log('Portfolio Premium V2 Loaded 🚀');
});
