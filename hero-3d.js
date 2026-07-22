/**
 * Per-page contained 3D scenes — each variant stays in its own stage,
 * so content is never covered by a full-screen overlay.
 */
import * as THREE from 'three';

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // no-op
} else {
    document.querySelectorAll('[data-3d]').forEach((stage) => {
        const canvas = stage.querySelector('canvas') || document.createElement('canvas');
        if (!canvas.parentElement) {
            canvas.className = 'page-3d-canvas';
            canvas.setAttribute('aria-hidden', 'true');
            stage.appendChild(canvas);
        }
        initStage(stage, canvas, stage.getAttribute('data-3d') || 'home');
    });
}

function getAccent() {
    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-primary')
        .trim() || '#00d4ff';
    return new THREE.Color(raw);
}

function initStage(stageEl, canvasEl, variant) {
    const isMobile = () => window.innerWidth < 768;
    const config = getVariantConfig(variant, isMobile());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.z = config.cameraZ;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: !isMobile(),
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    let accent = getAccent();
    const root = new THREE.Group();
    scene.add(root);

    const disposables = [];

    function track(obj) {
        disposables.push(obj);
        return obj;
    }

    // Main mesh by variant
    const geo = track(config.createGeometry());
    const mat = track(new THREE.MeshBasicMaterial({
        color: accent,
        wireframe: true,
        transparent: true,
        opacity: config.opacity
    }));
    const mesh = new THREE.Mesh(geo, mat);
    root.add(mesh);

    let ring = null;
    let ring2 = null;
    if (config.rings) {
        const ringGeo = track(new THREE.TorusGeometry(config.ringRadius, 0.02, 10, 64));
        const ringMat = track(new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: config.opacity * 0.7
        }));
        ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        root.add(ring);

        ring2 = ring.clone();
        ring2.material = track(ringMat.clone());
        ring2.material.opacity = config.opacity * 0.35;
        ring2.rotation.x = Math.PI / 1.8;
        ring2.rotation.y = 0.6;
        root.add(ring2);
    }

    // Soft fill
    if (config.innerGlow) {
        const glowGeo = track(geo.clone());
        glowGeo.scale(0.78, 0.78, 0.78);
        const glowMat = track(new THREE.MeshBasicMaterial({
            color: accent,
            transparent: true,
            opacity: config.opacity * 0.12,
            wireframe: false
        }));
        root.add(new THREE.Mesh(glowGeo, glowMat));
    }

    // Local particles (kept inside the stage)
    const particleCount = config.particles;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const spread = config.particleSpread;
        positions[i3] = (Math.random() - 0.5) * spread;
        positions[i3 + 1] = (Math.random() - 0.5) * spread;
        positions[i3 + 2] = (Math.random() - 0.5) * spread * 0.7;
        velocities.push({
            x: (Math.random() - 0.5) * 0.006,
            y: (Math.random() - 0.5) * 0.006,
            z: (Math.random() - 0.5) * 0.004
        });
    }
    const particleGeo = track(new THREE.BufferGeometry());
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = track(new THREE.PointsMaterial({
        color: accent,
        size: config.particleSize,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
        depthWrite: false
    }));
    scene.add(new THREE.Points(particleGeo, particleMat));

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
        const rect = stageEl.getBoundingClientRect();
        if (rect.width === 0) return;
        mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const themeMats = [mat, particleMat];
    if (ring) themeMats.push(ring.material, ring2.material);
    const themeObserver = new MutationObserver(() => {
        accent = getAccent();
        themeMats.forEach((m) => m.color.copy(accent));
        root.traverse((child) => {
            if (child.isMesh && child.material && child.material !== mat) {
                child.material.color.copy(accent);
            }
        });
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    function resize() {
        const w = stageEl.clientWidth;
        const h = stageEl.clientHeight;
        if (w < 2 || h < 2) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }

    let visible = true;
    const io = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
    }, { threshold: 0.05 });
    io.observe(stageEl);

    const ro = new ResizeObserver(resize);
    ro.observe(stageEl);
    resize();

    const clock = new THREE.Clock();
    let raf = 0;

    function animate() {
        raf = requestAnimationFrame(animate);
        if (!visible) return;

        const t = clock.getElapsedTime();
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;

        mesh.rotation.x = t * config.spinX + mouse.y * 0.4;
        mesh.rotation.y = t * config.spinY + mouse.x * 0.5;
        if (ring) {
            ring.rotation.z = t * 0.25;
            ring2.rotation.z = -t * 0.18;
        }
        root.rotation.y = mouse.x * 0.2;
        root.rotation.x = mouse.y * 0.15;

        const arr = particleGeo.attributes.position.array;
        const bound = config.particleSpread * 0.5;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const v = velocities[i];
            arr[i3] += v.x;
            arr[i3 + 1] += v.y;
            arr[i3 + 2] += v.z;
            if (Math.abs(arr[i3]) > bound) v.x *= -1;
            if (Math.abs(arr[i3 + 1]) > bound) v.y *= -1;
            if (Math.abs(arr[i3 + 2]) > bound * 0.7) v.z *= -1;
        }
        particleGeo.attributes.position.needsUpdate = true;

        camera.position.x = mouse.x * 0.25;
        camera.position.y = mouse.y * 0.15;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        themeObserver.disconnect();
        window.removeEventListener('pointermove', onMove);
        disposables.forEach((d) => d.dispose && d.dispose());
        renderer.dispose();
    });
}

function getVariantConfig(variant, mobile) {
    const configs = {
        home: {
            cameraZ: 3.6,
            opacity: 0.7,
            rings: true,
            ringRadius: 1.7,
            innerGlow: true,
            particles: mobile ? 40 : 70,
            particleSpread: 5.2,
            particleSize: 0.045,
            spinX: 0.22,
            spinY: 0.36,
            createGeometry: () => new THREE.IcosahedronGeometry(1.25, 1)
        },
        blog: {
            cameraZ: 4,
            opacity: 0.5,
            rings: false,
            innerGlow: true,
            particles: mobile ? 20 : 36,
            particleSpread: 4,
            particleSize: 0.035,
            spinX: 0.15,
            spinY: 0.28,
            createGeometry: () => new THREE.OctahedronGeometry(1.15, 0)
        },
        article: {
            cameraZ: 3.8,
            opacity: 0.45,
            rings: true,
            ringRadius: 1.2,
            innerGlow: false,
            particles: mobile ? 14 : 24,
            particleSpread: 3.2,
            particleSize: 0.03,
            spinX: 0.12,
            spinY: 0.22,
            createGeometry: () => new THREE.TorusGeometry(0.85, 0.28, 12, 40)
        },
        marketing: {
            cameraZ: 4.4,
            opacity: 0.48,
            rings: false,
            innerGlow: true,
            particles: mobile ? 22 : 40,
            particleSpread: 4.2,
            particleSize: 0.035,
            spinX: 0.18,
            spinY: 0.26,
            createGeometry: () => new THREE.TorusKnotGeometry(0.75, 0.22, 80, 12)
        },
        posters: {
            cameraZ: 4.2,
            opacity: 0.46,
            rings: true,
            ringRadius: 1.4,
            innerGlow: true,
            particles: mobile ? 18 : 32,
            particleSpread: 3.8,
            particleSize: 0.032,
            spinX: 0.14,
            spinY: 0.24,
            createGeometry: () => new THREE.DodecahedronGeometry(1.05, 0)
        }
    };

    return configs[variant] || configs.home;
}
