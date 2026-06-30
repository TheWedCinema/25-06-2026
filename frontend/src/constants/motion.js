// Shared framer-motion animation presets (hoisted to module scope to avoid
// allocating new objects on every render).
export const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export const STAGGER = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export const HERO_FADE_IN = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
};

export const PAGE_FADE_IN = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 },
};

export const OVERLAY_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const PROFILE_TILE = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6 },
});

export const VIEWPORT_ONCE_HALF = { once: true, amount: 0.3 };
export const VIEWPORT_ONCE_TINY = { once: true, amount: 0.1 };
