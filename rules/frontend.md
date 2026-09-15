# React UI & Component Polish Standards

## 1. Core React Quality Rules
- Components: Keep components pure, small, idempotent, and focused on a single responsibility.
- Rules of Hooks: Only call Hooks at the top level of functional components or custom hooks. Never inside loops or conditionals.
- State & Rendering: Keep side effects strictly inside useEffect or event handlers, never during the render phase. Treat props and state as immutable.

## 2. Custom UI & Interaction Mandate
- Global Scope: Apply all design languages, transitions, hover states, card layouts, and spring physics uniformly across EVERY view and dashboard.
- Easing & Physics: Use Framer Motion spring physics (stiffness: 450-500, damping: 22-25) or cubic-bezier(0.16, 1, 0.3, 1).
- Property Cards: Use overlapping white floating layout (-mt-14 mx-3 sm:mx-5 z-20 shadow-xl rounded-3xl) with 'CheckCircle2' crest emblem.
- Modals: Use AnimatePresence with 3D spring tilt pop-in (rotateX: 14deg -> 0deg, scale: 0.84 -> 1.0) and backdrop-blur-md.
- Navigation: Use Framer Motion 'layoutId' animated indicator pills for smooth sliding transitions.
- Micro-interactions: Hover scale (1.02x-1.04x), tap press (0.95x-0.97x), and 'shimmer-glow' passovers on primary CTAs.
- Dropdowns: Frictionless zero-click hover-to-open (onMouseEnter/onMouseLeave) for City Selector, Profile Menu, and Role Switchers.
- Build Safety: 'npm run build' must pass with 0 errors.
