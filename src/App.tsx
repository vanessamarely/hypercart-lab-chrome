import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DebugToggleButton } from './components/DebugPanel';
import { StatusBar } from './components/StatusBar';
import { PerformanceDashboardButton } from './components/PerformanceDashboard';
import { HomePage } from './components/pages/HomePage';
import { ProductsPage } from './components/pages/ProductsPage';
import { ProductDetailPage } from './components/pages/ProductDetailPage';
import { SearchPage } from './components/pages/SearchPage';
import { CheckoutPage } from './components/pages/CheckoutPage';
import { Toaster } from 'sonner';

if (import.meta.env.DEV) {
  import('./lib/asset-verification').then(({ verifyAssets }) => {
    verifyAssets();
  });
}

type Page = 'home' | 'products' | 'search' | 'checkout' | 'product-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Initialize performance marks
  useEffect(() => {
    performance.mark('app-start');
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page as Page);
    if (page !== 'product-detail') {
      setSelectedProductId(null);
    }
  };

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;
      case 'products':
        return <ProductsPage onProductClick={handleProductClick} onNavigate={handleNavigation} />;
      case 'product-detail':
        return selectedProductId ? (
          <ProductDetailPage 
            productId={selectedProductId} 
            onNavigate={handleNavigation}
          />
        ) : (
          <ProductsPage onProductClick={handleProductClick} onNavigate={handleNavigation} />
        );
      case 'search':
        return <SearchPage onProductClick={handleProductClick} onNavigate={handleNavigation} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigation} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation currentPage={currentPage} onNavigate={handleNavigation} />
      
      <main>
        {renderCurrentPage()}
      </main>

      <Toaster position="bottom-right" richColors />
      <PerformanceDashboardButton />
      <DebugToggleButton />
      <StatusBar />
    </div>
  );
}

export default App;