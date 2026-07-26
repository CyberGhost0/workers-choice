'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, CheckCircle2, Award, ChevronLeft, ChevronRight } from 'lucide-react';

interface TopWorker {
  id: string;
  name: string;
  businessName: string;
  category: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  image: string;
}

const topWorkers: TopWorker[] = [
  {
    id: '1',
    name: 'John Smith',
    businessName: 'Smith Plumbing Co.',
    category: 'Plumbing',
    rating: 4.9,
    totalReviews: 156,
    completedJobs: 312,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
  },
  {
    id: '3',
    name: 'Mike Williams',
    businessName: 'PowerTech Electric',
    category: 'Electrical',
    rating: 4.9,
    totalReviews: 128,
    completedJobs: 267,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=80',
  },
  {
    id: '4',
    name: 'David Lee',
    businessName: 'Ace Carpentry',
    category: 'Carpentry',
    rating: 4.8,
    totalReviews: 112,
    completedJobs: 234,
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80',
  },
  {
    id: '5',
    name: 'Emily Brown',
    businessName: 'Green Thumb Gardening',
    category: 'Gardening',
    rating: 4.7,
    totalReviews: 89,
    completedJobs: 178,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80',
  },
  {
    id: '6',
    name: 'Grace Okafor',
    businessName: 'BrightPaint Studio',
    category: 'Painting',
    rating: 4.9,
    totalReviews: 141,
    completedJobs: 298,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  },
  {
    id: '7',
    name: 'Tunde Bello',
    businessName: 'Bello Auto Mechanics',
    category: 'Mechanic',
    rating: 4.9,
    totalReviews: 187,
    completedJobs: 402,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80',
  },
  {
    id: '8',
    name: 'Hauwa Sani',
    businessName: 'Hauwa Grains & Provisions',
    category: 'Local Grain Sellers',
    rating: 4.8,
    totalReviews: 94,
    completedJobs: 211,
    image: 'https://images.unsplash.com/photo-1765584830134-12d879ad13bd?w=1200&q=80',
  },
  {
    id: '9',
    name: 'Emeka Nwosu',
    businessName: 'Emeka Kitchen & Restaurant',
    category: 'Restaurants',
    rating: 4.7,
    totalReviews: 263,
    completedJobs: 540,
    image: 'https://images.unsplash.com/photo-1754279492625-2fe09a8842e8?w=1200&q=80',
  },
  {
    id: '10',
    name: 'Yusuf Ahmed',
    businessName: 'Yusuf Rides',
    category: 'Drivers',
    rating: 4.8,
    totalReviews: 176,
    completedJobs: 389,
    image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=1200&q=80',
  },
  {
    id: '11',
    name: 'Ngozi Eze',
    businessName: 'FreshCo Fumigation',
    category: 'Fumigation',
    rating: 4.9,
    totalReviews: 119,
    completedJobs: 256,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80',
  },
  {
    id: '12',
    name: 'Bolaji Adebayo',
    businessName: 'WoodCraft Nigeria',
    category: 'Carpentry',
    rating: 4.8,
    totalReviews: 112,
    completedJobs: 234,
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80',
  },
  {
    id: '13',
    name: 'Chidi Okeke',
    businessName: 'IronWorks Welding',
    category: 'Welder',
    rating: 4.7,
    totalReviews: 88,
    completedJobs: 192,
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&q=80',
  },
  {
    id: '14',
    name: 'Ibrahim Musa',
    businessName: 'Musa Cobbler Shoe Fix',
    category: 'Cobbler',
    rating: 4.8,
    totalReviews: 103,
    completedJobs: 221,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80',
  },
  {
    id: '15',
    name: 'Chioma Adams',
    businessName: 'Chef Chioma Catering',
    category: 'Chef',
    rating: 4.9,
    totalReviews: 157,
    completedJobs: 333,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
  },
  {
    id: '16',
    name: 'Ada Obi',
    businessName: 'Ada POS & Payments',
    category: 'POS Vendors',
    rating: 4.7,
    totalReviews: 76,
    completedJobs: 168,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  },
  {
    id: '17',
    name: 'Kunle Ade',
    businessName: 'Kunle Fresh Fruits',
    category: 'Fruit Street Seller',
    rating: 4.8,
    totalReviews: 134,
    completedJobs: 287,
    image: 'https://images.unsplash.com/photo-1760791632566-f42c29df7818?w=1200&q=80',
  },
  {
    id: '18',
    name: 'Zainab Yusuf',
    businessName: 'Zainab Fruit Corner',
    category: 'Fruit Street Seller',
    rating: 4.7,
    totalReviews: 98,
    completedJobs: 205,
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1200&q=80',
  },
  {
    id: '19',
    name: 'Paul Ekwueme',
    businessName: 'Paul Garden Fruits',
    category: 'Fruit Street Seller',
    rating: 4.8,
    totalReviews: 111,
    completedJobs: 243,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
  },
];

export function TopWorkers() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % topWorkers.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const go = (dir: number) =>
    setCurrent((prev) => (prev + dir + topWorkers.length) % topWorkers.length);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-secondary text-sm font-medium mb-2">
            <Award className="h-4 w-4" />
            This Week
          </div>
          <h2 className="text-2xl font-bold mb-2">Top Rated Workers &amp; Sellers</h2>
          <p className="text-muted-foreground text-sm">
            Our highest rated professionals of the week
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-lg">
            {topWorkers.map((worker, idx) => (
              <div
                key={worker.id}
                className={`transition-opacity duration-700 ease-in-out ${
                  idx === current ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className="grid md:grid-cols-2 bg-card">
                  <div className="relative h-56 md:h-80">
                    <img
                      src={worker.image}
                      alt={worker.businessName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                      {worker.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <h3 className="text-xl font-bold">{worker.businessName}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{worker.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 text-secondary">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold text-foreground">{worker.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({worker.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-5">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {worker.completedJobs} jobs completed
                    </div>
                    <Link
                      href={`/marketplace?category=${worker.category.toLowerCase()}`}
                      className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 hover:bg-primary/90 transition-colors w-full sm:w-auto"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <button
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {topWorkers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === current ? 'bg-secondary w-6' : 'bg-muted-foreground/30 w-2'
                }`}
                aria-label={`Go to worker ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
