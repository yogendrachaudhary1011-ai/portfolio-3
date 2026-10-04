---
name: "framer-motion"
description: >
  Production-grade animation and micro-interaction guidelines using framer-motion and motion/react.
  Covers spring physics, layout transitions, staggered reveals, gesture interactions, scroll-linked animations,
  and strict compositor-only performance budgets.
---

# Framer Motion & Motion Skill

## 1. Core Principles & Performance Budget
- **Compositor-Only Animations**: Animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Avoid animating layout properties directly (`width`, `height`, `top`, `left`); use `layout` or `layoutId` for FLIP-based layout transitions.
- **Latency Budget**: Micro-interactions (hover, tap, focus) must settle within 150–200ms.
- **Reduced Motion**: Always respect user accessibility settings using `useReducedMotion()` or `MotionConfig reducedMotion="user"`.

## 2. Standard Spring & Easing Presets
- **Snappy UI Spring**: `{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }`
- **Gentle Reveal Spring**: `{ type: "spring", stiffness: 260, damping: 25 }`
- **Editorial Smooth Curve**: `{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }`

## 3. Essential Patterns
- **Shared Layout (`layoutId`)**: Use for active tab indicators, filter pills, and seamless card-to-modal expansions.
- **Exit Animations (`AnimatePresence`)**: Wrap conditional modals, drawers, and toast notifications in `<AnimatePresence mode="wait">`.
- **Staggered Lists**: Use `staggerChildren: 0.06` on parent container variants with `y: 12 -> 0` and `opacity: 0 -> 1` on child items.
- **Interactive Tactility**: Apply subtle `whileHover={{ y: -2 }}` and `whileTap={{ scale: 0.98 }}` on interactive cards and primary triggers.
