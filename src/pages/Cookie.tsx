import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Cookie = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Cookie Policy</h1>
          <p className="text-muted-foreground mt-2">Effective Date: July 16, 2025</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p>
            This Cookie Policy explains how DomainDrip ("we", "us", or "our") uses cookies and similar technologies on our website, https://www.domaindrip.ai ("Site"). By continuing to use our Site, you agree to the use of cookies as described in this policy.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and enhance your experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
              <p>
                These cookies are necessary for the Site to function properly and cannot be disabled in our systems. They are typically set in response to actions like logging in or filling out forms.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Performance Cookies</h3>
              <p>
                These cookies collect anonymous data on how visitors use our Site (e.g., pages visited, traffic sources). We use this data to improve site functionality and performance.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Functional Cookies</h3>
              <p>
                These cookies allow the Site to remember your preferences (e.g., language settings) to provide a more personalized experience.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Targeting/Advertising Cookies</h3>
              <p>
                These cookies may be set by us or third-party advertising partners to build a profile of your interests and show relevant ads on other websites.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
            <p>
              We may use third-party services (such as Google Analytics or Meta Pixel) that set their own cookies to help us analyze user behavior and optimize marketing. These third parties have their own privacy and cookie policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
            <p className="mb-4">
              You can control or delete cookies through your browser settings. Most browsers allow you to block or delete cookies, but doing so may affect your experience on our Site.
            </p>
            <p className="mb-2">To learn more about managing cookies, visit:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutcookies.org</a></li>
              <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.allaboutcookies.org</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy periodically. Any changes will be posted on this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> <a href="mailto:support@domaindrip.ai" className="text-primary hover:underline">support@domaindrip.ai</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookie;