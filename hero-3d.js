/**
 * Hero 3D scene — interactive wireframe + particle network
 * Matches portfolio accent colors and respects reduced motion.
 */
import * as THREE from 'three';

const canvas = document.getElementById('hero-3d-canvas');
const homeSection = document.getElementById('home');

if (canvas && homeSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initHero3D(canvas, homeSection);
}

function initHero3D(canvasEl, sectionEl) {
    const isMobile = () => window.innerWidth < 768;
    const particleCount = isMobile() ? 80 : 160;

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
    scene.add(root);

    // Accent colors from CSS variables
    function getAccentHex() {
        const raw = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-primary')
            .trim() || '#00d4ff';
        return new THREE.Color(raw);
    }

    let accent = getAccentHex();

    // Core wireframe icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const coreMat = new THREE.MeshBasicMaterial({
        color: accent,
        wireframe: true,
        transparent: true,
        opacity: 0.55
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    root.add(core);

    // Soft inner glow sphere
    const glowGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const glowMat = new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.08,
        wireframe: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    root.add(glow);

    // Outer ring (torus)
    const ringGeo = new THREE.TorusGeometry(2.1, 0.015, 12, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    root.add(ring);

    const ring2 = ring.clone();
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.y = Math.PI / 5;
    ring2.material = ringMat.clone();
    ring2.material.opacity = 0.2;
    root.add(ring2);

    // Particle field
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 14;
        positions[i3 + 1] = (Math.random() - 0.5) * 10;
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
        size: isMobile() ? 0.035 : 0.045,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        depthWrite: false
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Connection lines between nearby particles
    const maxConnections = isMobile() ? 40 : 90;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Mouse parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (event) => {
        const rect = sectionEl.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        mouse.targetX = nx;
        mouse.targetY = ny;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function applyThemeColors() {
        accent = getAccentHex();
        coreMat.color.copy(accent);
        glowMat.color.copy(accent);
        ringMat.color.copy(accent);
        ring2.material.color.copy(accent);
        particleMat.color.copy(accent);
        lineMat.color.copy(accent);
    }

    const themeObserver = new MutationObserver(applyThemeColors);
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    function resize() {
        const width = sectionEl.clientWidth;
        const height = sectionEl.clientHeight;
        if (width === 0 || height === 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);

        // Bias the 3D group toward the photo column on desktop
        if (window.innerWidth >= 992) {
            root.position.set(2.2, 0.15, 0);
            root.scale.setScalar(1.05);
        } else {
            root.position.set(0, 0.9, -0.5);
            root.scale.setScalar(0.85);
        }
    }

    let visible = true;
    const visibilityObserver = new IntersectionObserver(
        (entries) => {
            visible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
    );
    visibilityObserver.observe(sectionEl);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(sectionEl);
    resize();

    const clock = new THREE.Clock();
    let rafId = 0;

    function updateConnections(posAttr) {
        const arr = posAttr.array;
        let lineIndex = 0;
        const linkDist = isMobile() ? 1.6 : 1.9;
        const linkDistSq = linkDist * linkDist;

        for (let i = 0; i < particleCount && lineIndex < maxConnections; i++) {
            const ix = i * 3;
            for (let j = i + 1; j < particleCount && lineIndex < maxConnections; j++) {
                const jx = j * 3;
                const dx = arr[ix] - arr[jx];
                const dy = arr[ix + 1] - arr[jx + 1];
                const dz = arr[ix + 2] - arr[jx + 2];
                const distSq = dx * dx + dy * dy + dz * dz;
                if (distSq < linkDistSq) {
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

        // Zero unused segments
        for (let k = lineIndex * 6; k < linePositions.length; k++) {
            linePositions[k] = 0;
        }
        lineGeo.attributes.position.needsUpdate = true;
    }

    function animate() {
        rafId = requestAnimationFrame(animate);
        if (!visible) return;

        const t = clock.getElapsedTime();

        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        core.rotation.x = t * 0.18 + mouse.y * 0.35;
        core.rotation.y = t * 0.28 + mouse.x * 0.45;
        glow.rotation.x = -t * 0.12;
        glow.rotation.y = t * 0.16;

        ring.rotation.z = t * 0.22;
        ring2.rotation.z = -t * 0.15;

        root.rotation.y = mouse.x * 0.25;
        root.rotation.x = mouse.y * 0.15;

        const posAttr = particleGeo.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const v = velocities[i];
            arr[i3] += v.x;
            arr[i3 + 1] += v.y;
            arr[i3 + 2] += v.z;

            if (Math.abs(arr[i3]) > 7) v.x *= -1;
            if (Math.abs(arr[i3 + 1]) > 5) v.y *= -1;
            if (Math.abs(arr[i3 + 2]) > 4) v.z *= -1;
        }
        posAttr.needsUpdate = true;
        updateConnections(posAttr);

        camera.position.x = mouse.x * 0.4;
        camera.position.y = mouse.y * 0.25;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    animate();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(rafId);
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        themeObserver.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        coreGeo.dispose();
        glowGeo.dispose();
        ringGeo.dispose();
        particleGeo.dispose();
        lineGeo.dispose();
        coreMat.dispose();
        glowMat.dispose();
        ringMat.dispose();
        ring2.material.dispose();
        particleMat.dispose();
        lineMat.dispose();
        renderer.dispose();
    });
}
