# Google AdSense Integration Guide

This document explains how to set up and configure Google AdSense for the ResumeInsight application.

## Overview

The ad system is designed to:
- Show non-intrusive ads to **free tier users only** (Pro/Executive users get ad-free experience)
- Use **lazy loading** for better performance
- Place ads in strategic locations that don't disrupt user experience
- Be easy to enable/disable and configure

## Ad Placements

| Location | Ad Type | Size | Pages |
|----------|---------|------|-------|
| Header Banner | Display | 728x90 (responsive) | Homepage, Blog |
| Footer Banner | Display | 728x90 (responsive) | All pages |
| Results Ad | Rectangle | 300x250 (responsive) | After analysis results |
| In-Feed | Native | Fluid | Blog listing (after 2nd article) |
| Sidebar | Rectangle | 300x250/300x600 | Desktop only (future) |

---

## Setup Steps

### Step 1: Create a Google AdSense Account

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up with your Google account
3. Add your website URL: `https://resumeinsight.vercel.app` (or your production domain)
4. Wait for approval (usually 1-14 days)

### Step 2: Get Your Publisher ID

After approval:
1. Go to **AdSense Dashboard** → **Account** → **Account information**
2. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXXX`)

### Step 3: Create Ad Units

In your AdSense account, create the following ad units:

1. **Header Banner Ad**
   - Go to: Ads → By ad unit → Display ads
   - Name: `resume-header-banner`
   - Ad size: Responsive (recommended) or 728x90
   - Copy the **Ad slot ID** (just the numbers, e.g., `1234567890`)

2. **Footer Banner Ad**
   - Name: `resume-footer-banner`
   - Ad size: Responsive or 728x90
   - Copy the Ad slot ID

3. **Results Rectangle Ad**
   - Name: `resume-results-ad`
   - Ad size: Responsive or 300x250
   - Copy the Ad slot ID

4. **In-Feed Ad (for Blog)**
   - Go to: Ads → By ad unit → In-feed ads
   - Name: `resume-in-feed`
   - Follow the wizard to match your blog styling
   - Copy the Ad slot ID

5. **Sidebar Ad (optional)**
   - Name: `resume-sidebar`
   - Ad size: 300x250 or 300x600
   - Copy the Ad slot ID

### Step 4: Configure Environment Variables

Add these to your `.env.local` (development) and production environment:

```bash
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADS_ENABLED=true

# Ad Unit Slot IDs (replace with your actual slot IDs)
NEXT_PUBLIC_AD_SLOT_HEADER=1234567890
NEXT_PUBLIC_AD_SLOT_FOOTER=2345678901
NEXT_PUBLIC_AD_SLOT_SIDEBAR=3456789012
NEXT_PUBLIC_AD_SLOT_IN_ARTICLE=4567890123
NEXT_PUBLIC_AD_SLOT_RESULTS=5678901234
NEXT_PUBLIC_AD_SLOT_IN_FEED=6789012345

# Optional: Enable test mode (shows placeholder ads)
NEXT_PUBLIC_AD_TEST_MODE=false
```

### Step 5: Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` = `ca-pub-XXXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_ADS_ENABLED` = `true`
   - `NEXT_PUBLIC_AD_SLOT_HEADER` = `your-slot-id`
   - (add all slot IDs)
5. Redeploy your application

### Step 6: Verify Site Ownership (if required)

AdSense may require you to verify site ownership:

1. In AdSense, go to **Sites** → **Add site**
2. Enter your domain
3. Choose verification method:
   - **AdSense code** (already added via our integration)
   - **ads.txt** (see below)

### Step 7: Add ads.txt File

