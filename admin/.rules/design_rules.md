# UI/UX Design Rules

## Design System

### Color Palette

#### Primary Colors
```css
--primary: #3B82F6;        /* Blue - Main brand color */
--primary-dark: #2563EB;   /* Darker blue for hover states */
--primary-light: #60A5FA;  /* Lighter blue for backgrounds */
```

#### Neutral Colors
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

#### Semantic Colors
```css
--success: #10B981;    /* Green */
--warning: #F59E0B;    /* Amber */
--error: #EF4444;      /* Red */
--info: #3B82F6;       /* Blue */
```

## Theme Management

### **CRITICAL RULE: All Color Combinations Must Work with Selected Theme**

Every component, page, and UI element MUST support both light and dark themes. Colors should be defined using CSS variables or Tailwind's dark mode utilities.

### Theme Implementation

#### CSS Variables Approach
```css
:root {
  /* Light theme (default) */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  
  --border-primary: #E5E7EB;
  --border-secondary: #D1D5DB;
  
  --primary: #3B82F6;
  --primary-hover: #2563EB;
}

[data-theme="dark"] {
  /* Dark theme */
  --bg-primary: #111827;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
  
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --text-tertiary: #9CA3AF;
  
  --border-primary: #374151;
  --border-secondary: #4B5563;
  
  --primary: #60A5FA;
  --primary-hover: #3B82F6;
}
```

#### Tailwind Dark Mode Approach
```tsx
{/* Always use dark: variants for theme support */}
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <h1 className="text-gray-900 dark:text-gray-100">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Theme-Aware Component Patterns

#### Buttons
```tsx
{/* Primary Button - Theme Aware */}
<button className="bg-primary hover:bg-primary-dark text-white dark:bg-primary-light dark:hover:bg-primary">
  Action
</button>

{/* Secondary Button - Theme Aware */}
<button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
  Secondary
</button>
```

#### Cards
```tsx
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-900/50">
  <h3 className="text-gray-900 dark:text-gray-100">Card Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Card content</p>
</div>
```

#### Inputs
```tsx
<input 
  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary placeholder:text-gray-400 dark:placeholder:text-gray-500"
  placeholder="Enter text"
/>
```

#### Tables
```tsx
<table className="w-full">
  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <tr>
      <th className="text-gray-700 dark:text-gray-300">Header</th>
    </tr>
  </thead>
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="text-gray-900 dark:text-gray-100">Data</td>
    </tr>
  </tbody>
</table>
```

### Theme Color Guidelines

#### Text Colors
```tsx
{/* Primary text */}
<p className="text-gray-900 dark:text-gray-100">

{/* Secondary text */}
<p className="text-gray-600 dark:text-gray-400">

{/* Tertiary/muted text */}
<p className="text-gray-500 dark:text-gray-500">

{/* Disabled text */}
<p className="text-gray-400 dark:text-gray-600">
```

#### Background Colors
```tsx
{/* Primary background */}
<div className="bg-white dark:bg-gray-900">

{/* Secondary background */}
<div className="bg-gray-50 dark:bg-gray-800">

{/* Tertiary background */}
<div className="bg-gray-100 dark:bg-gray-700">

{/* Hover states */}
<div className="hover:bg-gray-50 dark:hover:bg-gray-800">
```

#### Border Colors
```tsx
{/* Primary border */}
<div className="border border-gray-200 dark:border-gray-700">

{/* Secondary border */}
<div className="border border-gray-300 dark:border-gray-600">

{/* Dividers */}
<div className="divide-y divide-gray-200 dark:divide-gray-700">
```

### Status Colors (Theme-Safe)

#### Success
```tsx
<span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
  Success
</span>
```

#### Warning
```tsx
<span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
  Warning
</span>
```

#### Error
```tsx
<span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
  Error
</span>
```

#### Info
```tsx
<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
  Info
</span>
```

### Theme Switcher Implementation

```tsx
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // For Tailwind dark mode
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // For Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeSwitcher;
```

### Tailwind Configuration for Dark Mode

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' for system preference only
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          light: '#60A5FA',
        },
      },
    },
  },
};
```

### Testing Theme Compatibility

**Checklist for Every Component**:
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Verify text is readable in both themes
- [ ] Check hover states in both themes
- [ ] Verify focus states in both themes
- [ ] Check disabled states in both themes
- [ ] Ensure borders are visible in both themes
- [ ] Test status colors (success, warning, error) in both themes
- [ ] Verify shadows work in both themes
- [ ] Check that images/icons are visible in both themes

### Common Theme Mistakes to Avoid

❌ **BAD - Hard-coded colors**:
```tsx
<div className="bg-white text-black">
```

✅ **GOOD - Theme-aware colors**:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

