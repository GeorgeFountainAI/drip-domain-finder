import { AuthForm } from "@/components/AuthForm";
import domainDripLogo from "/lovable-uploads/54151200-6cf6-4c1b-b88a-bc150fc097c8.png";

const Auth = () => {
  return (
    <div className="min-h-screen relative">
      {/* Subtle background for watermark visibility */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-background via-muted/30 to-background" />
      
      {/* Background Logo Watermark - Now clearly visible */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img 
          src={domainDripLogo} 
          alt="" 
          className="w-[60vw] h-[60vh] object-contain opacity-[0.25] rotate-12 scale-150 mix-blend-overlay"
        />
      </div>
      <div className="relative z-10">
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;