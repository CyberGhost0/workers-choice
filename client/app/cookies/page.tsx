import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: 'Cookie Notice | Workers-Choice',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Workers_Choice Cookie Notice</h1>
          <p className="text-sm text-muted-foreground mb-8">Version 3 - 27 February 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">About this Notice</h2>
              <p>
                This Cookie Notice provides information on how Workers_Choice uses cookies when you
                visit our website or mobile applications. Any Personal Data provided to or collected
                by Workers_Choice via cookies and other tracking technologies is controlled by
                Workers_Choice and processed in line with the Nigeria Data Protection Act, 2023.
                Kindly familiarise yourself with our cookie practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">What Are Cookies?</h2>
              <p>
                A cookie is a small text file placed on your device when you visit our website or
                mobile applications. Cookies help us provide you with a better shopping experience by
                remembering your preferences and understanding how you use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                Types of Cookies We Use
              </h2>

              <h3 className="font-semibold mb-2 text-foreground">
                Essential Cookies (Always Active)
              </h3>
              <p className="mb-2">
                These cookies are required for core website functionality and cannot be disabled.
                They enable:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>Secure login, checkout, and shopping cart functionality</li>
                <li>Fraud prevention and website security</li>
                <li>Basic site performance and customer support chat</li>
              </ul>
              <p className="mb-4">
                <span className="font-medium">Services:</span> Workers_Choice, New Relic, Cloudflare,
                Sprinklr
              </p>

              <h3 className="font-semibold mb-2 text-foreground">
                Non-Essential Cookies (Your Choice)
              </h3>

              <div className="mb-4">
                <h4 className="font-medium mb-1 text-foreground">Advertising Cookies</h4>
                <p className="mb-1">
                  Show you relevant advertisements and offers based on your interests.
                </p>
                <p className="mb-1">
                  <span className="font-medium">Services:</span> Facebook Pixel, Facebook Conversion
                  API, TikTok Pixel, Google AdSense, PubMatic, Google Tag Manager.
                </p>
                <p>
                  <span className="font-medium">Impact of declining:</span> Advertisements will be
                  less relevant to you.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-1 text-foreground">Analytics Cookies</h4>
                <p className="mb-1">
                  Help us understand how you use our website to improve your experience.
                </p>
                <p className="mb-1">
                  <span className="font-medium">Services:</span> Google Analytics, Microsoft Clarity,
                  Cake, Mirakl.
                </p>
                <p>
                  <span className="font-medium">Impact of declining:</span> Limits our ability to
                  improve services based on user behavior.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1 text-foreground">Personalisation Cookies</h4>
                <p className="mb-1">
                  Remember your preferences and provide customised recommendations.
                </p>
                <p className="mb-1">
                  <span className="font-medium">Services:</span> MoEngage
                </p>
                <p>
                  <span className="font-medium">Impact of declining:</span> You may receive generic
                  content instead of personalised suggestions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                Managing Your Cookie Preferences
              </h2>
              <p className="mb-3">
                On your first visit: Choose to &lsquo;Manage Cookies&rsquo;, &lsquo;Reject Optional
                Cookies&rsquo; or &lsquo;Accept All Cookies&rsquo;.
              </p>
              <p className="mb-3">
                At any time, you can change your cookie settings by visiting Cookie Preferences page
                or through your browser settings.
              </p>
              <p className="mb-3">
                Please note that blocking certain cookies may affect website functionality.
              </p>
              <p>
                For more information on the specific types of cookies used on our Website, please see
                our Cookies Table.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                Changes to this Cookie Policy
              </h2>
              <p className="mb-3">
                We may alter this Cookie Policy at any time. Kindly review this policy from time to
                time to ensure that you have up-to-date information.
              </p>
              <p>
                In the event of any conflict between the current version of this Cookie Policy and
                any previous version(s), the current provisions in effect shall prevail unless it is
                expressly stated otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Further Information</h2>
              <p>
                If you are looking for more information on how we process your personal data, or you
                wish to exercise your legal rights in respect of your personal data, please send us
                an email at Nigeria.Legal@Workers_Choice.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
