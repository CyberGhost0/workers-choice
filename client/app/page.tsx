'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { COUNTRIES, hasStates, getStates } from '@/lib/locations';
import { filterSuggestions, normalizeSearchQuery } from '@/lib/services';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { TopWorkers } from '@/components/widgets/TopWorkers';
import { NewsFeed } from '@/components/widgets/NewsFeed';
import { PartsMarketplace } from '@/components/widgets/PartsMarketplace';
import { ArrowRight, Search, Star, Shield, MessageCircle } from 'lucide-react';

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&q=80',
    alt: 'Technician repairing equipment',
  },
  {
    url: 'https://images.unsplash.com/photo-1722072391426-964abfef1924?w=1600&q=80',
    alt: 'Woman selling bananas on the street',
  },
  {
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80',
    alt: 'Plumber fixing pipes',
  },
  {
    url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=80',
    alt: 'Street food vendor preparing meals',
  },
  {
    url: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=1600&q=80',
    alt: 'Carpenter crafting woodwork',
  },
  {
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    alt: 'Painter painting a wall',
  },
  {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&q=80',
    alt: 'Gardener landscaping',
  },
  {
    url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1600&q=80',
    alt: 'Carpenter measuring wood in workshop',
  },
  {
    url: 'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=1600&q=80',
    alt: 'Carpenter using power drill',
  },
  {
    url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1600&q=80',
    alt: 'Carpenter sanding a wooden plank',
  },
  {
    url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1600&q=80',
    alt: 'Welder at work with sparks',
  },
  {
    url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1600&q=80',
    alt: 'Electrician checking electrical panel',
  },
  {
    url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1600&q=80',
    alt: 'Mechanic repairing a car engine',
  },
  {
    url: 'https://images.unsplash.com/photo-1779231127429-85bcecac6d43?w=1600&q=80',
    alt: 'Man selling goods at a vibrant outdoor market',
  },
  {
    url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80',
    alt: 'Construction worker on site',
  },
  {
    url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=80',
    alt: 'Street food vendor preparing meals',
  },
  {
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1600&q=80',
    alt: 'Bricklayer building a wall',
  },
  {
    url: 'https://images.unsplash.com/photo-1734255287995-7c09dbc99613?w=1600&q=80',
    alt: 'Vegetable seller at a local market',
  },
  {
    url: 'https://images.unsplash.com/photo-1778079247396-9c0e01c83c8b?w=1600&q=80',
    alt: 'Spice seller at an outdoor market',
  },
];

export default function Home() {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [searchState, setSearchState] = useState('');
  const [serviceQuery, setServiceQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % heroImages.length);
        setIsTransitioning(false);
      }, 600); // fade duration
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section with animated background */}
      <section className="relative min-h-[520px] flex items-center overflow-hidden">
        {/* Background images carousel */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out"
            style={{
              backgroundImage: `url('${img.url}')`,
              opacity: idx === currentImage ? 1 : 0,
            }}
          />
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Image indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentImage(idx);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentImage
                  ? 'bg-secondary w-8'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Weather Widget */}
        <div className="absolute bottom-6 right-6 z-10 hidden sm:block">
          <WeatherWidget />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white">
              Find Trusted Local{' '}
              <span className="text-secondary">Artisans</span>{' '}
              & Services
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6">
              Connect with verified plumbers, electricians, cleaners, and more in your
              neighborhood. Quality work, fair prices, guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/marketplace">
                <Button size="lg" className="w-full sm:w-auto">
                  Find Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register?role=artisan">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative -mt-7 z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={serviceQuery}
                  onChange={(e) => {
                    setServiceQuery(e.target.value);
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
                          setServiceQuery(s);
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
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <select
                  value={searchCountry}
                  onChange={(e) => { setSearchCountry(e.target.value); setSearchState(''); }}
                  className="w-full sm:w-1/2 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  <option value="">Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {searchCountry && hasStates(searchCountry) ? (
                  <select
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  >
                    <option value="">State/Province</option>
                    {getStates(searchCountry).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    placeholder="State/Province"
                    className="w-full sm:w-1/2 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                )}
              </div>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  const q = normalizeSearchQuery(serviceQuery);
                  if (q) router.push(`/marketplace?search=${encodeURIComponent(q)}`);
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Workers & Sellers of the Week */}
      <TopWorkers />

      {/* Live Business & Startup News */}
      <NewsFeed />

      {/* Tools & Replacement Parts (hybrid marketplace) */}
      <PartsMarketplace />

      {/* Features Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-5 shadow-sm border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Verified Professionals</h3>
                <p className="text-sm text-muted-foreground">
                  All artisans are background-checked and verified for your safety.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-sm border flex items-start gap-4">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  Read authentic reviews from real customers before hiring.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-sm border flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Direct Communication</h3>
                <p className="text-sm text-muted-foreground">
                  Chat directly with providers to discuss your needs before hiring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Popular Categories</h2>
            <p className="text-muted-foreground text-sm">
              Browse services by category
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Plumbing', icon: '🔧', count: 150 },
              { name: 'Electrical', icon: '⚡', count: 120 },
              { name: 'Cleaning', icon: '🧹', count: 200 },
              { name: 'Carpentry', icon: '🪚', count: 80 },
              { name: 'Painting', icon: '🎨', count: 90 },
              { name: 'Gardening', icon: '🌿', count: 110 },
              { name: 'Moving', icon: '📦', count: 60 },
              { name: 'House Rent', icon: '🏠', count: 45, href: '/house-rent' },
              { name: 'House for Sale', icon: '🏡', count: 35, href: '/house-for-sale' },
              { name: 'More...', icon: '➕', count: 0 },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href || `/marketplace?category=${category.name.toLowerCase()}`}
                className="bg-card rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-1">{category.icon}</div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
                {category.count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {category.count} providers
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto text-sm">
            Join thousands of satisfied customers and skilled professionals on
            Workers-Choice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
