'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
            <p className="text-muted-foreground mb-10">
              Get in touch with the Workers-Choice team
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl shadow-sm border p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <a
                  href="tel:+2347069064663"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +234 7069 0646 63
                </a>
              </div>

              <div className="bg-card rounded-xl shadow-sm border p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a
                  href="mailto:mpanshak@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  mpanshak@gmail.com
                </a>
              </div>

              <div className="bg-card rounded-xl shadow-sm border p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-muted-foreground">Jos, Nigeria</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
