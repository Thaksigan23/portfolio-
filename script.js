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

    if (cursor && follower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';

            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 80);
        });

        const interactiveElements = document.querySelectorAll('a, button, .stat, .bento-item, .project-card, .theme-toggle, .filter-btn, .blog-card, .blog-back, .blog-post-link, .project-action-btn');
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
    }

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

    // 5. Typewriter Effect (index only)
    const professionElement = document.getElementById('rotating-profession');
    if (professionElement) {
        const professions = ['Full-Stack Developer', 'React & Node.js Builder', 'UI/UX Enthusiast', 'Open to Internships'];
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
    }

    // 6. Scroll Reveal
    const revealEls = Array.from(document.querySelectorAll('.section-title, .contact-lead, .home-text, .home-image, .about-text, .bento-item, .contact-card, .journey-item, .testimonial-card, .blog-card, .blog-hero, .blog-article'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealNow = (el) => el.classList.add('revealed');

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
        // No animation support (or user prefers reduced motion): show everything immediately.
        revealEls.forEach(revealNow);
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealNow(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

        revealEls.forEach((el, index) => {
            const delay = el.classList.contains('journey-item')
                ? index * 0.07
                : index * 0.05;
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`;
            revealObserver.observe(el);
        });

        // Safety net: never let a section stay invisible. If anything in view
        // hasn't revealed shortly after load, reveal it directly.
        const revealVisible = () => {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            revealEls.forEach((el) => {
                if (el.classList.contains('revealed')) return;
                const rect = el.getBoundingClientRect();
                if (rect.top < vh && rect.bottom > 0) {
                    revealNow(el);
                    revealObserver.unobserve(el);
                }
            });
        };
        window.addEventListener('load', () => setTimeout(revealVisible, 600));
        setTimeout(revealVisible, 1500);
    }

    // 7. Back to Top Logic
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 8. Journey timeline — sort by date, filter by category
    const journeyGrid = document.getElementById('journey-grid');
    const journeyEmpty = document.getElementById('journey-empty');
    const journeyFilters = document.querySelectorAll('.journey-filter');

    if (journeyGrid) {
        const journeyItems = Array.from(journeyGrid.querySelectorAll('.journey-item'));
        journeyItems.forEach((item) => {
            if (item.querySelector('.journey-badge')) {
                item.classList.add('is-current');
            }
        });
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

    // 9. Project Details Modal (index only)
    const projectData = {
        careerguide: {
            category: 'Web App',
            title: 'CareerGuide Hub',
            image: 'images/careerguidance/cg3.png',
            description: 'A full-stack career platform where students build professional profiles and find matching jobs, employers post jobs and review applicants, and admins moderate the platform. It blends a job board, an AI-style CV/skill matcher, and a LinkedIn-style professional network — all wrapped in a modern "Aurora Glow" UI.',
            problem: 'Students struggle to connect their skills to real opportunities, while employers and the platform itself lack a unified space for job matching, professional networking, and moderation.',
            role: 'Sole full-stack developer — designed the Aurora Glow UI (glassmorphism, gradients, Clash Display + Satoshi fonts), built the React 18 + Vite frontend, the Node.js/Express REST API, and the Supabase (PostgreSQL) schema with role-based access for students, employers, and admins.',
            challenge: 'Bringing a job board, AI-style skill matching, and a full LinkedIn-style social layer (connections, feed, endorsements) into one performant app — with secure, role-based access and three distinct dashboards sharing a single consistent experience.',
            outcome: 'Deployed live on Vercel with JWT auth, three role-based dashboards, an AI CV analyzer, skill-based job matching, and a complete networking layer — profiles, timelines, connections, an activity feed, and skill endorsements.',
            points: [
                '<strong>AI CV Analyzer (signature feature)</strong> — upload a CV/résumé to get an instant skill-based analysis, a match score, and personalized job suggestions with saved history',
                'AI-style job matching that scores jobs against a student\u2019s skills and experience, visualized with a gauge + bar-chart insights graph',
                'Job board — employers post jobs, admins approve/reject, and students browse, search, save, and apply',
                'LinkedIn-style networking — rich profiles with an "Open to work" badge, experience/education timelines, connections, an activity feed, and skill endorsements',
                'Three role-based dashboards — student home feed, employer job stats & applicant tracking, and admin platform stats, user management, and job moderation',
                'JWT authentication with bcrypt-hashed passwords and role-based access (student, employer, admin)',
                'Hardened API with Helmet security headers, rate limiting, input validation, and CORS allow-listing'
            ],
            tech: ['React 18', 'Vite', 'Tailwind CSS', 'Recharts', 'Node.js', 'Express', 'Supabase', 'JWT'],
            gallery: [
                { src: 'images/careerguidance/cg3.png', caption: 'AI CV Analyzer' },
                { src: 'images/careerguidance/cg4.png', caption: 'AI job recommendations' },
                { src: 'images/careerguidance/cg2.png', caption: 'Student feed & match insights' },
                { src: 'images/careerguidance/cg1.png', caption: 'Employer hiring dashboard' }
            ],
            live: 'https://career-guidance-system-plum.vercel.app',
            github: 'https://github.com/Thaksigan23/career-guidance-system'
        },
        bookstore: {
            category: 'Web App',
            title: 'Book Selling E-commerce',
            image: 'images/ecombook.png',
            description: 'An online bookstore where users can browse books by category, manage a shopping cart, and complete a checkout flow.',
            problem: 'Needed a practical e-commerce system to demonstrate end-to-end product catalog, cart state, and order handling.',
            role: 'Full-stack developer — built the product listing UI, cart logic, API endpoints, and MongoDB data models.',
            challenge: 'Keeping cart state consistent across pages and structuring the product catalog for easy browsing and filtering.',
            outcome: 'Working bookstore application with category filters, cart management, and a complete checkout user flow.',
            points: [
                'Product catalog with search and category filters',
                'Persistent cart with add/remove/update quantity',
                'Checkout flow with order summary',
                'RESTful API backed by MongoDB'
            ],
            tech: ['React', 'Node.js', 'Express', 'MongoDB'],
            live: '',
            github: 'https://github.com/Thaksigan23/ecomica'
        },
        aiassistant: {
            category: 'AI Assistant',
            title: 'Nova — Personal AI Assistant',
            image: 'images/ai-assistant.png',
            description: 'A personal AI assistant I\u2019m building to help with coding, research, and everyday tasks — combining conversational chat, contextual memory, and a fast, distraction-free interface.',
            problem: 'Switching between separate tools for coding help, research, and notes breaks focus. I wanted one assistant that remembers context and adapts to how I actually work.',
            role: 'Solo builder — designing the product, the chat UX, the prompt/orchestration layer, and the backend that connects to LLM and retrieval services.',
            challenge: 'Giving the assistant useful long-term memory and accurate, grounded answers while keeping responses fast and the interface simple.',
            outcome: 'An in-progress assistant with a working chat interface, conversation history, and a retrieval layer for context-aware answers — actively evolving toward a daily-driver tool.',
            points: [
                'Conversational chat with streaming responses and saved history',
                'Contextual memory using a vector database for retrieval-augmented answers',
                'Code-aware help with syntax-highlighted snippets',
                'Clean, keyboard-friendly UI focused on speed and minimal distraction'
            ],
            tech: ['React', 'Node.js', 'LLM APIs', 'Vector DB'],
            gallery: [
                { src: 'images/ai-assistant.png', caption: 'Chat interface with code-aware answers' }
            ],
            live: '',
            github: ''
        },
        figmawireframe: {
            category: 'Figma Plugin',
            title: 'Site \u2192 Wireframe',
            image: 'images/figma-wireframe.png',
            description: 'A Figma plugin that converts any live website into a clean, low-fidelity wireframe in seconds, so designers can skip hours of manual setup and start iterating on layout and structure right away.',
            problem: 'Recreating an existing site\u2019s structure as a wireframe is slow and repetitive — designers spend hours boxing out sections before they can even start improving the design.',
            role: 'Solo developer — built the plugin UI, the page-parsing logic, and the wireframe-generation engine that maps real DOM structure to Figma layers.',
            challenge: 'Translating messy, real-world web layouts into a tidy wireframe — detecting sections, swapping images for placeholders, and simplifying typography while preserving the original structure.',
            outcome: 'A working plugin that ingests a URL and outputs an editable, low-fidelity wireframe directly on the Figma canvas, dramatically cutting the time from reference site to first draft.',
            points: [
                'Paste a URL and generate an editable wireframe on the Figma canvas',
                'Auto-detects sections and converts images to placeholder blocks',
                'Simplifies colors and typography for true low-fidelity output',
                'Toggle options for navigation, footer, and image placeholders'
            ],
            tech: ['Figma Plugin API', 'TypeScript', 'React', 'Node.js'],
            gallery: [
                { src: 'images/figma-wireframe.png', caption: 'Live site converted into an editable wireframe' }
            ],
            live: '',
            github: ''
        },
        employeemonitor: {
            category: 'Enterprise Suite',
            title: 'Employee Monitoring & Workforce Management Suite',
            subtitle: 'Full-Stack & Desktop Systems Engineer',
            image: 'images/employeemonitor/ems-portal.png',
            description: 'Engineered an end-to-end, production-grade workforce productivity platform designed for modern remote and hybrid teams, enabling real-time activity tracking, interactive analytics, and seamless cross-role communication.',
            longDescription: 'Authored a lightweight, low-overhead Python background desktop client utilizing system-level hooks to securely monitor active application focus and track productivity metrics. Built a live web-dashboard streaming bidirectional telemetry data via Socket.io pipelines, and configured automated PowerShell build-release workflows to compile scripts into deployable enterprise executables (.exe) with pre-configured batch installers.',
            problem: 'Remote and hybrid teams need unified visibility into workforce productivity without heavy, intrusive tooling that slows down employee machines.',
            role: 'Full-Stack & Desktop Systems Engineer — built the Python desktop telemetry client, the React/Node.js live dashboard, and PowerShell release automation for enterprise .exe deployment.',
            challenge: 'Streaming real-time desktop activity data with minimal system overhead while packaging the stack into installable enterprise executables with reliable cross-role communication.',
            outcome: 'A production-grade suite with a low-overhead desktop client, Socket.io-powered live dashboard, and automated PowerShell build pipelines delivering deployable enterprise installers.',
            points: [
                'Python background client with system-level hooks for active-app focus and productivity metrics',
                'Live web dashboard with bidirectional Socket.io telemetry pipelines',
                'Automated PowerShell build-release workflows compiling scripts into enterprise .exe installers',
                'Real-time analytics and cross-role communication for remote and hybrid teams'
            ],
            tech: ['Python', 'Node.js', 'React.js', 'MongoDB', 'Socket.io', 'PowerShell', 'Tailwind CSS'],
            gallery: [
                { src: 'images/employeemonitor/ems-portal.png', caption: 'KAIONEX Employee Portal' }
            ],
            live: '',
            github: '',
            isCompanyProject: true,
            collaborator: 'Internal Agency Product',
            companyDetails: 'Proprietary internal enterprise suite engineered to optimize workforce management operations.'
        },
        orbitportal: {
            category: 'SaaS Platform',
            title: 'Orbit Client Portal (Client Management System)',
            subtitle: 'SaaS Architecture & Full-Stack Engineer',
            image: 'images/orbit-portal-cover.svg',
            description: 'Engineered a modern, production-grade white-label Progressive Web App (PWA) client portal that enables companies to securely collaborate with clients, manage assets, and handle workflows within isolated corporate environments.',
            longDescription: 'Architected database isolation logic using Supabase Row-Level Security (RLS) and SQL triggers to ensure strict corporate workspace isolation (one organization per company signup). Leveraged Next.js App Router for server-side rendering, dynamic routing, and optimized data-fetching to ensure instantaneous page loads. Integrated an encrypted Asset Vault utilizing cloud storage buckets with time-limited signed URLs to protect sensitive user files.',
            problem: 'B2B client portals must keep each organization\u2019s data strictly isolated while still delivering fast, white-label experiences and secure file handling.',
            role: 'SaaS Architecture & Full-Stack Engineer — designed multi-tenant isolation, built the Next.js PWA, and integrated encrypted asset storage with signed URL access.',
            challenge: 'Enforcing per-organization data isolation at the database layer while maintaining instant SSR page loads and securing the asset vault for sensitive client files.',
            outcome: 'A white-label PWA with Supabase RLS workspace isolation, Next.js App Router performance, and an encrypted Asset Vault backed by time-limited signed URLs.',
            points: [
                'Supabase Row-Level Security (RLS) and SQL triggers for strict corporate workspace isolation',
                'Next.js App Router with SSR, dynamic routing, and optimized data-fetching',
                'Encrypted Asset Vault with cloud storage buckets and time-limited signed URLs',
                'White-label PWA enabling secure client collaboration and workflow management'
            ],
            tech: ['Next.js', 'Supabase', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Recharts'],
            live: '',
            github: '',
            isCompanyProject: true,
            collaborator: 'Enterprise Client Deployment',
            companyDetails: 'Multi-tenant B2B suite engineered under agency framework for secure client delivery.'
        },
        thooddakkaaran: {
            category: 'Corporate Web',
            title: 'Thooddakkaaran Corporate Web Platform',
            subtitle: 'UI/UX Designer & Frontend Developer',
            image: 'images/thooddakkaaran/thooddakkaaran-home.webp',
            description: 'Designed and developed the official responsive web platform for Thooddakkaaran (Pvt) Ltd, showcasing large-scale agricultural initiatives, agrotech services, and localized corporate branding solutions.',
            longDescription: 'Formulated a high-fidelity, responsive user interface utilizing modern design systems to establish a strong, clean visual identity matching corporate guidelines. Implemented automated image and heavy asset optimization pipelines to handle high-resolution visual stories efficiently while performing comprehensive cross-browser and mobile performance tuning.',
            problem: 'Thooddakkaaran needed an official digital presence that communicates large-scale agricultural initiatives with a polished, localized corporate identity.',
            role: 'UI/UX Designer & Frontend Developer — owned visual design, responsive frontend implementation, and performance optimization for the corporate platform.',
            challenge: 'Delivering a high-fidelity brand experience with heavy visual storytelling assets while keeping load times fast across browsers and mobile devices.',
            outcome: 'A responsive corporate platform with optimized media pipelines, cross-browser tuning, and a clean visual identity aligned to Thooddakkaaran\u2019s brand guidelines.',
            points: [
                'High-fidelity responsive UI built with modern design systems and corporate branding',
                'Automated image and heavy asset optimization for high-resolution visual stories',
                'Cross-browser and mobile performance tuning across the full site',
                'Localized corporate branding for agricultural and agrotech services'
            ],
            tech: ['UI/UX Design', 'Frontend Development', 'Web Design', 'Responsive Web Design', 'HTML/CSS'],
            gallery: [
                { src: 'images/thooddakkaaran/thooddakkaaran-home.webp', caption: 'Thooddakkaaran homepage hero' }
            ],
            live: 'https://www.thooddakkaaran.com/#home',
            github: '',
            isCompanyProject: true,
            collaborator: 'Thooddakkaaran (Pvt) Ltd',
            companyDetails: 'Official platform designed and engineered under digital agency contract for Thooddakkaaran (Pvt) Ltd.'
        },
        techloomplatform: {
            category: 'Agency Platform',
            title: 'Techloom.ai Digital Platform Development',
            subtitle: 'Frontend Engineer & UI/UX Designer',
            image: 'images/techloom/techloom-home.png',
            description: 'Contributed to the core frontend engineering, modern architectural components, and performance optimizations for Techloom.ai, a high-performance digital experience platform built for global corporate branding and full-stack web solutions.',
            longDescription: 'Built and updated responsive, reusable UI components, optimizing the platform\u2019s layout to achieve an exceptional core web vital footprint (<2.0s average Largest Contentful Paint). Translated high-fidelity UI/UX design wireframes into clean frontend interfaces, assisted in structuring flexible schemas for Headless CMS architectures, and managed GitHub version control workflows to preserve visual hierarchy.',
            problem: 'Techloom.ai needed a fast, scalable frontend platform that could support global corporate branding while maintaining exceptional Core Web Vitals.',
            role: 'Frontend Engineer & UI/UX Designer — built reusable UI components, translated wireframes into production interfaces, and optimized layout performance.',
            challenge: 'Hitting sub-2.0s LCP targets while integrating Headless CMS flexibility and preserving visual hierarchy across a growing component library.',
            outcome: 'A high-performance platform frontend with reusable components, Headless CMS-ready schemas, and an average LCP under 2.0 seconds.',
            points: [
                'Responsive, reusable UI components optimized for Core Web Vitals (<2.0s average LCP)',
                'High-fidelity wireframes translated into clean, production-ready frontend interfaces',
                'Flexible Headless CMS schema structures for scalable content delivery',
                'GitHub version control workflows preserving visual hierarchy across releases'
            ],
            tech: ['Next.js', 'React.js', 'Tailwind CSS', 'Headless CMS', 'Web Performance Optimization', 'UI/UX Design'],
            gallery: [
                { src: 'images/techloom/techloom-home.png', caption: 'Techloom.ai platform homepage' },
                { src: 'images/techloom/techloom-logo.svg', caption: 'Techloom.ai brand mark' }
            ],
            live: 'https://techloom.ai/',
            github: '',
            isCompanyProject: true,
            collaborator: 'Agency Core Platform',
            companyDetails: 'Developed and optimized frontend UI layers as a core agency platform initiative.'
        }
    };

    const modalOverlay = document.getElementById('project-modal-overlay');
    const modalCloseBtn = document.getElementById('project-modal-close');
    const modalImage = document.getElementById('project-modal-image');
    const modalCategory = document.getElementById('project-modal-category');
    const modalTitle = document.getElementById('project-modal-title');
    const modalDescription = document.getElementById('project-modal-description');
    const modalProblem = document.getElementById('project-modal-problem');
    const modalRole = document.getElementById('project-modal-role');
    const modalChallenge = document.getElementById('project-modal-challenge');
    const modalOutcome = document.getElementById('project-modal-outcome');
    const modalPoints = document.getElementById('project-modal-points');
    const modalTech = document.getElementById('project-modal-tech');
    const modalLive = document.getElementById('project-modal-live');
    const modalGithub = document.getElementById('project-modal-github');
    const modalGallery = document.getElementById('project-modal-gallery');
    const modalThumbs = document.getElementById('project-modal-thumbs');
    const modalCorpBadge = document.getElementById('project-modal-corp-badge');
    const modalCorpDetails = document.getElementById('project-modal-corp-details');
    const modalSubtitle = document.getElementById('project-modal-subtitle');
    const projectTriggers = document.querySelectorAll('.js-open-project');

    const canUseModal =
        modalOverlay && modalCloseBtn && modalImage && modalCategory && modalTitle &&
        modalDescription && modalProblem && modalRole && modalChallenge && modalOutcome &&
        modalPoints && modalTech && modalGithub;

    if (canUseModal) {
        function openProjectModal(projectKey) {
            const project = projectData[projectKey];
            if (!project) return;

            modalImage.src = project.image;
            modalImage.alt = `${project.title} preview`;
            modalCategory.textContent = project.category;
            modalTitle.textContent = project.title;
            if (modalSubtitle) {
                if (project.subtitle) {
                    modalSubtitle.textContent = project.subtitle;
                    modalSubtitle.hidden = false;
                } else {
                    modalSubtitle.textContent = '';
                    modalSubtitle.hidden = true;
                }
            }
            modalDescription.textContent = project.description;
            if (modalCorpBadge && modalCorpDetails) {
                if (project.isCompanyProject) {
                    modalCorpBadge.hidden = false;
                    modalCorpDetails.hidden = false;
                    modalCorpDetails.innerHTML = [
                        project.collaborator ? `<strong>${project.collaborator}</strong>` : '',
                        project.companyDetails || ''
                    ].filter(Boolean).join(' — ');
                } else {
                    modalCorpBadge.hidden = true;
                    modalCorpDetails.hidden = true;
                    modalCorpDetails.textContent = '';
                }
            }
            if (modalProblem) modalProblem.textContent = project.problem || '';
            if (modalRole) modalRole.textContent = project.role || '';
            if (modalChallenge) modalChallenge.textContent = project.challenge || '';
            if (modalOutcome) modalOutcome.textContent = project.outcome || '';
            modalPoints.innerHTML = project.points.map(item => `<li>${item}</li>`).join('');
            modalTech.innerHTML = project.tech.map(item => `<span>${item}</span>`).join('');

            if (modalGallery && modalThumbs) {
                const gallery = Array.isArray(project.gallery) ? project.gallery : [];
                if (gallery.length) {
                    modalThumbs.innerHTML = gallery.map((shot, index) => `
                        <button type="button" class="project-modal-thumb${index === 0 ? ' active' : ''}" data-src="${shot.src}" aria-label="View ${shot.caption || 'screenshot'}">
                            <img src="${shot.src}" alt="${shot.caption || project.title + ' screenshot'}" loading="lazy">
                            <span class="project-modal-thumb-caption">${shot.caption || ''}</span>
                        </button>
                    `).join('');
                    modalGallery.hidden = false;

                    modalThumbs.querySelectorAll('.project-modal-thumb').forEach(thumb => {
                        thumb.addEventListener('click', () => {
                            modalImage.src = thumb.dataset.src;
                            modalThumbs.querySelectorAll('.project-modal-thumb').forEach(t => t.classList.remove('active'));
                            thumb.classList.add('active');
                        });
                    });
                } else {
                    modalThumbs.innerHTML = '';
                    modalGallery.hidden = true;
                }
            }

            modalGithub.href = project.github || '#';
            modalGithub.style.display = project.github ? 'inline-flex' : 'none';

            if (modalLive) {
                if (project.live) {
                    modalLive.href = project.live;
                    modalLive.style.display = 'inline-flex';
                } else {
                    modalLive.style.display = 'none';
                }
            }

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
    }

    // 10. Contact form → FormSubmit (emails thaksithaksigan@gmail.com)
    const CONTACT_EMAIL = 'thaksithaksigan@gmail.com';
    const contactForm = document.getElementById('contactForm');
    const contactFormStatus = document.getElementById('contact-form-status');
    if (contactForm) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const submitBtnLabel = submitBtn?.querySelector('span');
        const defaultBtnText = submitBtnLabel?.textContent || 'Send message';

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const honeypot = contactForm.querySelector('[name="_honey"]');
            if (honeypot?.value) {
                return;
            }

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subjectField = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const subjectLine = subjectField || `Portfolio inquiry from ${name}`;

            if (contactFormStatus) {
                contactFormStatus.textContent = '';
                contactFormStatus.classList.remove('is-success', 'is-error');
            }

            if (submitBtn) {
                submitBtn.disabled = true;
            }
            if (submitBtnLabel) {
                submitBtnLabel.textContent = 'Sending…';
            }

            try {
                const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        subject: subjectLine,
                        message,
                        _subject: `Portfolio: ${subjectLine}`,
                        _template: 'table',
                        _captcha: 'false',
                    }),
                });

                const data = await response.json().catch(() => null);

                if (!response.ok || data?.success === false) {
                    throw new Error(data?.message || 'Send failed');
                }

                contactForm.reset();
                if (contactFormStatus) {
                    contactFormStatus.textContent = 'Message sent! I will get back to you soon.';
                    contactFormStatus.classList.add('is-success');
                }
            } catch {
                if (contactFormStatus) {
                    contactFormStatus.textContent = `Could not send right now. Please email me at ${CONTACT_EMAIL}.`;
                    contactFormStatus.classList.add('is-error');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                if (submitBtnLabel) {
                    submitBtnLabel.textContent = defaultBtnText;
                }
            }
        });
    }

    // Dynamic Style Injection for Reveal
    const style = document.createElement('style');
    style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    console.log('Portfolio Premium V2 Loaded 🚀');
});
