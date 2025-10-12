interface UnsplashPhoto {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string | null;
  description: string | null;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// Product categories mapped to Unsplash search terms
const CATEGORY_SEARCH_TERMS = {
  Electronics: ['laptop', 'smartphone', 'headphones', 'camera', 'tablet'],
  Clothing: ['fashion', 'clothing', 'shirt', 'dress', 'shoes'],
  Home: ['furniture', 'decoration', 'kitchen', 'bedroom', 'living room'],
  Sports: ['fitness', 'sports', 'workout', 'running', 'gym'],
  Books: ['books', 'reading', 'library', 'study', 'education']
};

// Cache for storing fetched images to avoid repeated API calls
const imageCache = new Map<string, string>();

export async function getUnsplashImageUrl(category: string, seed?: number): Promise<string> {
  const cacheKey = `${category}-${seed || 0}`;
  
  // Return cached image if available
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Check if user has configured an API key (only available in browser environment)
    let apiKey: string | undefined;
    if (typeof window !== 'undefined' && window.spark) {
      apiKey = await window.spark.kv.get<string>('unsplash-api-key');
    }
    
    if (apiKey) {
      // Use official API with user's key
      return await getUnsplashImageUrlWithAPI(category, apiKey, seed);
    }
    
    // Fallback to Unsplash Source API (no key required)
    const searchTerms = CATEGORY_SEARCH_TERMS[category as keyof typeof CATEGORY_SEARCH_TERMS] || ['product'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const width = 400;
    const height = 300;
    const imageUrl = `https://source.unsplash.com/${width}x${height}/?${randomTerm}&sig=${seed || Math.random()}`;
    
    // Cache the URL
    imageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.warn('Failed to fetch Unsplash image:', error);
    // Fallback to a placeholder
    return `https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=${category}`;
  }
}

// Alternative function using the official Unsplash API (requires API key)
export async function getUnsplashImageUrlWithAPI(category: string, accessKey: string, seed?: number): Promise<string> {
  const cacheKey = `api-${category}-${seed || 0}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const searchTerms = CATEGORY_SEARCH_TERMS[category as keyof typeof CATEGORY_SEARCH_TERMS] || ['product'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const response = await fetch(
      `${UNSPLASH_BASE_URL}/search/photos?query=${randomTerm}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash API');
    }

    const data: UnsplashSearchResponse = await response.json();
    
    if (data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    throw new Error('No images found');
  } catch (error) {
    console.warn('Failed to fetch Unsplash image with API:', error);
    return getUnsplashImageUrl(category, seed);
  }
}

// Function to preload images for better performance
export function preloadUnsplashImages(categories: string[], count: number = 5): void {
  categories.forEach(category => {
    for (let i = 0; i < count; i++) {
      getUnsplashImageUrl(category, i).then(url => {
        const img = new Image();
        img.src = url;
      });
    }
  });
}