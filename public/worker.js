// Web Worker for heavy computations
// Used to demonstrate moving work off the main thread

self.onmessage = function(e) {
  const { type, payload } = e.data;
  
  performance.mark('worker-start');
  
  switch (type) {
    case 'search':
      const results = performSearch(payload);
      self.postMessage({ type: 'search-results', results });
      break;
      
    case 'format-product':
      const formatted = formatProductData(payload);
      self.postMessage({ type: 'product-formatted', data: formatted });
      break;
      
    case 'heavy-computation':
      const computed = performHeavyComputation(payload);
      self.postMessage({ type: 'computation-result', result: computed });
      break;
      
    default:
      self.postMessage({ type: 'error', message: 'Unknown task type' });
  }
  
  performance.mark('worker-end');
  performance.measure('worker-task', 'worker-start', 'worker-end');
};

function performSearch(query) {
  // Simulate heavy search computation
  const products = generateProducts(1000);
  const searchTerms = query.toLowerCase().split(' ');
  
  return products.filter(product => {
    return searchTerms.every(term => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  }).slice(0, 10);
}

function formatProductData(product) {
  // Simulate complex formatting operations
  const start = performance.now();
  
  // Intentionally slow formatting
  while (performance.now() - start < 50) {
    JSON.stringify(product);
  }
  
  return {
    ...product,
    formattedPrice: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(product.price),
    formattedDescription: product.description.substring(0, 100) + '...',
    computedScore: Math.random() * 100,
    metadata: {
      processed: new Date().toISOString(),
      worker: true
    }
  };
}

function performHeavyComputation(data) {
  // Simulate CPU-intensive work
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sin(i) * Math.cos(i);
  }
  
  return {
    input: data,
    result: result,
    iterations: 1000000,
    timestamp: performance.now()
  };
}

function generateProducts(count) {
  const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'];
  const adjectives = ['Premium', 'Deluxe', 'Essential', 'Pro', 'Classic'];
  const products = [];
  
  for (let i = 0; i < count; i++) {
    products.push({
      id: i + 1,
      name: `${adjectives[i % adjectives.length]} Product ${i + 1}`,
      description: `High-quality ${categories[i % categories.length].toLowerCase()} item with excellent features and reliable performance.`,
      price: Math.floor(Math.random() * 500) + 10,
      category: categories[i % categories.length],
      rating: (Math.random() * 2 + 3).toFixed(1),
      inStock: Math.random() > 0.1
    });
  }
  
  return products;
}