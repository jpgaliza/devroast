# UI COMPONENT DEVELOPMENT STANDARDS

This document outlines the standards and patterns for creating UI components in the `src/components/ui` directory. All new components should follow these guidelines to maintain consistency, type safety, and design system alignment.

## CORE PRINCIPLES

1. **DESIGN SYSTEM ALIGNMENT**: Components must use the CSS variables and design tokens defined in `src/app/globals.css` that correspond to the Pencil design
2. **TYPE SAFETY**: Full TypeScript support with proper extension of native HTML element types
3. **COMPOSABILITY**: Components should be flexible and composable with clear APIs
4. **ACCESSIBILITY**: Follow accessibility best practices (ARIA labels, keyboard navigation, etc.)
5. **PERFORMANCE**: Optimized for re-renders and minimal DOM operations

## FILE STRUCTURE

Each component should follow this structure:
```
src/components/ui/
├── ComponentName/
│   ├── ComponentName.tsx
│   ├── ComponentName.stories.ts (optional, for Storybook)
│   └── index.ts
└── index.ts (barrel export)
```

Or for simpler components:
```
src/components/ui/
├── ComponentName.tsx
└── index.ts
```

## Component Implementation Pattern

### 1. Imports
```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
// Other imports as needed
```

### 2. Variants Definition (using cva)
```typescript
export const componentVariants = cva(
  "base-classes-here",
  {
    variants: {
      variantName: {
        value1: "classes-for-value1",
        value2: "classes-for-value2",
      },
      size: {
        value1: "classes-for-value1",
        value2: "classes-for-value2",
      },
      // Add other variants as needed
    },
    defaultVariants: {
      variantName: "default",
      size: "default",
    },
  }
);
```

### 3. Props Interface
```typescript
export interface ComponentProps 
  extends React.ComponentPropsWithoutRef<'native-element'>, // or withRef if using forwardRef
    VariantProps<typeof componentVariants> {
  // Component-specific props
  /** Description of prop */
  propName?: PropType;
  
  // Common props pattern
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Whether component is in loading state */
  isLoading?: boolean;
}
```

### 4. Component Implementation
```typescript
export const ComponentName = React.forwardRef<
  HTMLElementType, // e.g., HTMLButtonElement, HTMLDivElement
  ComponentProps
>(({ className, ...props }, ref) => {
  // Extract variant props with defaults
  const { 
    variant = "default", 
    size = "default", 
    // other variant props
    // component-specific props
    icon,
    isLoading,
    children,
    ...rest 
  } = props;
  
  return (
    <native-element
      className={twMerge(
        componentVariants({ variant, size, /* other variants */, className })
      )}
      ref={ref}
      {...rest}
    >
      {/* Icon handling */}
      {icon && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      
      {/* Loading state handling */}
      {isLoading ? (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {/* Loading indicator */}
        </span>
      ) : (
        children
      )}
    </native-element>
  );
});

ComponentName.displayName = "ComponentName";
```

### 5. Export
```typescript
export { ComponentName, componentVariants };
```

## Specific Standards

### Styling
- **Always use Tailwind CSS** for styling
- **Use cva (Class Variance Authority)** for variant management
- **Merge classes with twMerge** to prevent conflicts
- **Use Tailwind's default font configuration** (do not use custom font-primary or font-secondary classes)
- **Reference design tokens** from CSS variables (e.g., `bg-primary`, `text-secondary-foreground`)
- **Responsive design**: Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:) when needed
- **Dark mode**: Ensure components work in both light and dark modes using CSS variables

### TypeScript
- **Extend native element types**: Use `React.ComponentPropsWithoutRef<'button'>` or similar
- **Use VariantProps**: For variant props to ensure type safety
- **Forward refs**: When creating components that should accept refs
- **Named exports only**: Never use default exports
- **Display name**: Set `displayName` for better React DevTools experience

### Accessibility
- **Proper HTML semantics**: Use correct elements (button, input, etc.)
- **ARIA attributes**: Add when customizing behavior
- **Focus management**: Ensure proper focus styles
- **Keyboard navigation**: Support for interactive components
- **Color contrast**: Ensure text/background ratios meet WCAG standards

### Component-Specific Guidelines

#### Buttons
- Extend `React.ButtonHTMLAttributes<HTMLButtonElement>`
- Support `type` attribute (submit, button, reset)
- Handle `disabled` state properly
- Include loading state variant
- Support icon leading/trailing

#### Inputs
- Extend `React.InputHTMLAttributes<HTMLInputElement>`
- Support `label` prop (or use with Form components)
- Show validation states
- Support prefix/suffix icons
- Properly handle `readOnly` vs `disabled`

#### Icons
- Accept `size` and `color` props
- Use `aria-hidden="true"` by default
- Support title prop for accessibility
- Be flexible with stroke width and sizing

## Example: Button Component (Reference Implementation)

The Button component in `button.tsx` serves as the reference implementation for all UI components. Key aspects to note:

1. Uses `cva` for variant management
2. Properly extends `React.ButtonHTMLAttributes<HTMLButtonElement>`
3. Uses `twMerge` for class merging
4. Supports icon and loading states
5. Forwards ref correctly
6. Uses named exports
7. Follows the design system's color variables

## Adding New Components

When creating a new component:
1. Create the component file in `src/components/ui/`
2. Implement following the patterns above
3. Add export to `src/components/ui/index.ts`
4. Update documentation if needed
5. Ensure TypeScript compiles without errors
6. Verify component works in both light and dark modes

## Maintenance

- Keep components small and focused
- Prefer composition over configuration
- Update this document when patterns change
- Remove deprecated patterns with clear migration paths
- Regularly audit components against these standards

Last updated: March 14, 2026
