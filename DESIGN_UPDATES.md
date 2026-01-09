# Design Updates - Mirific App

Based on UI mockups from `/Users/joel/Downloads/Mirific/ui/`

## Design Inspiration Analysis

### Dashboard Screen
- **Dark theme** with `#0F0F0F` background
- **Warm beige/tan accent** color (#D4B896) for CTAs and highlights
- **Profile avatar** prominently displayed at top
- **Card-based layout** with rounded corners (16-24px)
- **Progress metrics** showing day streaks and focus time
- **Bottom navigation** with centered FAB (floating action button)
- **Commitment cards** with images and progress indicators

### Accountability Screen
- **AI Coach avatar** with distinctive styling
- **Message bubbles** in dark cards with golden left border
- **Check-in prompts** with emoji support
- **Action buttons** in warm beige tone
- **Calendar icon** for deadline adjustments
- **Encouraging, friendly copy** tone

### Calendar/Settings Screen
- **Toggle switches** for preferences
- **Nudge frequency selector** with visual options (Chill, Balanced, Intense)
- **Coaching vibe options** with icons (Soft Nudge 🌿, Roast Me 🔥)
- **Preview messages** showing coach personality
- **Save button** in warm accent color

### Progress/Timeline Screen
- **Consistency percentage** prominently displayed
- **Streak counter** with fire emoji
- **Tab navigation** (All, Goals, Habits)
- **Timeline cards** with timestamps
- **Status indicators** (Completed ✓, At Risk ⚠️, etc.)
- **Coach message previews** in timeline
- **Add button** floating at bottom right

### Rewards Screen
- **Large MP (Mirific Points) counter**
- **"You're on fire" messaging** with emoji
- **Weekly consistency tracker** with donut charts
- **Next unlocks** section with progress bars
- **Collection badges** for achievements
- **Redeem rewards CTA** in warm accent color

## Theme Implementation

### Colors
```typescript
background: '#0F0F0F'        // Main dark background
surface: '#1A1A1A'           // Card/elevated surfaces
surfaceElevated: '#242424'   // Higher elevation elements
primary: '#D4B896'           // Warm beige accent
accent: '#FFD700'            // Gold highlights
textPrimary: '#FFFFFF'       // Main text
textSecondary: '#A0A0A0'     // Secondary text
```

### Typography Hierarchy
- **H1**: 32px, Bold - Major headings
- **H2**: 24px, Semibold - Section titles
- **H3**: 20px, Semibold - Card titles
- **Body**: 16px, Regular - Main content
- **Caption**: 12px, Regular - Labels/metadata

### Component Patterns

#### Cards
- Background: `#1A1A1A`
- Border radius: 16-24px
- Padding: 16-24px
- Border: 1px `#2A2A2A` (subtle)

#### Buttons (Primary)
- Background: `#D4B896`
- Text: `#0F0F0F` (dark on light)
- Border radius: 16-24px
- Padding: 16px vertical

#### Progress Indicators
- Track: `#2A2A2A`
- Fill: `#D4B896` or gradient
- Height: 6-8px
- Border radius: Full

#### Status Badges
- Success: `#4CAF50`
- Warning: `#FFA726`
- Error: `#EF5350`
- Completed: Gold accent

## Key UI Elements to Implement

### 1. Profile Avatar
- Circular avatar at top
- 40-48px diameter
- AI badge indicator
- Border: 2px accent color

### 2. Stats Display
- Large number (32px+)
- Label below (12px)
- Icon with accent color
- Card background

### 3. Progress Cards
- Image thumbnail (optional)
- Title text
- Progress bar
- Deadline/status indicator
- Tap gesture for details

### 4. AI Coach Messages
- Dark card `#242424`
- Gold left border (3-4px)
- Coach label with sparkles ✨
- Rounded corners
- Emoji support

### 5. Action Buttons
- Rounded pill shape
- Warm beige background
- Dark text
- Icon + text layout
- Press state with opacity

### 6. Bottom Navigation
- Dark background `#1A1A1A`
- 5 icons evenly spaced
- Centered FAB raised above
- Selected state: accent color
- Unselected: `#666666`

### 7. Floating Action Button (FAB)
- Circular, 56px diameter
- Accent color background
- Plus icon in center
- Elevated shadow
- Bottom center position

## Animation & Interaction

- **Smooth transitions**: 200-300ms
- **Tap feedback**: Opacity 0.7 on press
- **Card elevation**: Subtle shadow on active
- **Progress bars**: Animated fill
- **Streak counters**: Number count-up animation

## Spacing System

- **Card gaps**: 16px
- **Section padding**: 24px
- **Inner card padding**: 16-20px
- **Bottom nav height**: 80px (with FAB)
- **Safe area insets**: Respected

## Future Enhancements

1. **Smooth gradient overlays** on cards
2. **Particle effects** for celebrations
3. **Haptic feedback** on interactions
4. **Skeleton loaders** for async content
5. **Swipe gestures** for card actions
6. **Pull to refresh** on timeline
7. **Bottom sheet modals** for detailed views
8. **Lottie animations** for achievements

## Implementation Priority

### Phase 1 (Critical)
- ✅ Dark theme colors
- ✅ Typography system
- ✅ Card components
- ✅ Button styles
- [ ] Dashboard redesign
- [ ] Bottom navigation

### Phase 2 (Important)
- [ ] AI coach messages
- [ ] Progress indicators
- [ ] Status badges
- [ ] Profile avatars
- [ ] Rewards screen

### Phase 3 (Nice-to-have)
- [ ] Animations
- [ ] Gradients
- [ ] Advanced interactions
- [ ] Illustrations
- [ ] Celebrations

## Notes

The current implementation uses a light amber theme (`#fef3c7`) which should be replaced with the dark theme throughout all screens. The warm beige accent (`#D4B896`) provides excellent contrast and maintains the friendly, approachable vibe while looking more sophisticated.
