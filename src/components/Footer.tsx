import { Link } from "react-router-dom";
import { Droplets, Mail, HelpCircle, FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-primary/20 bg-background/80 backdrop-blur py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                DomainDrip
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">About DomainDrip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The premier AI-powered domain marketplace for entrepreneurs and creatives. We curate premium domains 
                and provide intelligent tools to help you discover, buy, and flip domain names with precision and insight.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@domaindrip.com" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Support & Partnerships
                </a>
              </li>
              <li>
                <Link to="/strategy" className="hover:text-primary transition-colors">
                  Strategy Sessions
                </Link>
              </li>
              <li>
                <Link to="/partner" className="hover:text-primary transition-colors">
                  Partner Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 DomainDrip. Discover, Buy & Flip Domain Names Powered by AI.</p>
          <p className="mt-2 text-xs">Built with intelligence for digital entrepreneurs worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;