## Design Philosophy

**Focused · Restrained · Comfortable**

Dark is the default dark mode for Vector. It prioritizes readability and comfort over drama.

- Reduced eye strain in low-light environments
- Balanced contrast without harsh highlights
- Familiar dark UI patterns that feel safe and predictable
- Designed for long building sessions
- Calm, controlled, and unobtrusive

## Color Palette

### Primary Colors

| Token | Hex | Tailwind Class | Usage |
| --- | --- | --- | --- |
| Background | `#0B0D12` | `bg-background` | Dark mode base |
| Surface | `#141821` | `bg-surface` | Panels, cards |
| Surface Alt | `#1C2230` | `bg-surface-alt` | Elevated sections |
| Foreground | `#E5E7EB` | `text-foreground` | Primary text |

### Accent Colors

| Token | Hex | Tailwind Class | Usage |
| --- | --- | --- | --- |
| Primary | `#7C83FB` | `bg-primary / text-primary` | Primary actions |
| Primary Hover | `#6A6FF2` | `hover:bg-primary-hover` | Hover states |
| Primary Light | `#1E223A` | `bg-primary-light` | Dark emphasis backgrounds |

### Dark Neutral Scale

| Token | Hex | Tailwind Class | Usage |
| --- | --- | --- | --- |
| Dark 50 | `#0B0D12` | `bg-dark-50` | Base background |
| Dark 100 | `#11141C` | `bg-dark-100` | Primary layout layers |
| Dark 200 | `#1A1F2B` | `border-dark-200` | Borders, dividers |
| Dark 300 | `#242B3A` | `border-dark-300` | Hover borders |
| Dark 400 | `#3A4254` | `text-dark-400` | Decorative icons |
| Dark 500 | `#525C72` | `text-dark-500` | Muted text |
| Dark 600 | `#7A859A` | `text-dark-600` | Secondary text |
| Dark 700 | `#A2A9B9` | `text-dark-700` | Subheadings |
| Dark 800 | `#C8CDD9` | `text-dark-800` | Headings |
| Dark 900 | `#E5E7EB` | `text-dark-900` | Strong headings |

### Status Colors

Status colors remain readable against dark surfaces without glowing excessively.

| Status | Background | Text | Border |
| --- | --- | --- | --- |
| Success | `bg-green-900/20` | `text-green-400` | `border-green-700` |
| Warning | `bg-yellow-900/20` | `text-yellow-400` | `border-yellow-700` |
| Error | `bg-red-900/20` | `text-red-400` | `border-red-700` |
| Info | `bg-blue-900/20` | `text-blue-400` | `border-blue-700` |

## Brand Voice

**Minimal and focused**

Keeps language short and restrained, reducing noise during deep work sessions.

## Typography

### Headline Font — Merriweather

```
font-family: 'Merriweather', Georgia, serif;
```

Used for hero headlines, page titles, section headers, and marketing copy.

| Weight | Usage |
| --- | --- |
| 400 | Section titles, subtitles |
| 700 | Hero headlines, page titles |

### UI Font — Inter

