# Theme Color Guide for Light and Dark Modes

This guide provides detailed instructions and best practices for implementing theme-aware (light/dark) color schemes in this project. Follow these guidelines to ensure a consistent and accessible user experience across all components, pages, and modals.

---

## 1. **General Principles**

- **Always use theme-aware classes**: Use Tailwind's `dark:` modifier to specify dark mode styles. Never hardcode colors for only one theme.
- **Default to light mode**: Classes without the `dark:` prefix apply to light mode.
- **Dark mode overrides**: Use `dark:` classes to override light mode styles for dark mode.
- **Accessibility**: Ensure sufficient contrast for text, backgrounds, and interactive elements in both themes.
- **Consistency**: Use the same color logic for all UI elements, including modals, forms, buttons, skeletons, and cards.

---

## 2. **Color Class Mapping**

Below are the recommended Tailwind color classes for common UI elements. Adjust as needed for your brand, but keep the structure consistent.

### **Backgrounds**
| Element         | Light Mode                | Dark Mode                |
|-----------------|--------------------------|--------------------------|
| Main BG         | `bg-white`               | `dark:bg-zinc-900`       |
| Modal BG        | `bg-white/90`            | `dark:bg-white/10`       |
| Card BG         | `bg-white`               | `dark:bg-zinc-800`       |
| Input BG        | `bg-white`               | `dark:bg-zinc-900`       |
| Disabled BG     | `bg-gray-100`            | `dark:bg-zinc-800/50`    |

### **Borders**
| Element         | Light Mode                | Dark Mode                |
|-----------------|--------------------------|--------------------------|
| Default Border  | `border-gray-200/50`     | `dark:border-white/20`   |
| Input Border    | `border-gray-300`        | `dark:border-zinc-700`   |
| Focus Border    | `border-blue-500`        | `dark:border-blue-400`   |

### **Text**
| Element         | Light Mode                | Dark Mode                |
|-----------------|--------------------------|--------------------------|
| Main Text       | `text-gray-900`          | `dark:text-white`        |
| Secondary Text  | `text-gray-600`          | `dark:text-gray-300`     |
| Placeholder     | `text-gray-400`          | `dark:text-gray-500`     |
| Muted/Disabled  | `text-gray-400`          | `dark:text-gray-500`     |

### **Buttons**
| State           | Light Mode                | Dark Mode                |
|-----------------|--------------------------|--------------------------|
| Primary         | `bg-blue-600 text-white`  | `dark:bg-blue-500`       |
| Hover           | `hover:bg-blue-700`       | `dark:hover:bg-blue-600` |
| Secondary       | `bg-gray-100 text-gray-900` | `dark:bg-zinc-800 dark:text-white` |
| Danger          | `bg-red-600 text-white`   | `dark:bg-red-500`        |
| Disabled        | `bg-gray-200 text-gray-400` | `dark:bg-zinc-700 dark:text-gray-500` |

### **Inputs & Forms**
| Element         | Light Mode                | Dark Mode                |
|-----------------|--------------------------|--------------------------|
| Input BG        | `bg-white`               | `dark:bg-zinc-900`       |
| Input Border    | `border-gray-300`        | `dark:border-zinc-700`   |
| Input Text      | `text-gray-900`          | `dark:text-white`        |
| Placeholder     | `text-gray-400`          | `dark:text-gray-500`     |
| Label           | `text-gray-700`          | `dark:text-gray-300`     |

### **Miscellaneous**
| Element         | Light Mode                | Dark Mode                |
|-----------------|--------------------------|--------------------------|
| Skeleton Loader | `bg-gray-200`            | `dark:bg-zinc-700`       |
| Divider         | `border-gray-200`        | `dark:border-zinc-700`   |
| Tooltip         | `bg-gray-900 text-white` | `dark:bg-gray-100 dark:text-gray-900` |

---

## 3. **Usage Guidelines**

- **Always pair light and dark classes**: For every color class, provide a `dark:` override unless the color is neutral in both themes.
- **Do not use hardcoded colors**: Avoid using only `text-white`, `bg-black`, etc., unless it is truly universal.
- **Interactive states**: Ensure hover, focus, and active states are theme-aware (e.g., `hover:bg-gray-100 dark:hover:bg-zinc-800`).
- **Borders and outlines**: Use theme-aware border classes for all interactive and container elements.
- **Modals and overlays**: Modals must use the same theme logic as the main page. Use `bg-white/90 dark:bg-white/10` for modal backgrounds.
- **Inputs and forms**: Inputs, selects, and textareas must have theme-aware backgrounds, borders, and text colors.
- **Skeletons and loaders**: Use theme-aware backgrounds for loading states.
- **Cards and panels**: Use `bg-white dark:bg-zinc-800` for card backgrounds.

---

## 4. **Example: Theme-Aware Modal**

```jsx
<div className="bg-white/90 dark:bg-white/10 border border-gray-200/50 dark:border-white/20 text-gray-900 dark:text-white">
  <h2 className="text-lg font-bold">Modal Title</h2>
  <input className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
  <button className="bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">Save</button>
</div>
```

---

## 5. **Best Practices**

- **Test in both themes**: Always check your UI in both light and dark modes before merging changes.
- **Use Tailwind config for custom colors**: If you need custom brand colors, define them in `tailwind.config.js` and use theme-aware variants.
- **Keep it DRY**: Use utility classes and shared components to avoid repeating theme logic.
- **Document exceptions**: If a component intentionally deviates from this guide, document the reason in code comments.

---

## 6. **References**
- [Tailwind CSS Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [Accessible Color Combinations](https://webaim.org/resources/contrastchecker/)

---

> **Follow this guide for all future UI work to ensure a consistent, accessible, and professional appearance in both light and dark themes.** 