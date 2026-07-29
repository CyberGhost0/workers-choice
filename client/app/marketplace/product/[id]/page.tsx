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
import { ArrowLeft, Loader2, MessageCircle, ShoppingCart, ShieldCheck } from 'lucide-react';
import { ImageCarousel } from '@/components/ui/ImageCarousel';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stockQuantity?: number;
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
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

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="text-muted-foreground">
            The product you are looking for is no longer available.
          </p>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inStock = product.stockQuantity === undefined || product.stockQuantity > 0;

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
            <ImageCarousel images={product.images} alt={product.title} className="aspect-video rounded-xl overflow-hidden border" interval={5000} />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.seller.averageRating || 0} size="sm" showValue />
              <span className="text-sm text-muted-foreground">
                ({product.seller.totalReviews || 0} reviews)
              </span>
            </div>

            <div className="text-3xl font-bold text-primary mb-1">
              {formatCurrency(product.price)}
            </div>
            <p className={`text-xs mb-6 ${inStock ? 'text-green-600' : 'text-destructive'}`}>
              {inStock
                ? product.stockQuantity !== undefined
                  ? `${product.stockQuantity} in stock`
                  : 'In stock'
                : 'Out of stock'}
            </p>

            <p className="text-sm text-foreground/80 whitespace-pre-line mb-6">
              {product.description}
            </p>

            {/* Seller card */}
            <div className="bg-card rounded-xl border p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {product.seller.user.profile.avatarUrl ? (
                    <img
                      src={product.seller.user.profile.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-primary">
                      {product.seller.businessName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-1">
                    {product.seller.businessName}
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.seller.user.profile.fullName}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" disabled={!inStock}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {inStock ? 'Buy Now' : 'Out of Stock'}
              </Button>
              <Link href={`/chat?provider=${product.seller.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Seller
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
