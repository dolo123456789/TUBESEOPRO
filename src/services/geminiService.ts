import { GoogleGenAI, Type } from "@google/genai";

const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Cache configuration
const CACHE_PREFIX = 'tubeseo_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function getCache(key: string) {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

function setCache(key: string, data: any) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Local storage might be full
    console.warn('Cache full, clearing old entries');
    clearOldCache();
  }
}

function clearOldCache() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {}
}

function safeJsonParse(text: string | undefined, fallback: any) {
  if (!text) return fallback;
  try {
    let cleaned = text.trim();
    
    // Remove markdown code blocks
    if (cleaned.includes('```')) {
      const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleaned = match[1].trim();
      }
    }
    
    // Find the first and last structural characters
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    
    let start = -1;
    let end = -1;
    
    // Determine if it's an object or array based on which comes first
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }
    
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }

    const parsed = JSON.parse(cleaned);
    
    // If fallback is an array, ensure we return an array
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return [parsed];
    }
    
    return parsed;
  } catch (e) {
    console.error("JSON Parse Error:", e, text);
    return fallback;
  }
}

export async function generateKeywordData(keyword: string, isPro: boolean = false) {
  const cacheKey = `keyword_${keyword}_${isPro}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const proPrompt = isPro ? "Also provide CPC (Cost Per Click) estimate and a search trend (Up, Down, Stable)." : "";
  const proProperties = isPro ? {
    cpc: { type: Type.NUMBER, description: "Estimated CPC in USD" },
    trend: { type: Type.STRING, description: "Up, Down, or Stable" }
  } : {};
  const proRequired = isPro ? ["cpc", "trend"] : [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube SEO expert tool like vidIQ. Analyze the keyword: "${keyword}". Provide realistic estimated data for search volume, competition level, and an overall SEO score (0-100).
    YOU MUST USE REAL, EXISTING YOUTUBE DATA. Use Google Search to find real channels and videos ranking for this keyword.
    
    Also provide lists for:
    1. Related keywords (Mots clés associés)
    2. Matching terms (Termes correspondants - keywords containing the exact phrase)
    3. Questions (Des questions - questions containing the keyword)
    
    If the keyword is very long or obscure, you can return empty arrays for the lists to simulate a "not found" state.
    ${proPrompt}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overall_score: { type: Type.NUMBER, description: "Score from 0 to 100" },
          score_label: { type: Type.STRING, description: "FAIBLE, MOYEN, or ÉLEVÉ" },
          search_volume: { type: Type.STRING, description: "e.g., '<750', '15.2K', '1.2M'" },
          search_volume_trend: { type: Type.STRING, description: "e.g., 'Très lent', 'Stable', 'En hausse'" },
          competition: { type: Type.STRING, description: "e.g., 'Faible', 'Moyenne', 'Élevée'" },
          competition_trend: { type: Type.STRING, description: "e.g., 'Très lent', 'Stable', 'Élevé'" },
          ...proProperties,
          related_keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                volume: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["keyword", "volume", "score"]
            }
          },
          matching_terms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                volume: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["keyword", "volume", "score"]
            }
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                volume: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["keyword", "volume", "score"]
            }
          }
        },
        required: ["overall_score", "score_label", "search_volume", "search_volume_trend", "competition", "competition_trend", "related_keywords", "matching_terms", "questions", ...proRequired]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

export async function generateBulkKeywordData(keywords: string[], isPro: boolean = false) {
  const cacheKey = `bulk_${keywords.join('_')}_${isPro}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const proPrompt = isPro ? "Also provide CPC (Cost Per Click) estimate and a search trend (Up, Down, Stable)." : "";
  const proProperties = isPro ? {
    cpc: { type: Type.NUMBER, description: "Estimated CPC in USD" },
    trend: { type: Type.STRING, description: "Up, Down, or Stable" }
  } : {};
  const proRequired = isPro ? ["cpc", "trend"] : [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube SEO expert tool like vidIQ. Analyze the following list of keywords: ${JSON.stringify(keywords)}. 
    YOU MUST USE REAL, EXISTING YOUTUBE DATA. Use Google Search to find real trends and data for these keywords.
    For each keyword, provide realistic estimated data for search volume, competition level, and an overall SEO score (0-100).
    ${proPrompt}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            overall_score: { type: Type.NUMBER, description: "Score from 0 to 100" },
            score_label: { type: Type.STRING, description: "FAIBLE, MOYEN, or ÉLEVÉ" },
            search_volume: { type: Type.STRING, description: "e.g., '<750', '15.2K', '1.2M'" },
            search_volume_trend: { type: Type.STRING, description: "e.g., 'Très lent', 'Stable', 'En hausse'" },
            competition: { type: Type.STRING, description: "e.g., 'Faible', 'Moyenne', 'Élevée'" },
            competition_trend: { type: Type.STRING, description: "e.g., 'Très lent', 'Stable', 'Élevé'" },
            ...proProperties
          },
          required: ["keyword", "overall_score", "score_label", "search_volume", "search_volume_trend", "competition", "competition_trend", ...proRequired]
        }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(cacheKey, result);
  return result;
}