```
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Used for body text, buttons, labels, navigation, and forms.

| Weight | Usage |
| --- | --- |
| 400 | Body text |
| 500 | Buttons, labels |
| 600 | Status indicators, emphasis |

### Type Scale

| Element | Classes | Usage |
| --- | --- | --- |
| Hero Headline | `text-4xl font-headline font-bold text-foreground` | Landing page heroes |
| Page Title | `text-xl font-headline font-bold text-foreground` | Main page headings |
| Section Title | `text-lg font-headline text-foreground` | Section headers |
| Card Title | `font-medium text-foreground` | Card titles |
| Body | `text-sm text-dark-600` | Primary body text |
| Caption | `text-xs text-dark-500` | Helper text |
| Label | `text-sm font-medium text-dark-700` | Form labels |

## Spacing

Use Tailwind's default spacing scale consistently:

| Token | Value | Usage |
| --- | --- | --- |
| `p-3` | 12px | Compact UI |
| `p-4` | 16px | Standard sections |
| `p-6` | 24px | Cards, content |
| `p-8` | 32px | Heroes, modals |
| `gap-2` | 8px | Tight spacing |
| `gap-3` | 12px | Default spacing |
| `gap-4` | 16px | Sections |
| `gap-6` | 24px | Large separation |

## Components

### Buttons

- Primary: `bg-primary text-white rounded-md px-4 py-2 font-medium hover:bg-primary-hover transition-all`
- Secondary: `bg-surface border border-dark-200 text-foreground rounded-md px-4 py-2 font-medium hover:border-dark-300 transition-all`
- Ghost: `text-dark-600 hover:text-foreground hover:bg-dark-100 rounded-md px-3 py-2 transition-all`

### Cards

- Default: `bg-surface rounded-lg border border-dark-200 p-6`
- Hoverable: add `hover:border-dark-300 transition-all cursor-pointer`
- No shadow by default. Use surface elevation for depth.

### Form Inputs

- `bg-dark-100 border border-dark-200 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-dark-400 focus:border-primary focus:ring-1 focus:ring-primary-light outline-none transition-all`

### Badges

- Default: `bg-dark-200 text-dark-700 text-xs font-medium px-2 py-0.5 rounded-full`
- Status: Use status color backgrounds with matching text (e.g., `bg-green-900/20 text-green-400`)

### Tables

- Header: `text-xs font-medium text-dark-500 uppercase tracking-wider`
- Row: `border-b border-dark-200 text-sm text-dark-600`
- Hover: `hover:bg-dark-100`

## Layout Patterns

### Page Layout

- Max width: `max-w-6xl mx-auto`
- Page padding: `px-4 sm:px-6 lg:px-8`
- Section spacing: `space-y-8` or `gap-8`

### Card Grid

- Default: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Dense: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`

### Sidebar Layout

- Sidebar width: `w-64`
- Main content: `flex-1 min-w-0`
- Container: `flex h-screen`

### Empty States

- Center content: `flex flex-col items-center justify-center py-12`
- Icon: `h-12 w-12 text-dark-400 mb-4`
- Title: `text-lg font-headline text-foreground mb-2`
- Description: `text-sm text-dark-500`

## Icons

Use **Lucide React** consistently.

```jsx
import { Moon, Plus, ArrowRight, Check, X } from 'lucide-react'
```

| Size | Class | Usage |
| --- | --- | --- |
| Small | `h-4 w-4` | Inline icons |
| Medium | `h-5 w-5` | Navigation |
| Large | `h-6 w-6` to `h-12 w-12` | Empty states |

Color rules:

- `text-dark-400` — decorative
- `text-dark-500` — secondary
- `text-foreground` — primary

## Shadows

Dark mode relies less on shadows and more on surface contrast.

| Token | Usage |
| --- | --- |
| `shadow-sm` | Elevated cards |
| `shadow-md` | Dropdowns |
| `shadow-lg` | Modals |

Prefer subtle shadows paired with background elevation. Default state uses surface contrast, not shadows.

## Transitions

Standard interaction transition:

```jsx
className="transition-all"
```

Tailwind defaults handle duration (150-200ms). Motion should feel quiet and controlled, not flashy.

## Borders & Radius

| Element | Radius |
| --- | --- |
| Cards | `rounded-lg` (8px) |
| Buttons | `rounded-md` |
| Badges | `rounded-full` |
| Inputs | `rounded-md` |
| Icon Containers | `rounded-lg` |
| Avatars | `rounded-full` |

Border guidance:

- Default: `border-dark-200`
- Hover: `border-dark-300`

## Anti-Patterns (Avoid)

- No bright or glowing accents — reserve accent color for meaningful interactions only
- No colored shadows — use only subtle `rgb(0 0 0 / ...)` shadows or rely on surface contrast
- No large drop shadows on cards — use border and elevation instead
- No all-caps headings — use Merriweather weight for emphasis instead
- No custom animations or bounce effects — stick to `transition-all`
- No light mode overrides — Dark is dark-only
- No opacity tricks for disabled states — use `text-dark-400` and `cursor-not-allowed`
- No harsh white text on dark backgrounds — use `#E5E7EB` (dark-900) for max contrast, not pure `#FFFFFF`
- No more than one accent color per view — `#7C83FB` is the single action color
- No gradients on backgrounds or buttons — keep surfaces flat with elevation layers