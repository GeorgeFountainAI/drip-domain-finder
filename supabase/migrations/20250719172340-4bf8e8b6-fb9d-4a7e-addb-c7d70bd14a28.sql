-- Enable Row Level Security for the settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings (configuration data typically needs to be readable)
CREATE POLICY "Allow public read access to settings" 
ON public.settings 
FOR SELECT 
USING (true);

-- Restrict write operations to service role only (settings should only be modified by admins/system)
CREATE POLICY "Only service role can modify settings" 
ON public.settings 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');