export async function analyzeVideoSEO(title: string, description: string, tags: string, isPro: boolean = false) {
  const cacheKey = `seo_${btoa(title + description + tags)}_${isPro}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const proPrompt = isPro ? "Also provide 3 A/B testing title variations that are highly clickable and optimized." : "";
  const proProperties = isPro ? {
    ab_test_titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 highly clickable title variations for A/B testing"
    }
  } : {};
  const proRequired = isPro ? ["ab_test_titles"] : [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube SEO expert tool. Analyze the following video metadata and provide an SEO score (0-100), actionable recommendations, and a highly optimized version of the metadata that would score 95+. ${proPrompt}
    Title: "${title}"
    Description: "${description}"
    Tags: "${tags}"
    
    Calculate a score based on:
    - Title keyword optimization (25%)
    - Description length and keywords (20%)
    - Tags relevance and count (20%)
    - Estimated engagement potential (20%)
    - Keyword volume potential (15%)
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seo_score: { type: Type.NUMBER, description: "Overall SEO score 0-100" },
          title_score: { type: Type.NUMBER, description: "Score for title 0-100" },
          description_score: { type: Type.NUMBER, description: "Score for description 0-100" },
          tags_score: { type: Type.NUMBER, description: "Score for tags 0-100" },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-5 actionable recommendations to improve SEO"
          },
          viral_potential: { type: Type.NUMBER, description: "Estimated viral potential 0-100 based on CTR and engagement factors" },
          optimized_metadata: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A highly optimized, click-worthy title" },
              description: { type: Type.STRING, description: "A highly optimized description with keywords and structure" },
              tags: { type: Type.STRING, description: "A comma-separated list of highly optimized tags" }
            },
            required: ["title", "description", "tags"]
          },
          ...proProperties
        },
        required: ["seo_score", "title_score", "description_score", "tags_score", "recommendations", "viral_potential", "optimized_metadata", ...proRequired]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

export async function generateTags(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube tag generator. Generate 15 highly optimized, relevant YouTube tags for the topic: "${topic}". Order them from most relevant/broad to more specific long-tail keywords.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(`tags_${topic}`, result);
  return result;
}

export async function analyzeCompetitorChannel(channelName: string) {
  const cacheKey = `competitor_v2_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube strategist. Analyze the real YouTube channel "${channelName}".
    YOU MUST USE REAL, EXISTING YOUTUBE DATA. Use Google Search to find the actual channel stats, recent videos, and performance. 
    DO NOT HALLUCINATE DATA. If the channel does not exist, try to find the closest real match or return an error-like response.
    
    Provide the response in FRENCH.
    
    Provide:
    1. Estimated subscribers (number)
    2. Average views per video (number)
    3. Upload frequency (string, e.g., "2 vidéos/semaine")
    4. Estimated Engagement Rate (percentage, e.g., "4.2%")
    5. Estimated Monthly Revenue Range (string, e.g., "500€ - 2500€")
    6. Top 5 keywords they actually rank for
    7. Their 3 main strengths (what makes them successful based on their real content)
    8. 3-5 actionable recommendations for me to improve my own channel by learning from them.
    9. The exact YouTube channel URL (channel_url). VERIFY THIS URL WORKS. It should be in the format https://www.youtube.com/@handle or https://www.youtube.com/channel/ID.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estimated_subscribers: { type: Type.NUMBER },
          avg_views_per_video: { type: Type.NUMBER },
          upload_frequency: { type: Type.STRING },
          engagement_rate: { type: Type.STRING },
          estimated_monthly_revenue: { type: Type.STRING },
          top_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          channel_url: { type: Type.STRING, description: "The verified working URL of the YouTube channel" }
        },
        required: ["estimated_subscribers", "avg_views_per_video", "upload_frequency", "engagement_rate", "estimated_monthly_revenue", "top_keywords", "strengths", "recommendations", "channel_url"]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}
