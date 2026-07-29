'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Home, Bed, Bath, Maximize } from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';

const properties = [
  { id: '1', title: 'Modern 2BR Apartment in City Center', price: 350000, location: 'Jos, Plateau State', bedrooms: 2, bathrooms: 1, sqft: 850, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'], type: 'Apartment' },
  { id: '2', title: 'Spacious 3BR House with Garden', price: 600000, location: 'Rayfield, Jos, Plateau State', bedrooms: 3, bathrooms: 2, sqft: 1200, images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80'], type: 'House' },
  { id: '3', title: 'Cozy Studio Near University', price: 180000, location: 'Bauchi Road, Jos, Plateau State', bedrooms: 1, bathrooms: 1, sqft: 400, images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'], type: 'Studio' },
  { id: '4', title: 'Luxury 4BR Villa with Pool', price: 1200000, location: 'GRA, Jos, Plateau State', bedrooms: 4, bathrooms: 3, sqft: 2500, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'], type: 'Villa' },
  { id: '5', title: 'Affordable 2BR Flat', price: 250000, location: 'Anglo Jos, Plateau State', bedrooms: 2, bathrooms: 1, sqft: 700, images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'], type: 'Apartment' },
  { id: '6', title: 'Furnished 1BR Near Market', price: 300000, location: 'Bukuru, Jos, Plateau State', bedrooms: 1, bathrooms: 1, sqft: 550, images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&q=80'], type: 'Apartment' },
  { id: '7', title: 'Self-Contain in Quiet Area', price: 120000, location: 'Federal Lowcost, Jos, Plateau State', bedrooms: 1, bathrooms: 1, sqft: 300, images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80'], type: 'Self-Contain' },
  { id: '8', title: '3BR Bungalow with Land', price: 500000, location: 'Zaria Road, Jos, Plateau State', bedrooms: 3, bathrooms: 2, sqft: 1500, images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80'], type: 'Bungalow' },
];

export default function HouseRentPage() {
  const [search, setSearch] = useState('');

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
              <Home className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Rental Properties</h1>
            </div>
            <p className="text-muted-foreground mb-4">Find your next home in Nigeria. Apartments, houses, and studios for rent in Jos & beyond.</p>
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
              <Home className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No properties found matching your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <ImageCarousel images={p.images} alt={p.title} className="aspect-[16/10]" interval={5000} />
                    <span className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">{p.type}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3.5 w-3.5" /> {p.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.bedrooms} Beds</span>
                      <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.bathrooms} Bath</span>
                      <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {p.sqft} sqft</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₦{p.price.toLocaleString()}/yr</span>
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