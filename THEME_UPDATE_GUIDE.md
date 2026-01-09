# Theme Update Guide

## Quick Color Replacement Reference

To update all screens to the dark theme, replace these hardcoded colors with theme values:

### Background Colors
```typescript
'#fef3c7' → theme.colors.background     // Main background (now dark)
'#fff' → theme.colors.surface           // Card/surface backgrounds
'#1A1A1A' → theme.colors.surface        // Dark surface
'#242424' → theme.colors.surfaceElevated // Elevated surfaces
'#fafaf9' → theme.colors.surface        // Light surface → dark

### Text Colors
```typescript
'#1c1917' → theme.colors.textPrimary    // Primary text (now white)
'#fff' → theme.colors.textPrimary       // White text
'#78716c' → theme.colors.textSecondary  // Secondary text (gray)
'#57534e' → theme.colors.textSecondary  // Medium gray
'#44403c' → theme.colors.textSecondary  // Dark gray
'#a8a29e' → theme.colors.textSecondary  // Light gray
'#666666' → theme.colors.textTertiary   // Tertiary text
```

### Accent Colors
```typescript
'#d97706' → theme.colors.primary        // Amber accent → beige
'#78716c' → theme.colors.primary        // Stone → beige
'#f59e0b' → theme.colors.primary        // Orange → beige
'#D4B896' → theme.colors.primary        // Warm beige (keep)
'#FFD700' → theme.colors.accent         // Gold accent
```

### Border Colors
```typescript
'#e7e5e4' → theme.colors.border         // Light border → dark border
'#d6d3d1' → theme.colors.border         // Medium border
'#f5f5f4' → theme.colors.surfaceHighlight // Subtle highlight
'#2A2A2A' → theme.colors.border         // Dark border
```

### Status Colors
```typescript
'#d1fae5' → theme.colors.success        // Success green
'#065f46' → theme.colors.success        // Dark green
'#4CAF50' → theme.colors.success        // Success
'#fef3c7' → theme.colors.warning        // Warning amber
'#92400e' → theme.colors.warning        // Dark amber
'#FFA726' → theme.colors.warning        // Warning
'#ea580c' → theme.colors.error          // Error red
```

## Find & Replace Commands

### For VS Code:
1. Open Find & Replace (Cmd+Shift+H)
2. Enable Regex mode
3. Use these patterns:

**Replace backgrounds:**
```regex
Find: backgroundColor: '#(fef3c7|fff|fafaf9)'
Replace: backgroundColor: theme.colors.surface
```

**Replace text colors:**
```regex
Find: color: '#(1c1917|fff)'
Replace: color: theme.colors.textPrimary
```

**Replace borders:**
```regex
Find: borderColor: '#(e7e5e4|d6d3d1|f5f5f4)'
Replace: borderColor: theme.colors.border
```

## Screen-by-Screen Updates

### 1. Dashboard (app/dashboard.tsx)
- [x] Import theme
- [ ] Update container background
- [ ] Update all card backgrounds to surface
- [ ] Update text colors to textPrimary
- [ ] Update accent colors to primary
- [ ] Update FAB color to primary

### 2. Chat (app/chat.tsx)
- [ ] Import theme
- [ ] Update background
- [ ] Update message bubbles
- [ ] Update input field
- [ ] Update send button

### 3. Commitment (app/commitment.tsx)
- [ ] Import theme
- [ ] Update background
- [ ] Update card styles
- [ ] Update button colors

### 4. Timeline (app/timeline.tsx)
- [ ] Import theme
- [ ] Update background
- [ ] Update list items
- [ ] Update status badges

### 5. CheckIn (app/checkin.tsx)
- [ ] Import theme
- [ ] Update background
- [ ] Update action cards
- [ ] Update buttons

### 6. Rewards (app/rewards.tsx)
- [ ] Import theme
- [ ] Update background
- [ ] Update stat cards
- [ ] Update achievement cards

### 7. Settings (app/settings.tsx)
- [ ] Import theme
- [ ] Update background
- [ ] Update settings cards
- [ ] Update toggle styles

## Automated Script

Run this script to update all files at once:

```bash
cd /Users/joel/Documents/Builds/codeRepo/mirific

# Update all screens
for file in app/dashboard.tsx app/chat.tsx app/commitment.tsx app/timeline.tsx app/checkin.tsx app/rewards.tsx app/settings.tsx; do
  # Add theme import if not present
  grep -q "import { theme }" "$file" || \
    sed -i.bak "s|import { useApp } from '@/contexts/AppContext';|import { useApp } from '@/contexts/AppContext';\nimport { theme } from '@/constants/theme';|" "$file"

  # Replace common colors
  sed -i.bak2 "s|backgroundColor: '#fef3c7'|backgroundColor: theme.colors.background|g" "$file"
  sed -i.bak3 "s|backgroundColor: '#fff'|backgroundColor: theme.colors.surface|g" "$file"
  sed -i.bak4 "s|color: '#1c1917'|color: theme.colors.textPrimary|g" "$file"
  sed -i.bak5 "s|color: '#fff'|color: theme.colors.textPrimary|g" "$file"

  echo "Updated $file"
done

# Clean up backup files
rm app/*.bak* 2>/dev/null

echo "✅ All screens updated with dark theme!"
```

## Manual Update Template

If you prefer to update manually, use this pattern:

```typescript
// 1. Add import at top
import { theme } from '@/constants/theme';

// 2. In StyleSheet.create:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Was '#fef3c7'
  },
  card: {
    backgroundColor: theme.colors.surface, // Was '#fff'
    borderRadius: theme.borderRadius.lg, // Was 16
    padding: theme.spacing.lg, // Was 24
    borderColor: theme.colors.border, // Was '#e7e5e4'
  },
  text: {
    color: theme.colors.textPrimary, // Was '#1c1917'
    fontSize: theme.typography.body.fontSize, // Was 16
  },
  // ... etc
});
```

## Testing Checklist

After updating, verify:
- [ ] Dark background shows on all screens
- [ ] Text is readable (white on dark)
- [ ] Cards have dark surface color
- [ ] Buttons use warm beige accent
- [ ] Borders are visible but subtle
- [ ] Status colors are clear
- [ ] No white flashes between screens

## Common Issues

**Issue:** Text is not visible
**Fix:** Make sure text color is `theme.colors.textPrimary` not surface

**Issue:** Cards blend into background
**Fix:** Use `theme.colors.surface` for cards, `theme.colors.background` for container

**Issue:** Buttons look wrong
**Fix:** Button background should be `theme.colors.primary`, text should be `theme.colors.textInverse`
