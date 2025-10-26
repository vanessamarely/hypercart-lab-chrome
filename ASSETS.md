# Assets Reference

This document lists all available assets in the HyperCart Lab project and how to use them properly.

## Directory Structure

```
src/assets/
├── audio/          # Audio files (.mp3, .wav, .ogg)
├── documents/      # Documents (.pdf, .docx, etc.)
├── images/         # Image files (.jpg, .png, .webp, .svg)
└── video/          # Video files (.mp4, .webm)
```

## Available Assets

### Hero Images
Located in `src/assets/images/`

- **hero.jpg** - Primary hero image (JPEG format)
- **hero.webp** - Hero image in WebP format (better compression)
- **hero@2x.webp** - High-resolution hero image for retina displays
- **hero-alt.jpg** - Alternative hero image
- **hero-poster.jpg** - Poster/thumbnail for hero video

### Hero Video
Located in `src/assets/video/`

- **hero-background.mp4** - Hero background video

### Product Images
Located in `src/assets/images/`

Available in both JPEG and WebP formats:
- **product-1.jpg / product-1.webp**
- **product-2.jpg / product-2.webp**
- **product-3.jpg / product-3.webp**
- **product-4.jpg / product-4.webp**
- **product-5.jpg / product-5.webp**
- **product-6.jpg / product-6.webp**
- **product-30.webp** (WebP only)

## Usage Guide

### Importing Assets

**Always import assets explicitly** rather than using string paths:

```typescript
// ✅ CORRECT
import heroImage from '@/assets/images/hero.jpg'
import heroVideo from '@/assets/video/hero-background.mp4'
import productImage from '@/assets/images/product-1.webp'

// Use in JSX
<img src={heroImage} alt="Hero" />
<video src={heroVideo} />
```

```typescript
// ❌ WRONG - Don't use string paths
<img src="@/assets/images/hero.jpg" />
<img src="/src/assets/images/hero.jpg" />
```

### Using in Components

#### Images
```typescript
import myImage from '@/assets/images/my-image.jpg'

function MyComponent() {
  return (
    <img 
      src={myImage} 
      alt="Description" 
      loading="lazy"
      width={800}
      height={600}
    />
  )
}
```

#### Videos
```typescript
import myVideo from '@/assets/video/my-video.mp4'
import posterImage from '@/assets/images/video-poster.jpg'

function MyComponent() {
  return (
    <video 
      src={myVideo}
      poster={posterImage}
      autoPlay
      muted
      loop
      playsInline
    >
      Your browser does not support the video tag.
    </video>
  )
}
```

#### Audio
```typescript
import clickSound from '@/assets/audio/click.mp3'

function MyComponent() {
  const playSound = () => {
    const audio = new Audio(clickSound)
    audio.play()
  }
  
  return <button onClick={playSound}>Click Me</button>
}
```

## Current Implementation

### Hero Section
The hero section in `HomePage.tsx` uses:
- Primary: `hero.jpg` (default, for performance)
- Video option: `hero-background.mp4`
- Poster: `hero-poster.jpg`

### Product Catalog
Product images are managed through `src/lib/local-assets.ts`:
- Uses WebP format for better compression and performance
- Cycles through 6 product images for 30 products
- Includes JPEG fallbacks

## Performance Best Practices

### Image Optimization
1. **Use WebP format** when possible (better compression)
2. **Specify dimensions** to prevent layout shift
3. **Use lazy loading** for images below the fold: `loading="lazy"`
4. **Use eager loading** for above-the-fold images: `loading="eager"`
5. **Set fetchpriority** for LCP images: `fetchpriority="high"`

### Video Optimization
1. **Keep videos under 5MB** for web delivery
2. **Always provide a poster image** for better LCP
3. **Use MP4 format** (H.264 codec) for best compatibility
4. **Consider using image instead** if video isn't critical
5. **Preload metadata only**: `preload="metadata"`

### Example: Optimized Hero Image
```typescript
import heroImage from '@/assets/images/hero.jpg'

<img 
  src={heroImage}
  alt="Hero background"
  width={1920}
  height={1080}
  loading="eager"
  fetchpriority="high"
/>
```

### Example: Optimized Product Image
```typescript
import productImage from '@/assets/images/product-1.webp'

<img 
  src={productImage}
  alt="Product name"
  width={300}
  height={300}
  loading="lazy"
  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
/>
```

## Adding New Assets

1. Place the file in the appropriate directory:
   - Images → `src/assets/images/`
   - Videos → `src/assets/video/`
   - Audio → `src/assets/audio/`
   - Documents → `src/assets/documents/`

2. Import it in your component:
   ```typescript
   import myAsset from '@/assets/images/my-new-image.jpg'
   ```

3. Use it in your JSX:
   ```typescript
   <img src={myAsset} alt="Description" />
   ```

## Troubleshooting

### Asset Not Found (404 Error)
- ✅ Make sure you're importing the asset, not using a string path
- ✅ Check the file extension is correct (.jpg not .jpeg, etc.)
- ✅ Verify the file exists in the correct directory
- ✅ Use the correct path with `@/assets/` prefix

### Video Not Playing
- ✅ Check browser console for errors
- ✅ Verify the video format is supported (MP4 H.264 is safest)
- ✅ Ensure video has proper attributes: `autoPlay`, `muted`, `playsInline`
- ✅ Provide a poster image as fallback

### Image Loading Issues
- ✅ Verify import path is correct
- ✅ Check browser network tab to see if file is being requested
- ✅ Add error handling with `onError` callback
- ✅ Provide alt text for accessibility

## Related Files

- **Asset Imports**: `src/lib/local-assets.ts`
- **Hero Component**: `src/components/HeroSection.tsx`
- **Home Page**: `src/components/pages/HomePage.tsx`
- **Products Logic**: `src/lib/products.ts`
