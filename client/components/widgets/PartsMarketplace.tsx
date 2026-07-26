'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, ExternalLink, Store, ShoppingBag, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  seller?: {
    businessName?: string;
  };
}

// Curated affiliate / deep-link destinations for replacement parts
const partLinks = [
  { label: 'Generator & Inverter Parts', hint: 'Batteries, plugs, fuel pumps', href: 'https://www.jumia.com.ng/catalog/?q=generator+spare+parts' },
  { label: 'Plumbing Supplies', hint: 'Pipes, valves, fittings', href: 'https://www.jumia.com.ng/catalog/?q=plumbing+materials' },
  { label: 'Electrical & Wiring', hint: 'Cables, breakers, bulbs', href: 'https://www.jumia.com.ng/catalog/?q=electrical+supplies' },
  { label: 'Power Tools', hint: 'Drills, grinders, sockets', href: 'https://www.jumia.com.ng/catalog/?q=power+tools' },
  { label: 'Paint & Carpentry', hint: 'Paints, sandpaper, hinges', href: 'https://www.jumia.com.ng/catalog/?q=paint+and+carpentry+tools' },
  { label: 'Konga Tools & Parts', hint: 'Alternative marketplace', href: 'https://www.konga.com/search?q=tools+and+spare+parts' },
];

// Terms that identify a product as a tool, part, or hardware item
const TOOL_KEYWORDS = ['tool', 'plumbing', 'electrical', 'light', 'paint', 'wood', 'furniture', 'hardware', 'part', 'fitting'];

function isToolProduct(title: string): boolean {
  const t = title.toLowerCase();
  return TOOL_KEYWORDS.some((k) => t.includes(k));
}

export function PartsMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const all = res.data.products || [];
        const tools = all.filter((p: Product) => isToolProduct(p.title));
        setProducts(tools);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="h-5 w-5 text-secondary" />
          <h2 className="text-2xl font-bold">Tools &amp; Replacement Parts</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
          Cheap parts and tools for artisans and small businesses. Buy directly from local sellers
          on Workers-Choice or browse trusted external suppliers.
        </p>

        {/* Platform products with images and prices */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/marketplace/product/${product.id}`}
                className="bg-card rounded-xl shadow-sm border hover:shadow-md hover:border-secondary/50 transition-all overflow-hidden group"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={mediaUrl(product.images[0])}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23999" font-size="10">No image</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-lg font-bold text-secondary mt-1">
                    ₦{product.price?.toLocaleString()}
                  </p>
                  {product.seller?.businessName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.seller.businessName}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mb-8">No tools or parts available from local sellers yet.</p>
        )}

        {/* External supplier links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card rounded-xl p-5 shadow-sm border hover:shadow-md hover:border-secondary/50 transition-all flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {link.label}
                </h3>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-secondary" />
              </div>
              <p className="text-xs text-muted-foreground">{link.hint}</p>
            </a>
          ))}

          <Link
            href="/marketplace?category=products"
            className="bg-primary/10 rounded-xl p-5 shadow-sm border border-primary/20 hover:bg-primary/15 transition-all flex flex-col gap-1 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                All Local Products
              </h3>
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              Browse all products from sellers on Workers-Choice
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
