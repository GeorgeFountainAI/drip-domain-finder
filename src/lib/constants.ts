/**
 * Application configuration constants
 * Hardcoded values to avoid environment variable dependencies
 */

export const APP_CONFIG = {
  // URLs
  SUPABASE_URL: 'https://nfzmnkpepfrubjpifnna.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mem1ua3BlcGZydWJqcGlmbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzQ1MDgsImV4cCI6MjA2NzY1MDUwOH0.OIpe_wiOM-ypU65Q0qAmk1Xd0Hilm-oR1VeJbHTdzt0',
  APP_BASE_URL: 'https://domaindrip.ai',
  
  // Stripe (test keys) 
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51QVhBzGzNKcEgtoGvcyAudLOs7WViSJns6SLGu3NLfQcSclOPE8JYGJLf6qvutRfEmZhUjKH4FUyM2FT9o9BXdMJ007gIdOSJd',
  
  // Feature flags
  ENABLE_ANALYTICS: false,
  SHOW_TRUST_BADGE: false,
  
  // App settings
  CREDITS_PER_SEARCH: 2,
  CREDITS_PER_WILDCARD: 3,
} as const;