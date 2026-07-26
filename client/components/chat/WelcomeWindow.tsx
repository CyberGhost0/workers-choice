'use client';

import { useEffect, useState } from 'react';
import { X, Megaphone, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Advert {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  businessName: string;
  category: string;
  discount?: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'news' | 'promo' | 'update';
}

interface TopArtisan {
  id: string;
  name: string;
  businessName: string;
  category: string;
  rating: number;
  totalReviews: number;
  avatarUrl?: string;
  completedJobs: number;
}

const mockAdverts: Advert[] = [
  {
    id: '1',
    title: '50% Off First Cleaning Service!',
    description: 'Book your first cleaning service and get 50% off. Limited time offer!',
    businessName: 'SparkleClean Pro',
    category: 'Cleaning',
    discount: '50% OFF',
  },
  {
    id: '2',
    title: 'Emergency Plumbing 24/7',
    description: 'Fast response plumbing services. Call now for immediate assistance!',
    businessName: 'QuickFix Plumbing',
    category: 'Plumbing',
  },
  {
    id: '3',
    title: 'Free Electrical Inspection',
    description: 'Get a free electrical safety inspection with any service booking.',
    businessName: 'PowerTech Electric',
    category: 'Electrical',
    discount: 'FREE',
  },
  {
    id: '4',
    title: 'Home Renovation Special',
    description: 'Complete home renovation packages starting from $500.',
    businessName: 'DreamHome Renovations',
    category: 'Carpentry',
  },
];

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Welcome to Workers-Choice!',
    content: 'Your trusted marketplace for local artisans and services.',
    date: '2024-01-15',
    type: 'news',
  },
  {
    id: '2',
    title: 'New Feature: Before/After Photos',
    content: 'Providers can now upload before and after photos of completed jobs.',
    date: '2024-01-14',
    type: 'update',
  },
  {
    id: '3',
    title: 'Weekend Flash Sale',
    content: '20% off all services this weekend! Use code WEEKEND20.',
    date: '2024-01-13',
    type: 'promo',
  },
];

const mockTopArtisans: TopArtisan[] = [
  {
    id: '1',
    name: 'John Smith',
    businessName: 'Smith Plumbing Co.',
    category: 'Plumbing',
    rating: 4.9,
    totalReviews: 156,
    completedJobs: 312,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    businessName: 'SparkleClean Pro',
    category: 'Cleaning',
    rating: 4.8,
    totalReviews: 203,
    completedJobs: 445,
  },
  {
    id: '3',
    name: 'Mike Williams',
    businessName: 'PowerTech Electric',
    category: 'Electrical',
    rating: 4.9,
    totalReviews: 128,
    completedJobs: 267,
  },
  {
    id: '4',
    name: 'Emily Brown',
    businessName: 'Green Thumb Gardening',
    category: 'Gardening',
    rating: 4.7,
    totalReviews: 89,
    completedJobs: 178,
  },
  {
    id: '5',
    name: 'David Lee',
    businessName: 'Ace Carpentry',
    category: 'Carpentry',
    rating: 4.8,
    totalReviews: 112,
    completedJobs: 234,
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    businessName: 'Fresh Start Moving',
    category: 'Moving',
    rating: 4.6,
    totalReviews: 76,
    completedJobs: 156,
  },
];

interface WelcomeWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeWindow({ isOpen, onClose }: WelcomeWindowProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'advert' | 'top'>('news');
  const [currentAdvertIndex, setCurrentAdvertIndex] = useState(0);
  const [currentArtisanIndex, setCurrentArtisanIndex] = useState(0);

  // Auto-rotate top artisans
  useEffect(() => {
    if (activeTab === 'top') {
      const interval = setInterval(() => {
        setCurrentArtisanIndex((prev) =>
          prev >= mockTopArtisans.length - 1 ? 0 : prev + 1
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Auto-rotate adverts
  useEffect(() => {
    if (activeTab === 'advert') {
      const interval = setInterval(() => {
        setCurrentAdvertIndex((prev) =>
          prev >= mockAdverts.length - 1 ? 0 : prev + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome to Workers-Choice</h2>
                <p className="text-white/80 text-sm">Your trusted local marketplace</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'news'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📰 News & Updates
          </button>
          <button
            onClick={() => setActiveTab('advert')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'advert'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📢 Adverts & Promos
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'top'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ⭐ Top Artisans
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              {mockNews.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.type === 'news'
                      ? 'border-blue-500 bg-blue-50'
                      : item.type === 'promo'
                      ? 'border-green-500 bg-green-50'
                      : 'border-purple-500 bg-purple-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.content}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'news'
                          ? 'bg-blue-100 text-blue-800'
                          : item.type === 'promo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{item.date}</p>
                </div>
              ))}
            </div>
          )}

          {/* Adverts Tab */}
          {activeTab === 'advert' && (
            <div className="space-y-4">
              <div className="relative">
                <div className="overflow-hidden rounded-xl">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentAdvertIndex * 100}%)`,
                    }}
                  >
                    {mockAdverts.map((advert) => (
                      <div
                        key={advert.id}
                        className="w-full flex-shrink-0 p-6 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl"
                      >
                        {advert.discount && (
                          <span className="inline-block px-3 py-1 bg-secondary text-white text-sm font-bold rounded-full mb-3">
                            {advert.discount}
                          </span>
                        )}
                        <h3 className="text-xl font-bold mb-2">{advert.title}</h3>
                        <p className="text-muted-foreground mb-3">{advert.description}</p>
                        <div className="flex items-center gap-2">
                          <Megaphone className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{advert.businessName}</span>
                          <span className="text-xs text-muted-foreground">
                            • {advert.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() =>
                    setCurrentAdvertIndex((prev) =>
                      prev === 0 ? mockAdverts.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-muted/90 rounded-full flex items-center justify-center shadow-md hover:bg-muted text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentAdvertIndex((prev) =>
                      prev >= mockAdverts.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-muted/90 rounded-full flex items-center justify-center shadow-md hover:bg-muted text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2">
                {mockAdverts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAdvertIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentAdvertIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Top Artisans Tab */}
          {activeTab === 'top' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">🏆 Top Artisans This Week</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-updating every 3 seconds
                </p>
              </div>

              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentArtisanIndex * 100}%)`,
                  }}
                >
                  {mockTopArtisans.map((artisan, index) => (
                    <div
                      key={artisan.id}
                      className="w-full flex-shrink-0 p-6 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                            {artisan.name.charAt(0)}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold">{artisan.businessName}</h4>
                          <p className="text-sm text-muted-foreground">{artisan.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {artisan.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-secondary text-secondary" />
                              <span className="font-medium">{artisan.rating}</span>
                              <span className="text-sm text-muted-foreground">
                                ({artisan.totalReviews} reviews)
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            ✅ {artisan.completedJobs} jobs completed
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artisan indicators */}
              <div className="flex justify-center gap-2">
                {mockTopArtisans.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentArtisanIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentArtisanIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/50">
          <Button onClick={onClose} className="w-full">
            Start Exploring
          </Button>
        </div>
      </div>
    </div>
  );
}