export async function generateOutlierData(query: string, type: string, isPro: boolean = false) {
  const cacheKey = `outlier_v2_${query}_${type}_${isPro}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  let prompt = "";
  let schemaProperties: any = {};
  let requiredFields: string[] = [];

  if (type === 'breakout') {
    prompt = `Act as a YouTube analytics tool. The user is searching for "${query}". Find 8 REAL, EXISTING 'breakout' YouTube channels (channels experiencing sudden massive growth recently) related to this topic. 
    YOU MUST USE REAL, EXISTING YOUTUBE DATA. Use Google Search to find actual channels that exist right now.
    DO NOT HALLUCINATE OR CREATE FAKE CHANNELS.
    Provide: 
    - channel_name: THE EXACT REAL NAME
    - subscribers: Exact or estimated real count (e.g., '25.4 k')
    - growth_rate: Real estimated growth (e.g., '+450% last month')
    - total_views: Real total channel views
    - video_count: Number of videos on the channel
    - top_video_title: A REAL VIDEO TITLE from that channel
    - avatar_url: REAL YouTube channel avatar URL
    - channel_url: REAL, VERIFIED YouTube URL (e.g., https://www.youtube.com/@handle). TEST THIS URL IN YOUR SEARCH CONTEXT.
    `;
    schemaProperties = {
      channel_name: { type: Type.STRING },
      subscribers: { type: Type.STRING },
      growth_rate: { type: Type.STRING },
      total_views: { type: Type.STRING },
      video_count: { type: Type.NUMBER },
      top_video_title: { type: Type.STRING },
      avatar_url: { type: Type.STRING },
      channel_url: { type: Type.STRING }
    };
    requiredFields = ["channel_name", "subscribers", "growth_rate", "total_views", "video_count", "top_video_title", "avatar_url", "channel_url"];
  } else {
    const format = type === 'shorts' ? 'YouTube Shorts (vertical)' : 'YouTube videos';
    prompt = `Act as a YouTube analytics tool like vidIQ. The user is searching for "${query}". Find 8 REAL, EXISTING high-performing 'outlier' ${format} related to this search. 
    An 'outlier' is a video that performed significantly better than the channel's average.
    YOU MUST USE REAL, EXISTING YOUTUBE DATA. Use Google Search to find actual videos that exist right now.
    DO NOT HALLUCINATE. Every title and channel_name MUST correspond to a real video on YouTube.
    For each video, provide:
    - title: EXACT REAL YouTube video title
    - multiplier: Real performance vs channel average (e.g. 5.2)
    - channel_name: EXACT REAL channel name
    - subscribers: Real count (e.g. '1.2 M')
    - views: Real view count (e.g. '4.8 M')
    - channel_avg_views: The channel's typical view count per video (e.g. '150 k')
    - engagement_rate: Estimated real engagement rate (e.g. '8.5%')
    - published_time: Real time since upload (in French, e.g. 'Il y a 2 mois')
    - thumbnail_url: REAL YouTube thumbnail URL
    - video_url: REAL, VERIFIED YouTube video URL (e.g., https://www.youtube.com/watch?v=ID). TEST THIS URL.
    - channel_url: REAL, VERIFIED YouTube channel URL (e.g., https://www.youtube.com/@handle). TEST THIS URL.
    `;
    schemaProperties = {
      title: { type: Type.STRING },
      multiplier: { type: Type.NUMBER },
      channel_name: { type: Type.STRING },
      subscribers: { type: Type.STRING },
      views: { type: Type.STRING },
      channel_avg_views: { type: Type.STRING },
      engagement_rate: { type: Type.STRING },
      published_time: { type: Type.STRING },
      thumbnail_url: { type: Type.STRING },
      video_url: { type: Type.STRING },
      channel_url: { type: Type.STRING }
    };
    requiredFields = ["title", "multiplier", "channel_name", "subscribers", "views", "channel_avg_views", "engagement_rate", "published_time", "thumbnail_url", "video_url", "channel_url"];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", // Use Flash model for better speed and reliability with search grounding
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: requiredFields
        }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(cacheKey, result);
  return result;
}

export async function fetchTrendingVideos(query: string) {
  const cacheKey = `trending_${query}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube analytics tool. Find 6 REAL, CURRENTLY TRENDING YouTube videos from TOP, HIGHLY POPULAR channels related to the topic: "${query}".
    YOU MUST USE REAL, EXISTING YOUTUBE DATA. Use Google Search to find actual videos that are trending right now on top channels.
    IF YOU CANNOT FIND REAL TRENDING DATA, RETURN AN EMPTY ARRAY.
    For each video, provide:
    - title: The exact title of the trending video (REAL DATA)
    - channel: REAL channel name (MUST BE A TOP, HIGHLY POPULAR CHANNEL)
    - views: String like '45M', '3.2M' (Real stats for the video)
    - growth: String like '+120%', '+85%' (Real growth stats for the channel)
    - thumbnail: The direct URL to the YouTube video thumbnail (e.g., https://i.ytimg.com/vi/ID/maxresdefault.jpg). If not available, use a high-quality placeholder.
    - tags: Array of 3 relevant tags
    `,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            channel: { type: Type.STRING },
            views: { type: Type.STRING },
            growth: { type: Type.STRING },
            thumbnail: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "channel", "views", "growth", "thumbnail", "tags"]
        }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(cacheKey, result);
  return result;
}

export async function analyzeTrafficSources(channelName: string) {
  const cacheKey = `traffic_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube growth strategist. Analyze the traffic sources for the SPECIFIC YouTube channel: "${channelName}".
    YOU MUST USE REAL, EXISTING YOUTUBE DATA FOR THIS SPECIFIC CHANNEL ONLY. Use Google Search to find actual traffic patterns, audience demographics, and engagement sources for "${channelName}".
    DO NOT provide generic data or data for other channels.
    
    Provide the response in FRENCH.
    
    Provide:
    1. Main traffic sources (e.g., YouTube Search, Suggested Videos, External, Browse Features) with estimated percentages.
    2. Audience demographics (age, top countries).
    3. Engagement metrics (Average View Duration, Audience Retention).
    4. 3-5 actionable recommendations to improve organic traffic based on these sources.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          traffic_sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                percentage: { type: Type.NUMBER }
              },
              required: ["source", "percentage"]
            }
          },
          demographics: {
            type: Type.OBJECT,
            properties: {
              top_countries: { type: Type.ARRAY, items: { type: Type.STRING } },
              age_groups: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["top_countries", "age_groups"]
          },
          engagement_metrics: {
            type: Type.OBJECT,
            properties: {
              avg_view_duration: { type: Type.STRING },
              audience_retention: { type: Type.STRING }
            },
            required: ["avg_view_duration", "audience_retention"]
          },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["traffic_sources", "demographics", "engagement_metrics", "recommendations"]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

export async function fetchChannelTopVideos(channelName: string) {
  const cacheKey = `top_videos_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as a YouTube analytics tool. Find the 5 BEST, TOP PERFORMING videos for the channel "${channelName}".
    YOU MUST USE REAL, EXISTING YOUTUBE DATA FROM THIS SPECIFIC CHANNEL. Do not include videos from other channels.
    For each video, provide:
    - title: The EXACT title of the video from "${channelName}"
    - views: String like '45M', '3.2M' (Real stats)
    - url: The actual YouTube video URL if possible, or a search link.
    `,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            views: { type: Type.STRING },
            url: { type: Type.STRING }
          },
          required: ["title", "views", "url"]
        }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(cacheKey, result);
  return result;
}

export async function generateGrowthStrategy(channelName: string, analysis: any) {
  const cacheKey = `strategy_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Act as a world-class YouTube growth strategist. Based on the following analysis of the channel "${channelName}": ${JSON.stringify(analysis)}, provide a "MAGIC" strategy (more effective than standard tools like VidIQ) to explode the channel's growth.
    
    Provide the response in FRENCH.
    
    The strategy should be highly specific, unconventional, and actionable. Focus on:
    1. Content gaps and opportunities.
    2. Psychological triggers for higher CTR and retention.
    3. Community building tactics.
    4. A 30-day "explosive" content plan.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategy_summary: { type: Type.STRING },
          content_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
          unconventional_tactics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["strategy_summary", "content_plan", "unconventional_tactics"]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

