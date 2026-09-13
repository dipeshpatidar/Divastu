# UI Consistency, Smooth Interactions & Global Component Polish Mandate

## Core Rule: Global Scope Application
Whenever making any UI design, layout, transition, or micro-interaction enhancement:
1. **Never limit changes to a single page or component**.
2. **Apply the exact same design language, transitions, hover states, card layouts, and spring physics uniformly across EVERY view, page, modal, header, dashboard, and console in the application**.

## Technical Standards for UI Components
- **Transitions & Easing**: Always use Framer Motion custom spring physics (`type: 'spring', stiffness: 450-500, damping: 22-25`) or cubic-bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Property Cards**: All property cards across landing pages, showcases, search hubs, and tenant/admin dashboards MUST use the signature overlapping white floating card layout (`-mt-14 mx-3 sm:mx-5 z-20 shadow-xl rounded-3xl`) with the signature levitating crest emblem (`CheckCircle2`).
- **Modals & Dialogs**: All modals must use `AnimatePresence` with 3D spring tilt pop-in (`rotateX: 14deg -> 0deg`, `scale: 0.84 -> 1.0`) and `backdrop-blur-md` dimming.
- **Tabs & Navigation**: All tab switchers must feature `layoutId` animated indicator pills sliding smoothly between active choices.
- **Buttons & Micro-interactions**: Hover scale (`1.02x-1.04x`), tap press (`0.95x-0.97x`), and shimmer light beam passovers (`shimmer-glow`) on primary call-to-action buttons.
- **Dropdowns & Popovers**: All dropdown menus (City Selector, Profile Menu, Role Switcher popovers) MUST open automatically on **HOVER** (`onMouseEnter` / `onMouseLeave`) for a zero-click, frictionless user experience.
