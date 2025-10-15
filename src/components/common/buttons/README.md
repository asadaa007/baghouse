# Button Components

A comprehensive set of reusable button components for the BugKiller application.

## Components

### 1. Button
The main button component with multiple variants and sizes.

```tsx
import { Button } from '../components/common/buttons';

<Button 
  variant="primary" 
  size="md" 
  icon={Plus}
  onClick={handleClick}
>
  Create Project
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `disabled`: boolean
- `loading`: boolean
- `icon`: LucideIcon
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean

### 2. IconButton
For icon-only buttons with rounded backgrounds and smooth hover animations.

```tsx
import { IconButton } from '../components/common/buttons';

<IconButton 
  icon={Trash2}
  variant="danger"
  size="sm"
  onClick={handleDelete}
/>
```

**Features:**
- **Rounded background** with subtle color variants
- **Smooth hover animation** - icon slides out left and appears from right
- **Consistent sizing** with proper padding
- **Accessibility** with focus states and tooltips

**Props:**
- `icon`: LucideIcon (required)
- `variant`: 'default' | 'ghost' | 'danger' | 'success' | 'warning'
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `title`: string (for tooltip)

### 3. ActionButton
For action buttons with consistent styling.

```tsx
import { ActionButton } from '../components/common/buttons';

<ActionButton 
  variant="primary"
  icon={Save}
  onClick={handleSave}
>
  Save Changes
</ActionButton>
```

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean

### 4. LinkButton
For navigation buttons that look like buttons but act as links.

```tsx
import { LinkButton } from '../components/common/buttons';

<LinkButton 
  to="/projects"
  variant="primary"
  icon={ArrowLeft}
>
  Back to Projects
</LinkButton>
```

**Props:**
- `to`: string (required)
- `variant`: 'default' | 'primary' | 'secondary' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `external`: boolean

### 5. ButtonGroup
For grouping related buttons together.

```tsx
import { ButtonGroup, Button } from '../components/common/buttons';

<ButtonGroup orientation="horizontal" spacing="md">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</ButtonGroup>
```

**Props:**
- `orientation`: 'horizontal' | 'vertical'
- `spacing`: 'sm' | 'md' | 'lg'

## Usage Examples

### Form Actions
```tsx
<div className="flex gap-3">
  <Button variant="secondary" onClick={onCancel}>
    Cancel
  </Button>
  <Button variant="primary" onClick={onSave} loading={isLoading}>
    Save Changes
  </Button>
</div>
```

### Icon Actions
```tsx
<div className="flex items-center gap-2">
  <IconButton icon={Edit} onClick={handleEdit} />
  <IconButton icon={Trash2} variant="danger" onClick={handleDelete} />
  <IconButton icon={Settings} onClick={handleSettings} />
</div>
```

**Animation Preview:**
- **Default state**: Icon centered in rounded background
- **Hover state**: Icon slides out to the left while new icon slides in from the right
- **Smooth transition**: 300ms duration with ease-in-out timing

### Navigation
```tsx
<LinkButton to="/projects" variant="primary" icon={ArrowLeft}>
  Back to Projects
</LinkButton>
```

### Loading States
```tsx
<Button 
  variant="primary" 
  loading={isSubmitting}
  disabled={!isValid}
>
  {isSubmitting ? 'Creating...' : 'Create Project'}
</Button>
```

## Migration Guide

### From className-based buttons:
```tsx
// Old
<button className="btn-primary">
  <Plus className="w-4 h-4 mr-2" />
  Create
</button>

// New
<Button variant="primary" icon={Plus}>
  Create
</Button>
```

### From icon buttons:
```tsx
// Old
<button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
  <Trash2 className="w-4 h-4" />
</button>

// New
<IconButton icon={Trash2} variant="default" />
```

## Design System

All buttons follow the design system with:
- Consistent spacing and typography
- Hover and focus states
- Loading animations
- Accessibility features
- Responsive sizing

## Animation Features

### IconButton Animations
- **Rounded backgrounds** with subtle color variants
- **Smooth hover transitions** with icon sliding effects
- **Consistent timing** (300ms duration)
- **Accessibility-friendly** with reduced motion support

### Button States
- **Loading states** with spinner animations
- **Hover effects** with color and scale transitions
- **Focus states** with ring indicators
- **Disabled states** with opacity changes

## Accessibility

All button components include:
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
