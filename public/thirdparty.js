// Mock third-party script that intentionally blocks parsing and execution
// Used for demonstrating third-party script impact on performance

console.log('Heavy third-party script loading...');

// Simulate heavy computation during parse time
const heavyData = [];
for (let i = 0; i < 100000; i++) {
  heavyData.push({
    id: i,
    data: `heavy-data-${i}`,
    nested: {
      value: Math.random(),
      computed: i * Math.PI
    }
  });
}

// Simulate synchronous DOM manipulation
document.addEventListener('DOMContentLoaded', () => {
  performance.mark('thirdparty-start');
  
  // Block main thread with heavy JSON operations
  const start = performance.now();
  while (performance.now() - start < 200) {
    JSON.stringify(heavyData);
    JSON.parse(JSON.stringify(heavyData.slice(0, 1000)));
  }
  
  // Synchronously modify DOM
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff6b6b;
    color: white;
    padding: 10px;
    text-align: center;
    z-index: 9999;
    font-weight: bold;
  `;
  banner.textContent = '🚨 Heavy Third-Party Script Loaded (This impacts performance!)';
  document.body.appendChild(banner);
  
  performance.mark('thirdparty-end');
  performance.measure('thirdparty-blocking', 'thirdparty-start', 'thirdparty-end');
  
  console.log('Third-party script finished blocking main thread');
});

// Export heavy data to global scope for inspection
window.__thirdPartyData = heavyData;