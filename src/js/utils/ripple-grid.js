import { Renderer, Program, Triangle, Mesh } from 'ogl';

/**
 * RippleGrid — Vanilla JS implementation of React Bits RippleGrid
 */
export function initRippleGrid(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const {
        enableRainbow = false,
        color1 = '#3A1C71',
        color2 = '#FFA07A',
        rippleIntensity = 0.05,
        gridSize = 10.0,
        gridThickness = 15.0,
        fadeDistance = 1.5,
        vignetteStrength = 2.0,
        glowIntensity = 0.1,
        opacity = 0.8,
        gridRotation = 0,
        mouseInteraction = true,
        mouseInteractionRadius = 1.2
    } = options;

    const mousePosition = { x: 0.5, y: 0.5 };
    const targetMouse = { x: 0.5, y: 0.5 };
    let mouseInfluence = 0;
    let targetInfluence = 0;

    const hexToRgb = hex => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
            : [1, 1, 1];
    };

    const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true
    });
    const gl = renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

    const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 color1;
uniform vec3 color2;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        // Use gradient between color1 and color2 based on screen position
        t = mix(color1, color2, vUv.x);
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}`;

    const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        enableRainbow: { value: enableRainbow },
        color1: { value: hexToRgb(color1) },
        color2: { value: hexToRgb(color2) },
        rippleIntensity: { value: rippleIntensity },
        gridSize: { value: gridSize },
        gridThickness: { value: gridThickness },
        fadeDistance: { value: fadeDistance },
        vignetteStrength: { value: vignetteStrength },
        glowIntensity: { value: glowIntensity },
        opacity: { value: opacity },
        gridRotation: { value: gridRotation },
        mouseInteraction: { value: mouseInteraction },
        mousePosition: { value: [0.5, 0.5] },
        mouseInfluence: { value: 0 },
        mouseInteractionRadius: { value: mouseInteractionRadius }
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
        if (!container) return;
        const { clientWidth: w, clientHeight: h } = container;
        renderer.setSize(w, h);
        uniforms.iResolution.value = [w, h];
    };

    const handleMouseMove = e => {
        if (!mouseInteraction) return;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        targetMouse.x = x;
        targetMouse.y = y;
    };

    const handleMouseEnter = () => {
        if (!mouseInteraction) return;
        targetInfluence = 1.0;
    };

    const handleMouseLeave = () => {
        if (!mouseInteraction) return;
        targetInfluence = 0.0;
    };

    window.addEventListener('resize', resize);
    if (mouseInteraction) {
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);
    }
    resize();

    let request;
    const render = t => {
        uniforms.iTime.value = t * 0.001;

        const lerpFactor = 0.1;
        mousePosition.x += (targetMouse.x - mousePosition.x) * lerpFactor;
        mousePosition.y += (targetMouse.y - mousePosition.y) * lerpFactor;

        mouseInfluence += (targetInfluence - mouseInfluence) * 0.05;
        uniforms.mouseInfluence.value = mouseInfluence;
        uniforms.mousePosition.value = [mousePosition.x, mousePosition.y];

        renderer.render({ scene: mesh });
        request = requestAnimationFrame(render);
    };

    // Live update listener for Theme Lab
    const handleThemeChange = (e) => {
        const { color1: c1, color2: c2 } = e.detail;
        if (uniforms.color1) uniforms.color1.value = hexToRgb(c1);
        if (uniforms.color2) uniforms.color2.value = hexToRgb(c2);
    };
    window.addEventListener('themeChanged', handleThemeChange);

    request = requestAnimationFrame(render);

    return {
        destroy: () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('themeChanged', handleThemeChange);
            if (mouseInteraction) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(request);
            renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
            if (gl.canvas.parentNode) container.removeChild(gl.canvas);
        }
    };
}