❌ **BAD - Missing dark mode variant**:
```tsx
<button className="bg-blue-500 text-white">
```

✅ **GOOD - Complete theme support**:
```tsx
<button className="bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700">
```

❌ **BAD - Insufficient contrast in dark mode**:
```tsx
<p className="text-gray-600">
```

✅ **GOOD - Proper contrast in both modes**:
```tsx
<p className="text-gray-600 dark:text-gray-400">
```

### Theme-Aware Icons and Images

```tsx
{/* Icons that change color with theme */}
<Icon className="text-gray-700 dark:text-gray-300" />

{/* Images with theme-specific versions */}
{theme === 'light' ? (
  <img src="/logo-light.svg" alt="Logo" />
) : (
  <img src="/logo-dark.svg" alt="Logo" />
)}

{/* Or use CSS filter for simple cases */}
<img 
  src="/logo.svg" 
  className="dark:invert dark:brightness-0 dark:contrast-200" 
  alt="Logo" 
/>
```

### Typography

#### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;  /* Fully rounded */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="bg-white text-gray-700 px-6 py-2.5 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors">
  Secondary Action
</button>
```

#### Danger Button
```tsx
<button className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-colors">
  Delete
</button>
```

#### Icon Button
```tsx
<button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
  <Icon size={20} />
</button>
```

### Cards

#### Basic Card
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
  <h3 className="text-lg font-bold text-gray-900 mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>
```

#### Product Card
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
  <div className="aspect-square overflow-hidden">
    <img src="..." className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
  </div>
  <div className="p-4">
    <h3 className="font-semibold text-gray-900 mb-1">Product Name</h3>
    <p className="text-sm text-gray-500 mb-2">Category</p>
    <div className="flex items-center justify-between">
      <span className="text-lg font-bold text-primary">$99.99</span>
      <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold">
        Add to Cart
      </button>
    </div>
  </div>
</div>
```

### Forms

#### Input Field
```tsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
    placeholder="you@example.com"
  />
  <p className="text-sm text-red-500">Error message here</p>
</div>
```

#### Select Dropdown
```tsx
<select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
  <option>Select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Checkbox
```tsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary" />
  <span className="text-sm text-gray-700">Remember me</span>
</label>
```

### Modals

#### Modal Structure
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-100">
      <h2 className="text-xl font-bold text-gray-900">Modal Title</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
        <X size={20} />
      </button>
    </div>
    
    {/* Content */}
    <div className="p-6">
      <p className="text-gray-600">Modal content goes here</p>
    </div>
    
    {/* Footer */}
    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
      <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
        Cancel
      </button>
      <button onClick={onConfirm} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Navigation

#### Navbar
```tsx
<nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="logo.svg" className="h-8" />
        <span className="text-xl font-bold">Brand</span>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-6">
        <a href="/" className="text-gray-700 hover:text-primary font-medium">Home</a>
        <a href="/products" className="text-gray-700 hover:text-primary font-medium">Products</a>
        <a href="/about" className="text-gray-700 hover:text-primary font-medium">About</a>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <ShoppingCart size={20} />
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <button className="bg-primary text-white px-4 py-2 rounded-lg">
          Sign In
        </button>
      </div>
    </div>
  </div>
</nav>
```

### Tables

#### Data Table
```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">John Doe</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <button className="text-primary hover:text-primary-dark">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges & Status

#### Status Badges
```tsx
{/* Success */}
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Active
</span>

{/* Warning */}
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
  Pending
</span>

{/* Error */}
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
  Failed
</span>

{/* Info */}
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
  Processing
</span>
```

### Loading States

#### Spinner
```tsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
</div>
```

#### Skeleton Loader
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

### Empty States

#### No Data
```tsx
<div className="text-center py-12">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Icon size={32} className="text-gray-400" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-1">No items found</h3>
  <p className="text-gray-500 mb-6">Get started by creating your first item.</p>
  <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold">
    Create Item
  </button>
</div>
```

---

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile-First Approach
```tsx
{/* Default: mobile, then override for larger screens */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

### Responsive Typography
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

### Responsive Spacing
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Content with responsive padding */}
</div>
```

### Hide/Show on Breakpoints
```tsx
{/* Hidden on mobile, visible on desktop */}
<div className="hidden md:block">Desktop Only</div>

{/* Visible on mobile, hidden on desktop */}
<div className="block md:hidden">Mobile Only</div>
```

---

## Layout Patterns

### Container
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
  {/* Content */}
</div>
```

### Two-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  {/* Sidebar */}
  <aside className="lg:col-span-3">
    {/* Sidebar content */}
  </aside>
  
  {/* Main Content */}
  <main className="lg:col-span-9">
    {/* Main content */}
  </main>
