# Changelog

## [Latest] - 2025-09-29

### 🎨 UI/UX Improvements

#### Modal Header Enhancements
- **Repositioned Draft/Live toggle switch** to appear next to lesson title instead of far right
- **Made minimize button transparent** with hover effects for cleaner appearance
- **Improved spacing** between modal header controls (increased from 8px to 24px)
- **Fixed lesson title alignment** to match content padding (px-12)
- **Implemented dynamic title width** using character-based calculation for natural fitting
- **Removed modal border** for cleaner, more modern appearance

#### Toggle Switch Unification
- **Unified toggle logic** between lesson cards and modal header
- **Both locations now use same `handleToggleLessonLive` function**
- **Consistent status labels** matching lesson card format:
  - Live: "Live • X viewing" or "Live • Ready for students"
  - Draft: "Draft • Last edited [date]"

#### Layout & Spacing Improvements
- **Increased lesson content padding** from px-6 to px-12 for better alignment
- **Enhanced vertical spacing** with py-12 for more spacious feel
- **Added more space under tabs** (mb-6 to mb-10)
- **Increased spacing between lesson sections** (space-y-8 to space-y-12)
- **Improved AI assistant panel width** (reduced by 100px for better balance)

#### Scrollbar Enhancements
- **Fixed scrollbar behavior** to appear on hover without layout shifts
- **Implemented stable scrollbar gutter** to prevent content jumping
- **Added subtle scrollbar styling** with hover effects

### 🔧 Technical Improvements

#### Component Architecture
- **Enhanced prop flow** for toggle functionality across components
- **Added proper TypeScript interfaces** for new props
- **Improved component reusability** with consistent prop patterns

#### Bug Fixes
- **Fixed React Select warning** by replacing `selected` attribute with `defaultValue`
- **Resolved ReferenceError** for `handleToggleLessonLive` in modal context
- **Fixed duplicate import** causing runtime errors
- **Corrected undo button placement** to appear after second AI turn

#### Border & Visual Cleanup
- **Removed borders** from action rows in homepage and lesson builder prompts
- **Muted select component borders** for subtler appearance
- **Eliminated duplicate content** in lesson headers

### 🚀 AI Suggestion Flow
- **Improved AI suggestion workflow**: Suggestions only move to "My Lessons" when modified
- **Automatic new suggestion generation** when AI lesson is adopted and modified
- **Prevented duplicate lessons** from unmodified AI suggestions

### 📱 Responsive Design
- **Enhanced flexbox layouts** for better responsive behavior
- **Improved text overflow handling** with proper min-width constraints
- **Better space utilization** across different screen sizes

---

## Summary of Changes

This update focuses heavily on UI/UX improvements, particularly around the lesson modal interface. Key highlights include:

1. **Unified toggle switch behavior** across the application
2. **Cleaner modal design** with better spacing and alignment
3. **Improved AI suggestion workflow** to prevent duplicates
4. **Enhanced responsive design** and layout consistency
5. **Multiple bug fixes** for better stability

All changes maintain backward compatibility and improve the overall user experience.
