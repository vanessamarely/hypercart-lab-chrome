const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const CATEGORY_QUERIES: Record<string, string> = {
  Electronics: 'electronics gadgets technology',
  Clothing: 'fashion clothing apparel',
  Home: 'home decor interior',
  Sports: 'sports fitness equipment',
  Books: 'books reading literature'
};

const imageCache = new Map<number, string>();

export async function getUnsplashImageForProduct(
  productId: number,
  category: string,
  productName: string
): Promise<string> {
  if (imageCache.has(productId)) {
    return imageCache.get(productId)!;
  }

  const query = CATEGORY_QUERIES[category] || category;
  
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.urls.regular;
    
    imageCache.set(productId, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop`;
  }
}

export async function preloadUnsplashImages(products: Array<{ id: number; category: string; name: string }>): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>();
  
  const promises = products.map(async (product) => {
    const imageUrl = await getUnsplashImageForProduct(product.id, product.category, product.name);
    imageMap.set(product.id, imageUrl);
  });

  await Promise.all(promises);
  return imageMap;
}