</div>
```

### Dashboard Layout
```tsx
<div className="flex h-screen bg-gray-100">
  {/* Sidebar */}
  <aside className="w-64 bg-white border-r border-gray-200">
    {/* Sidebar content */}
  </aside>
  
  {/* Main Content */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header */}
    <header className="bg-white border-b border-gray-200 h-16">
      {/* Header content */}
    </header>
    
    {/* Content */}
    <main className="flex-1 overflow-y-auto p-6">
      {/* Page content */}
    </main>
  </div>
</div>
```

---

## Animation & Transitions

### Hover Effects
```tsx
{/* Scale on hover */}
<div className="transform hover:scale-105 transition-transform duration-300">

{/* Shadow on hover */}
<div className="shadow-sm hover:shadow-lg transition-shadow duration-300">

{/* Color change */}
<button className="bg-primary hover:bg-primary-dark transition-colors duration-200">
```

### Fade In
```tsx
<div className="opacity-0 animate-fade-in">
  {/* Content */}
</div>

{/* In tailwind.config.js */}
animation: {
  'fade-in': 'fadeIn 0.3s ease-in-out',
}
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  }
}
```

### Slide In
```tsx
<div className="transform translate-x-full animate-slide-in">
  {/* Content */}
</div>
```

---

## Accessibility

### Semantic HTML
```tsx
{/* Use proper semantic tags */}
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<aside>...</aside>
<footer>...</footer>
```

### ARIA Labels
```tsx
<button aria-label="Close modal" onClick={onClose}>
  <X size={20} />
</button>

<input
  type="text"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
<p id="email-error" className="text-red-500">{error}</p>
```

### Keyboard Navigation
```tsx
{/* Ensure all interactive elements are keyboard accessible */}
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Clickable Div
</div>
```

### Focus States
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Button
</button>
```

### Alt Text
```tsx
<img src="product.jpg" alt="Blue cotton t-shirt with round neck" />
```

---

## User Experience Guidelines

### Loading Feedback
- Show loading spinners for async operations
- Disable buttons during submission
- Show progress bars for multi-step processes
- Use skeleton loaders for content loading

### Error Handling
- Show inline errors below form fields
- Use toast notifications for global errors
- Provide clear error messages
- Offer recovery actions

### Success Feedback
- Show success toasts for completed actions
- Use checkmarks for confirmation
- Redirect after successful submission
- Update UI optimistically when possible

### Confirmation Dialogs
- Ask for confirmation before destructive actions
- Use clear, action-oriented button labels
- Explain consequences of the action
- Provide a cancel option

### Form Validation
- Validate on blur, not on every keystroke
- Show errors only after user interaction
- Clear errors when user corrects input
- Disable submit until form is valid

### Navigation
- Highlight active page in navigation
- Use breadcrumbs for deep hierarchies
- Provide back buttons where appropriate
- Maintain scroll position on navigation

### Search & Filters
- Debounce search input (300-500ms)
- Show search results count
- Allow clearing filters easily
- Persist filters in URL params

### Pagination
- Show current page and total pages
- Provide page size options
- Include first/last page buttons
- Show loading state during page changes

---

## Dark Mode Support

> **See the comprehensive [Theme Management](#theme-management) section above for complete theme implementation guidelines.**

### Quick Reference

All components MUST support both light and dark themes. Use one of these approaches:

**Tailwind Dark Mode** (Recommended):
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

**CSS Variables**:
```css
.component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

### Key Rules
1. **Never use hard-coded colors** - always use theme-aware variants
2. **Test in both themes** - every component must look good in light and dark mode
3. **Maintain contrast** - ensure text is readable in both themes
4. **Theme switcher** - provide easy theme toggle in UI
5. **Persist preference** - save theme choice in localStorage

---

## Performance Best Practices

### Image Optimization
- Use WebP format
- Lazy load images below the fold
- Provide responsive images with srcset
- Use appropriate image sizes

### Code Splitting
- Lazy load routes
- Dynamic imports for heavy components
- Split vendor bundles

### Minimize Reflows
- Avoid layout thrashing
- Batch DOM updates
- Use CSS transforms instead of position changes

---

## Design Checklist

### Before Launch
- [ ] All interactive elements have hover states
- [ ] All interactive elements have focus states
- [ ] Forms have proper validation
- [ ] Loading states are implemented
- [ ] Error states are handled
- [ ] Empty states are designed
- [ ] Mobile responsive on all pages
- [ ] Accessible to keyboard navigation
- [ ] Color contrast meets WCAG AA
- [ ] Images have alt text
- [ ] Buttons have clear labels
- [ ] Links are distinguishable
- [ ] Forms have labels
- [ ] Error messages are helpful
- [ ] Success feedback is provided
