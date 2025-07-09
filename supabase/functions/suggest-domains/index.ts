import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword } = await req.json();

    if (!keyword || keyword.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `Generate 5 creative and memorable domain name suggestions based on the keyword "${keyword}". Follow these guidelines:

1. Make them short, catchy, and brandable
2. Include variations with different TLDs (.com, .ai, .app, .io, .co)
3. Consider word combinations, abbreviations, and creative spellings
4. Make them relevant to businesses, startups, or projects
5. Avoid trademark conflicts with major brands

Return ONLY a JSON array of 5 domain names (without http:// or https://), like:
["example.com", "keyword-app.io", "keywordly.ai", "getkeyword.co", "keyword-hub.app"]

No additional text or formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a creative domain name generator. Always respond with valid JSON arrays of domain names only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate suggestions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let suggestions: string[];
    try {
      suggestions = JSON.parse(generatedText.trim());
      
      // Validate that we got an array of strings
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid response format');
      }
      
      // Ensure we have exactly 5 suggestions and they're all strings
      suggestions = suggestions
        .filter(s => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 5);
        
      if (suggestions.length === 0) {
        throw new Error('No valid suggestions generated');
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError, 'Raw response:', generatedText);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI suggestions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in suggest-domains function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});