Create `public/ads.txt` with your publisher ID:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXXXXXXXX` with your actual publisher ID (without `ca-`).

---

## Configuration Options

### File: `src/lib/adsense-config.js`

```javascript
export const AD_CONFIG = {
  // Master switch for all ads
  enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  
  // Only show ads to free tier users
  showOnlyToFreeUsers: true,
  
  // Lazy loading configuration
  lazyLoad: {
    enabled: true,
    rootMargin: '200px', // Pre-load ads 200px before viewport
    threshold: 0.1,
  },
  
  // Enable/disable specific placements
  placements: {
    header: { enabled: true, pages: ['home', 'blog'] },
    footer: { enabled: true, pages: ['all'] },
    results: { enabled: true, pages: ['resume-analysis', 'analytics'] },
    inFeed: { enabled: true, pages: ['blog'] },
    sidebar: { enabled: true, pages: ['blog'] },
  },
};
```

---

## Testing

### Development Mode

In development, ads show as **placeholder boxes** instead of real ads to:
- Avoid accidental clicks on your own ads (AdSense policy violation)
- Speed up development
- Avoid cluttering the console with ad errors

### Test Mode

Enable test mode to see placeholder ads in production:

```bash
NEXT_PUBLIC_AD_TEST_MODE=true
```

### Verify Ads Are Loading

1. Open browser DevTools → Network tab
2. Filter by "googlesyndication" or "adsbygoogle"
3. You should see requests to Google's ad servers
4. Check Console for any AdSense errors

---

## AdSense Policies - Important!

### ❌ Things That Can Get You Banned

1. **Never click your own ads** - Use test mode in development
2. **Don't ask others to click ads** - Incentivizing clicks is prohibited
3. **Don't place ads in misleading locations** - Ads should be clearly distinguishable
4. **Don't place ads on error pages or login pages**
5. **Don't have more than 3 ads per page initially** - Start conservative
6. **Don't refresh ads too frequently** - Disabled by default in our config

### ✅ Best Practices

1. **Label ads** (optional but recommended): "Advertisement" or "Sponsored"
2. **Use responsive ads** for better mobile experience
3. **Monitor performance** in AdSense dashboard
4. **A/B test placements** to find optimal positions
5. **Respect user experience** - Don't overwhelm with ads

---

## Ad-Free Experience for Paid Users

The system automatically hides ads for Pro and Executive tier users:

```javascript
// In AdProvider.js
const showAds = AD_CONFIG.showOnlyToFreeUsers 
  ? tier === 'free' 
  : true;
```

This is handled automatically - no additional configuration needed.

---

## Revenue Optimization Tips

1. **Experiment with ad sizes**: Larger ads typically earn more
2. **Test different placements**: Above-the-fold ads often perform better
3. **Use responsive ads**: They adapt to available space
4. **Don't overload pages**: Too many ads can hurt user experience and SEO
5. **Monitor your RPM**: Revenue per 1000 impressions in AdSense dashboard

---

## Troubleshooting

### Ads Not Showing

1. Check if `NEXT_PUBLIC_ADS_ENABLED=true` is set
2. Verify your Publisher ID and Slot IDs are correct
3. Check browser Console for errors
4. Ensure AdSense has approved your site
5. Wait 24-48 hours after initial setup for ads to appear

### "adsbygoogle.push() error: No slot size for availableWidth=0"

This happens when the ad container has no width. Check that:
- Parent containers have defined widths
- Ads aren't inside hidden elements

### Low Ad Fill Rate

- Your site may be too new (less traffic)
- Content may not have enough advertiser demand
- Try Auto Ads (see below)

---

## Optional: Enable Auto Ads

Auto Ads let Google automatically place ads on your site:

1. In AdSense, go to **Ads** → **Auto ads**
2. Turn on Auto Ads for your site
3. Google will automatically find optimal placements

**Note**: We recommend manual placements first for better control over user experience.

---

## Files Overview

| File | Purpose |
|------|---------|
| `src/lib/adsense-config.js` | Configuration and ad slot definitions |
| `src/components/ads/AdUnit.js` | Base ad component with lazy loading |
| `src/components/ads/AdProvider.js` | Context for ad visibility (free vs paid users) |
| `src/components/ads/index.js` | Export all ad components |
| `src/app/layout.js` | AdSense script injection |

---

## Checklist

- [ ] Created AdSense account
- [ ] Site approved by AdSense
- [ ] Created all ad units
- [ ] Added Publisher ID to environment variables
- [ ] Added all Ad Slot IDs to environment variables
- [ ] Set `NEXT_PUBLIC_ADS_ENABLED=true`
- [ ] Added `ads.txt` to public folder
- [ ] Deployed to production
- [ ] Verified ads are loading
- [ ] Tested on mobile devices

---

## Expected Revenue

Revenue varies greatly based on:
- **Traffic volume**: More visitors = more impressions
- **Niche**: Finance/legal niches pay more than others
- **Geography**: US/UK traffic earns more
- **Ad placement**: Above-fold placements earn more
- **Click-through rate (CTR)**: Industry average is 1-3%

**Rough estimates** (for US traffic):
- 1,000 page views/month: $1-5
- 10,000 page views/month: $10-50
- 100,000 page views/month: $100-500

Focus on growing traffic and improving content for better ad revenue.

---

## Support

- [Google AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community Forum](https://support.google.com/adsense/community)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)

---

*Last updated: December 2024*
