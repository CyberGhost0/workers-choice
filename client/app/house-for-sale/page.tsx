'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building2, Bed, Bath, Maximize } from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';

const properties = [
  { id: '1', title: '3BR Family Home in Quiet Neighborhood', price: 8500000, location: 'Rayfield, Jos, Plateau State', bedrooms: 3, bathrooms: 2, sqft: 1400, images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'], type: 'House' },
  { id: '2', title: 'Modern 2BR Condo with City View', price: 6500000, location: 'GRA, Jos, Plateau State', bedrooms: 2, bathrooms: 2, sqft: 950, images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'], type: 'Condo' },
  { id: '3', title: 'Land for Development - 2 Plots', price: 3500000, location: 'Hwolshe, Jos, Plateau State', bedrooms: 0, bathrooms: 0, sqft: 87120, images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'], type: 'Land' },
  { id: '4', title: 'Luxury 5BR Mansion with Pool', price: 35000000, location: 'Jishe, Jos, Plateau State', bedrooms: 5, bathrooms: 4, sqft: 4000, images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'], type: 'Mansion' },
  { id: '5', title: 'Commercial Building - Prime Location', price: 28000000, location: 'Zaria Road, Jos, Plateau State', bedrooms: 0, bathrooms: 3, sqft: 3000, images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'], type: 'Commercial' },
  { id: '6', title: '3BR Bungalow with Fenced Land', price: 7500000, location: 'Bukuru, Jos, Plateau State', bedrooms: 3, bathrooms: 2, sqft: 1600, images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80'], type: 'Bungalow' },
  { id: '7', title: 'Duplex in Estates', price: 12000000, location: 'Anglo Jos, Plateau State', bedrooms: 4, bathrooms: 3, sqft: 2200, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'], type: 'Duplex' },
  { id: '8', title: 'Agricultural Land - 5 Acres', price: 5000000, location: 'Mangu, Plateau State', bedrooms: 0, bathrooms: 0, sqft: 217800, images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'], type: 'Land' },
  { id: '9', title: 'Shop in Central Market', price: 8000000, location: 'Terminus, Jos, Plateau State', bedrooms: 0, bathrooms: 1, sqft: 400, images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'], type: 'Commercial' },
];

export default function HouseForSalePage() {
  const [search, setSearch] = useState('');

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Properties for Sale</h1>
            </div>
            <p className="text-muted-foreground mb-4">Browse houses, lands, and commercial properties for sale across Jos, Plateau State & Nigeria.</p>
            <div className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No properties found matching your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <ImageCarousel images={p.images} alt={p.title} className="aspect-[16/10]" interval={5000} />
                    <span className="absolute top-2 left-2 z-20 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded">{p.type}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </p>
                    {p.bedrooms > 0 && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.bedrooms} Beds</span>
                        <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.bathrooms} Bath</span>
                        <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {p.sqft.toLocaleString()} sqft</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{formatPrice(p.price)}</span>
                      <Button size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}