/**
 * Site-wide 3D ambient scene — continuous across all pages.
 * Wireframe + particle network with mouse parallax, theme sync, reduced-motion.
 */
import * as THREE from 'three';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const canvas = ensureCanvas();
    initSite3D(canvas);
}

function ensureCanvas() {
    let canvas = document.getElementById('site-3d-canvas') || document.getElementById('hero-3d-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'site-3d-canvas';
        canvas.className = 'site-3d-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(canvas);
    } else {
        canvas.id = 'site-3d-canvas';
        canvas.classList.add('site-3d-canvas');
        canvas.classList.remove('hero-3d-canvas');
    }
    document.body.classList.add('has-site-3d');
    return canvas;
}

function initSite3D(canvasEl) {
    const isMobile = () => window.innerWidth < 768;
    const isHome = Boolean(document.getElementById('home'));
    const particleCount = isMobile() ? 70 : (isHome ? 150 : 120);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: !isMobile(),
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const root = new THREE.Group();
    const rootB = new THREE.Group();
    scene.add(root);
    scene.add(rootB);

    function getAccentHex() {
        const raw = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-primary')
            .trim() || '#00d4ff';
        return new THREE.Color(raw);
    }

    let accent = getAccentHex();

    function makeOrb(scale, opacity) {
        const group = new THREE.Group();
        const coreGeo = new THREE.IcosahedronGeometry(1.35 * scale, 1);
        const coreMat = new THREE.MeshBasicMaterial({
            color: accent,
            wireframe: true,
            transparent: true,
            opacity: opacity
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);

        const glowGeo = new THREE.IcosahedronGeometry(1.05 * scale, 1);
        const glowMat = new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: opacity * 0.15,
            wireframe: false
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        group.add(glow);

        const ringGeo = new THREE.TorusGeometry(2.1 * scale, 0.015, 12, 80);
        const ringMat = new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: opacity * 0.65
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.4;
        group.add(ring);

        const ring2 = ring.clone();
        ring2.rotation.x = Math.PI / 1.7;
        ring2.rotation.y = Math.PI / 5;
        ring2.material = ringMat.clone();
        ring2.material.opacity = opacity * 0.35;
        group.add(ring2);

        return { group, core, glow, ring, ring2, materials: [coreMat, glowMat, ringMat, ring2.material], geometries: [coreGeo, glowGeo, ringGeo] };
    }

    const primary = makeOrb(isHome ? 1 : 0.85, isHome ? 0.5 : 0.32);
    const secondary = makeOrb(0.55, 0.22);
    root.add(primary.group);
    rootB.add(secondary.group);

    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 16;
        positions[i3 + 1] = (Math.random() - 0.5) * 12;
        positions[i3 + 2] = (Math.random() - 0.5) * 8;
        velocities.push({
            x: (Math.random() - 0.5) * 0.004,
            y: (Math.random() - 0.5) * 0.004,
            z: (Math.random() - 0.5) * 0.003
        });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: accent,
        size: isMobile() ? 0.03 : 0.04,
        transparent: true,
        opacity: isHome ? 0.8 : 0.65,
        sizeAttenuation: true,
        depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const maxConnections = isMobile() ? 35 : 80;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: isHome ? 0.16 : 0.12,
        depthWrite: false
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    try {
        const saved = sessionStorage.getItem('site3d-mouse');
        if (saved) {
            const parsed = JSON.parse(saved);
            mouse.x = mouse.targetX = parsed.x || 0;
            mouse.y = mouse.targetY = parsed.y || 0;
        }
    } catch { /* ignore */ }

    const onPointerMove = (event) => {
        mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -((event.clientY / window.innerHeight) * 2 - 1);
        try {
            sessionStorage.setItem('site3d-mouse', JSON.stringify({ x: mouse.targetX, y: mouse.targetY }));
        } catch { /* ignore */ }
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function applyThemeColors() {
        accent = getAccentHex();
        [...primary.materials, ...secondary.materials, particleMat, lineMat].forEach((mat) => {
            mat.color.copy(accent);
        });
    }

    const themeObserver = new MutationObserver(applyThemeColors);
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    function layoutOrbs() {
        if (window.innerWidth >= 992) {
            root.position.set(isHome ? 2.4 : 3.2, isHome ? 0.2 : 1.4, 0);
            root.scale.setScalar(isHome ? 1.05 : 0.9);
            rootB.position.set(isHome ? -3.4 : -3.6, isHome ? -1.6 : -2.1, -1);
            rootB.scale.setScalar(1);
        } else {
            root.position.set(0, isHome ? 1.1 : 2.2, -0.4);
            root.scale.setScalar(0.75);
            rootB.position.set(1.8, -2.4, -1.2);
            rootB.scale.setScalar(0.85);
        }
    }

    function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (width === 0 || height === 0) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        layoutOrbs();
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const clock = new THREE.Clock();
    let rafId = 0;
    let pageVisible = document.visibilityState !== 'hidden';
    document.addEventListener('visibilitychange', () => {
        pageVisible = document.visibilityState !== 'hidden';
    });

    function updateConnections(posAttr) {
        const arr = posAttr.array;
        let lineIndex = 0;
        const linkDist = isMobile() ? 1.55 : 1.85;
        const linkDistSq = linkDist * linkDist;

        for (let i = 0; i < particleCount && lineIndex < maxConnections; i++) {
            const ix = i * 3;
            for (let j = i + 1; j < particleCount && lineIndex < maxConnections; j++) {
                const jx = j * 3;
                const dx = arr[ix] - arr[jx];
                const dy = arr[ix + 1] - arr[jx + 1];
                const dz = arr[ix + 2] - arr[jx + 2];
                if (dx * dx + dy * dy + dz * dz < linkDistSq) {
                    const li = lineIndex * 6;
                    linePositions[li] = arr[ix];
                    linePositions[li + 1] = arr[ix + 1];
                    linePositions[li + 2] = arr[ix + 2];
                    linePositions[li + 3] = arr[jx];
                    linePositions[li + 4] = arr[jx + 1];
                    linePositions[li + 5] = arr[jx + 2];
                    lineIndex++;
                }
            }
        }

        for (let k = lineIndex * 6; k < linePositions.length; k++) linePositions[k] = 0;
        lineGeo.attributes.position.needsUpdate = true;
    }

    function animate() {
        rafId = requestAnimationFrame(animate);
        if (!pageVisible) return;

        const t = clock.getElapsedTime();
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        primary.core.rotation.x = t * 0.18 + mouse.y * 0.3;
        primary.core.rotation.y = t * 0.28 + mouse.x * 0.4;
        primary.glow.rotation.x = -t * 0.12;
        primary.glow.rotation.y = t * 0.16;
        primary.ring.rotation.z = t * 0.22;
        primary.ring2.rotation.z = -t * 0.15;

        secondary.core.rotation.x = -t * 0.14 + mouse.y * 0.2;
        secondary.core.rotation.y = t * 0.2 - mouse.x * 0.25;
        secondary.ring.rotation.z = -t * 0.18;
        secondary.ring2.rotation.z = t * 0.12;

        root.rotation.y = mouse.x * 0.2;
        root.rotation.x = mouse.y * 0.12;
        rootB.rotation.y = -mouse.x * 0.15;
        rootB.rotation.x = mouse.y * 0.1;

        const posAttr = particleGeo.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const v = velocities[i];
            arr[i3] += v.x;
            arr[i3 + 1] += v.y;
            arr[i3 + 2] += v.z;
            if (Math.abs(arr[i3]) > 8) v.x *= -1;
            if (Math.abs(arr[i3 + 1]) > 6) v.y *= -1;
            if (Math.abs(arr[i3 + 2]) > 4) v.z *= -1;
        }
        posAttr.needsUpdate = true;
        updateConnections(posAttr);

        camera.position.x = mouse.x * 0.35;
        camera.position.y = mouse.y * 0.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(rafId);
        themeObserver.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', resize);
        [...primary.geometries, ...secondary.geometries, particleGeo, lineGeo].forEach((g) => g.dispose());
        [...primary.materials, ...secondary.materials, particleMat, lineMat].forEach((m) => m.dispose());
        renderer.dispose();
    });
}
