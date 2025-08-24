import { AppHeader } from "@/components/AppHeader";
import { AuthForm } from "@/components/AuthForm";
import { useUser } from "@/lib/supabaseClient";

const SignupPage = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppHeader user={user} />
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Create Your Free Account
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Join DomainDrip today and get 50 free credits to start finding perfect domain names with AI-powered search.
          </p>
        </div>
        <AuthForm initialTab="signup" />
      </div>
    </div>
  );
};

export default SignupPage;