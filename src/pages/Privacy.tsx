import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Effective Date: July 16, 2025</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p>
            DomainDrip ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, https://www.domaindrip.ai (the "Site"), and when you interact with our products and services.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Personal Information:</h3>
              <p>
                We may collect personally identifiable information, such as your name, email address, and payment information, when you sign up for our services, make a purchase, or contact us.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Usage Data:</h3>
              <p>
                We collect anonymous data on how you access and use the Site, including IP address, browser type, operating system, pages viewed, referring URLs, and the time and date of your visit.
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Cookies and Tracking Technologies:</h3>
              <p>
                We use cookies and similar tracking technologies to improve your experience, analyze site traffic, and personalize content.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and maintain our services</li>
              <li>Process transactions and manage your account</li>
              <li>Improve our website and customer experience</li>
              <li>Communicate with you about updates, promotions, and support</li>
              <li>Ensure legal compliance and protect against fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Sharing Your Information</h2>
            <p className="mb-2">We do not sell your personal information. We may share your information with:</p>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Service Providers:</h3>
              <p>Third parties that help us operate the Site and deliver services (e.g., payment processors, hosting providers)</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Legal Compliance:</h3>
              <p>If required by law or to protect rights, safety, or property</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Business Transfers:</h3>
              <p>In the event of a merger, acquisition, or asset sale</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Your Choices</h2>
            <p className="mb-2">You may:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Opt out of marketing emails by clicking "unsubscribe" in the email</li>
              <li>Disable cookies through your browser settings</li>
              <li>Request access to or deletion of your personal information by contacting us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your data. However, no online service can guarantee complete security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Links</h2>
            <p>
              Our Site may contain links to other websites. We are not responsible for their privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Any changes will be posted on this page with a revised effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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

export default Privacy;