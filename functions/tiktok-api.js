/**
 * TikLoad — Netlify Function
 * Proxies requests to tikwm.com API to get no-watermark TikTok media
 */

const TIKWM_API = 'https://www.tikwm.com/api/';

exports.handler = async (event) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');

    if (!url) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing URL parameter' }),
      };
    }

    // Validate it's a TikTok URL
    if (!/tiktok\.com/.test(url)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Please provide a valid TikTok URL' }),
      };
    }

    // Call tikwm API
    const apiParams = new URLSearchParams({
      url: url,
      hd: '1', // request HD quality
    });

    const res = await fetch(`${TIKWM_API}?${apiParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Upstream service error. Please try again later.' }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('TikTok API error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};
