# Assets Directory

This directory contains all static assets used in the HyperCart Lab application.

## Structure

```
assets/
├── audio/       # Audio files (.mp3, .wav, .ogg)
├── documents/   # Documents (.pdf, .docx, etc.)
├── images/      # Image files (.jpg, .webp, .png, .svg)
└── video/       # Video files (.mp4, .webm)
```

## Current Assets

### Images
- `hero.jpg` - Primary hero image
- `hero.webp` - Hero image (WebP format)
- `hero@2x.webp` - High-res hero image
- `hero-alt.jpg` - Alternative hero image
- `hero-poster.jpg` - Video poster/thumbnail
- `product-1.jpg` through `product-6.jpg` - Product images (JPEG)
- `product-1.webp` through `product-6.webp` - Product images (WebP)
- `product-30.webp` - Additional product image

### Videos
- `hero-background.mp4` - Hero section background video

## Usage

**Always import assets - never use string paths:**

```typescript
// ✅ Correct
import myImage from '@/assets/images/my-image.jpg'
<img src={myImage} />

// ❌ Wrong
<img src="/src/assets/images/my-image.jpg" />
<img src="@/assets/images/my-image.jpg" />
```

See [ASSETS.md](../../ASSETS.md) in the project root for complete documentation.

## Adding New Assets

1. Place files in the appropriate subdirectory
2. Import them in your component:
   ```typescript
   import myAsset from '@/assets/images/new-image.jpg'
   ```
3. Use in JSX:
   ```typescript
   <img src={myAsset} alt="Description" />
   ```

## Performance Tips

- Use WebP format for better compression
- Specify width/height to prevent layout shift
- Use `loading="lazy"` for below-the-fold images
- Use `fetchpriority="high"` for LCP images
- Keep videos under 5MB
- Always provide video poster images
