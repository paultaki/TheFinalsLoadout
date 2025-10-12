# Creator Spotlight Page

## Overview

The Creator Spotlight page allows content creators to submit their channels for featuring on TheFinalsLoadout.com. The page uses a Tally form embed with automatic height adjustment and follows the site's existing design patterns.

## Route

**URL:** `/creator-spotlight` or `/creator-spotlight/`
**File:** `/creator-spotlight/index.html`

## Architecture

This is a standalone HTML page using vanilla JavaScript (no frameworks). It matches the site's existing tech stack:

- **HTML5** - Static markup
- **CSS3** - Inline styles matching home page design system
- **Vanilla JavaScript** - No dependencies
- **Tally.so** - Form provider (embedded iframe)

## Features

### 1. Hero Section
- Title: "Creator Spotlight Submission"
- Subtitle with call-to-action
- Two action buttons:
  - **Primary:** Scroll to form (smooth scroll)
  - **Secondary:** Open form in new tab

### 2. Tally Form Embed
- **Form URL:** `https://tally.so/r/wzPPx0`
- **Auto-resize:** JavaScript listens to postMessage events from Tally to adjust iframe height
- **Loading state:** Shows loading indicator until iframe loads
- **Fallback:** Link to open form in new tab if embed fails

### 3. FAQ Accordion
Three collapsible FAQ items:
- How will I be featured?
- What links do you accept?
- Can I edit later?

### 4. CTA Section
- Button to visit main loadout generator
- Button to join 1-800-FAT-CAMP Discord

### 5. Analytics Tracking
Tracks three events via Google Analytics:
- `creator_spotlight_view` - Page load
- `creator_spotlight_open_new_tab` - User clicks "Open in new tab"
- `creator_spotlight_submit` - Form submission detected via Tally postMessage

## Changing the Tally Form URL

To update the embedded form:

1. Open `/creator-spotlight/index.html`
2. Find the iframe element (around line 205):
   ```html
   <iframe
       id="tallyIframe"
       src="https://tally.so/r/wzPPx0"
       ...
   ```
3. Replace the `src` URL with your new Tally form URL
4. Also update the fallback link (around line 214):
   ```html
   <a href="https://tally.so/r/wzPPx0" target="_blank" ...>
   ```
5. Update the secondary button in hero (around line 136):
   ```html
   <a href="https://tally.so/r/wzPPx0" target="_blank" ...>
   ```

## How Auto-Resize Works

The page listens for `postMessage` events from Tally to dynamically adjust the iframe height:

```javascript
window.addEventListener('message', function(event) {
    // Only accept messages from Tally
    if (event.origin.endsWith('tally.so')) {
        const data = event.data;

        // Handle height adjustment
        if (data && data.height) {
            const iframe = document.getElementById('tallyIframe');
            if (iframe) {
                iframe.style.height = data.height + 'px';
            }
        }

        // Handle form submission
        if (data && data.event === 'Tally.FormSubmitted') {
            // Track submission in analytics
            gtag("event", "creator_spotlight_submit", {...});
        }
    }
});
```

**Security:** Only messages from `*.tally.so` domains are processed using `event.origin.endsWith('tally.so')`.

## Design System

The page matches the home page styling:

### Colors
- **Primary pink:** `#ff3366` (with gradients to `#ff6699`)
- **Accent cyan:** `#00f0c0`
- **Accent green:** `#50c878`
- **Purple gradient:** `#8a2be2` to `#ff3366`
- **Background:** `#0a0a0a`
- **Card background:** `#1a1a1a` to `#111` (gradient)

### Typography
- **Headers:** `'Bebas Neue'` - uppercase, large sizes
- **Body:** `'Inter'` - clean sans-serif
- **Button text:** Uppercase, letter-spacing `0.05em`

