'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/StarRating';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Loader2, MessageCircle, MapPin, ShieldCheck } from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';

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

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/services/${id}`);
        setService(res.data.service);
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <p className="text-muted-foreground">
            The service you are looking for is no longer available.
          </p>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <ImageCarousel images={service.images} alt={service.title} className="aspect-video rounded-xl overflow-hidden border" interval={5000} />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{service.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={service.artisan.averageRating || 0} size="sm" showValue />
              <span className="text-sm text-muted-foreground">
                ({service.artisan.totalReviews || 0} reviews)
              </span>
            </div>

            <div className="text-3xl font-bold text-primary mb-1">
              {formatCurrency(service.price)}
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              {service.priceType === 'HOURLY' ? 'per hour' : 'fixed price'}
            </p>

            <p className="text-sm text-foreground/80 whitespace-pre-line mb-6">
              {service.description}
            </p>

            {/* Provider card */}
            <div className="bg-card rounded-xl border p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {service.artisan.user.profile.avatarUrl ? (
                    <img
                      src={service.artisan.user.profile.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-primary">
                      {service.artisan.businessName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-1">
                    {service.artisan.businessName}
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {service.artisan.user.profile.fullName}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/chat?provider=${service.artisan.id}`} className="flex-1">
                <Button className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Provider
                </Button>
              </Link>
              <Link
                href={`/marketplace?category=${service.title.toLowerCase()}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Similar Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
