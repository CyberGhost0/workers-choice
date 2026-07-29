'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { filterSuggestions, normalizeSearchQuery } from '@/lib/services';
import { StarRating } from '@/components/ui/StarRating';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import {
  Search,
  MapPin,
  Filter,
  ChevronDown,
  Grid,
  List,
  Loader2,
} from 'lucide-react';

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  images: string[];
  artisan: {
    id: string;
    businessName: string;
    averageRating: number;
    totalReviews: number;
    user: {
      profile: {
        fullName: string;
        avatarUrl?: string;
      };
    };
  };
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  seller: {
    id: string;
    businessName: string;
    averageRating: number;
    totalReviews: number;
    user: {
      profile: {
        fullName: string;
        avatarUrl?: string;
      };
    };
  };
}

const categories = [
  { id: 'all', name: 'All Services', icon: '🔧' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚' },
  { id: 'painting', name: 'Painting', icon: '🎨' },
  { id: 'gardening', name: 'Gardening', icon: '🌿' },
  { id: 'moving', name: 'Moving', icon: '📦' },
  { id: 'products', name: 'Products', icon: '🛍️' },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [activeCategory, searchQuery]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (activeCategory === 'products') {
        const response = await api.get('/products', {
          params: { search: searchQuery },
        });
        setProducts(response.data.products);
        setServices([]);
      } else {
          const params: any = { search: normalizeSearchQuery(searchQuery) };
        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }
        const response = await api.get('/services', { params });
        setServices(response.data.services);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      {/* Hero Search */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find Local Services & Products
            </h1>
            <p className="text-muted-foreground">
              Browse verified artisans and sellers in your area
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-card rounded-xl shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search services or products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSuggestions(filterSuggestions(e.target.value));
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={() => {
                          setSearchQuery(s);
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {activeCategory === 'all'
                    ? 'All Services'
                    : categories.find((c) => c.id === activeCategory)?.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeCategory === 'products'
                    ? `${products.length} products found`
                    : `${services.length} services found`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl shadow-sm border overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-8 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 && products.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              /* Items Grid */
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {/* Services */}
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/marketplace/service/${service.id}`}
                    className={`block bg-card rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div
                      className={`${
                        viewMode === 'list'
                          ? 'w-48 h-32'
                          : 'h-48'
                      } bg-muted relative`}
                    >
                      <ImageCarousel images={service.images} alt={service.title} className="w-full h-full" interval={5000} />
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{service.title}</h3>
                        <span className="text-lg font-bold text-primary whitespace-nowrap">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {service.artisan.user.profile.fullName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {service.artisan.businessName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <StarRating rating={service.artisan.averageRating || 0} size="sm" showValue />
                        <span className="text-xs text-muted-foreground">({service.artisan.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Products */}
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/product/${product.id}`}
                    className={`block bg-card rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div
                      className={`${
                        viewMode === 'list'
                          ? 'w-48 h-32'
                          : 'h-48'
                      } bg-muted relative`}
                    >
                      <ImageCarousel images={product.images} alt={product.title} className="w-full h-full" interval={5000} />
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                        <span className="text-lg font-bold text-primary whitespace-nowrap">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {product.seller.user.profile.fullName[0]}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.seller.businessName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <StarRating rating={product.seller.averageRating || 0} size="sm" showValue />
                        <span className="text-xs text-muted-foreground">({product.seller.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
