---
name: "canvas-design"
description: >
  Interactive HTML5 2D Canvas, WebGL/Shader, and spatial board architecture skill.
  Covers high-DPI retina scaling, requestAnimationFrame lifecycle management, pointer physics,
  pan/zoom infinite canvas math, and performant particle/generative visuals.
---

# Canvas Design Skill

## 1. High-DPI (Retina) Canvas Setup
Always scale the HTML5 `<canvas>` backing store by `window.devicePixelRatio` while keeping CSS dimensions in logical pixels:
```ts
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
```

## 2. Lifecycle & Memory Discipline
- **Ref-Based Instance Management**: Store canvas context, animation frame IDs (`requestAnimationFrame`), and mutable physics state in `useRef` to avoid React re-render overhead on 60fps loops.
- **Deterministic Cleanup**: Always cancel `requestAnimationFrame`, disconnect `ResizeObserver`, and remove window/pointer listeners in the `useEffect` cleanup return.
- **Offscreen Pausing**: Use `IntersectionObserver` to pause canvas render loops when the canvas is scrolled out of the viewport.

## 3. Interactive Physics & Spatial Controls
- **Smooth Pointer Lerping**: Interpolate cursor coordinates (`current += (target - current) * 0.12`) for fluid magnetic, trail, or spotlight effects.
- **Infinite Pan & Zoom Math**: Transform screen coordinates `(clientX, clientY)` to world coordinates via `(screen - panOffset) / zoomScale`, clamping zoom between `0.25x` and `4x`.
- **Theme-Aware Rendering**: Read active theme tokens (`light` vs `dark`) so canvas background, grid dots, and stroke colors stay harmonized with the surrounding DOM.