### Components
- **Buttons:** Gradient backgrounds, hover lift effect (`translateY(-2px)`)
- **Cards:** Rounded corners (15-20px), box shadows with color glow
- **FAQ Accordion:** Smooth max-height transition, rotating icon
- **Loading State:** CSS-only spinner animation

### Mobile Responsive
- Breakpoint: `768px`
- Mobile menu: Slide-out hamburger navigation
- Stacked buttons on mobile
- Adjusted padding and font sizes

## Navigation

The Creator Spotlight link appears in:
1. **Desktop nav** - Top navigation bar
2. **Mobile menu** - Hamburger menu
3. **Footer** - (optional, not currently added)

The link is **active** on the Creator Spotlight page (highlighted with pink color and bottom border).

## SEO & Meta Tags

### Page Title
```
Creator Spotlight Submission | TheFinalsLoadout.com
```

### Meta Description
```
Submit your channel to be featured on TheFinalsLoadout. Fast form and streamer friendly.
```

### Open Graph
- Uses site-wide social image: `/images/TFL social 1200x630.png`
- Optimized for social sharing

### Canonical URL
```
https://www.thefinalsloadout.com/creator-spotlight
```

## Performance

- **Lazy-loaded analytics:** GA4 loads 1 second after page load
- **Optimized fonts:** Async font loading with fallback
- **Minimal dependencies:** No external frameworks
- **Progressive enhancement:** Fallback links if JavaScript disabled

### Expected Lighthouse Scores
- **Performance:** 90+
- **Accessibility:** 90+
- **Best Practices:** 90+
- **SEO:** 100

## Testing Checklist

- [ ] Desktop: Form loads and resizes correctly
- [ ] Mobile: Navigation menu works, form is scrollable
- [ ] Form submission: Analytics event fires
- [ ] FAQ: All accordions expand/collapse
- [ ] Buttons: All CTAs navigate correctly
- [ ] Accessibility: Keyboard navigation works
- [ ] SEO: Meta tags and Open Graph present
- [ ] Mobile Safari: No viewport issues
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge

## Maintenance

### Adding New FAQs
1. Locate the FAQ section in `index.html` (around line 230)
2. Copy an existing `.faq-item` block
3. Update the question and answer text
4. The JavaScript automatically handles the accordion functionality

### Updating Copy
All text content is in the HTML file. Key sections:
- **Hero:** Lines 125-140
- **FAQ:** Lines 230-260
- **CTA:** Lines 270-280

### Styling Changes
All styles are inline in the `<style>` tag (lines 60-450). To maintain consistency:
- Use existing color variables
- Match button styles with home page
- Test on mobile and desktop
- Keep animations performant

## Troubleshooting

### Form not loading
- Check Tally form URL is correct
- Verify iframe `src` attribute
- Check browser console for errors
- Test fallback link

### Height not adjusting
- Ensure postMessage listener is active
- Check `event.origin` matches Tally domain
- Verify iframe has `id="tallyIframe"`
- Check browser console for postMessage events

### Analytics not tracking
- Verify GA4 is loaded (`window.gtag` exists)
- Check GA4 ID: `G-GVGKYFGZ1Z`
- Test with GA Debugger extension
- Verify events in GA4 real-time reports

### Mobile menu not working
- Check hamburger button is visible on mobile
- Verify JavaScript is not blocked
- Test with browser dev tools mobile emulator
- Check `#menuBtn` and `#simpleMenu` elements exist

## Future Enhancements

Potential improvements for future iterations:
- [ ] Add submission confirmation page
- [ ] Display featured creators on the page
- [ ] Add filtering/search for featured creators
- [ ] Integration with CMS for easier updates
- [ ] Multi-step form with progress indicator
- [ ] Image upload preview
- [ ] Email notifications for new submissions

## Contact

For issues or questions about the Creator Spotlight page, contact the site maintainer via:
- Feedback form: `https://thefinalsloadout.com/feedback`
- Ko-fi support: `https://ko-fi.com/nextroundonme`
