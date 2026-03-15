import { GoogleGenAI, Type } from "@google/genai";

const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is missing. AI features will not work.');
}

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

function generateHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
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

export async function generateThumbnail(prompt: string, referenceImage?: string) {
  if (!apiKey) {
    throw new Error('API Key is missing. Please configure GEMINI_API_KEY.');
  }

  try {
    const parts: any[] = [
      {
        text: `Generate a professional, high-quality, high-contrast YouTube thumbnail. It should be eye-catching and designed for high CTR. Style: Modern, vibrant, clean. 
        
CRITICAL INSTRUCTION FOR IDENTITY: You are provided with a reference image. You MUST use this reference image as the definitive source for the person's identity. Do not alter the facial features, appearance, or identity of the person in the reference image. The person in the generated thumbnail MUST be identical to the person in the reference image. If you are generating multiple images (e.g., 16:9 and 9:16), the person in ALL generated images MUST be identical to the person in the reference image. If the prompt mentions a specific public figure (e.g., a Senegalese wrestler or politician), ensure the generated image is a precise and accurate representation of that specific person, maintaining consistency with the reference image.

CRITICAL INSTRUCTION FOR TEXT: If the prompt asks for text on the image, you MUST spell it EXACTLY as requested. Pay extreme attention to spelling. DO NOT add extra letters, typos, or gibberish. Keep the text large, bold, and perfectly legible.

Prompt: ${prompt}`,
      },
    ];

  if (referenceImage) {
      // Extract mime type and base64 data
      const matches = referenceImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.unshift({
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          },
        });
      }
    }

    const generateWithRetry = async (model: string, config: any, parts: any[]) => {
      let retries = 3;
      let delay = 2000;
      while (retries > 0) {
        try {
          return await ai.models.generateContent({
            model,
            contents: { parts },
            config
          });
        } catch (err: any) {
          if ((err.status === 429 || err.message?.includes('429')) && retries > 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            retries--;
            continue;
          }
          throw err;
        }
      }
    };

    // Generate 16:9 thumbnail
    const response169 = await generateWithRetry('gemini-2.5-flash-image', {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }, parts);

    // Generate 9:16 thumbnail
    const response916 = await generateWithRetry('gemini-2.5-flash-image', {
      imageConfig: {
        aspectRatio: "9:16",
        imageSize: "1K"
      }
    }, parts);

    let horizontal = '';
    let vertical = '';

    for (const part of response169.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        horizontal = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    for (const part of response916.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        vertical = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!horizontal || !vertical) {
      throw new Error('Failed to generate both images');
    }

    return { horizontal, vertical };
  } catch (error) {
    console.error("Error in generateThumbnail:", error);
    throw error;
  }
}
export async function generateKeywordData(keyword: string, isPro: boolean = false) {
  const cacheKey = `keyword_${keyword}_${isPro}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const proPrompt = isPro ? "En tant que fonctionnalité PRO, fournissez une estimation très précise du CPC (Coût par Clic) en USD, une tendance de recherche détaillée (En hausse, En baisse, Stable), et un 'pro_insight' qui est un conseil stratégique d'une phrase pour ce mot-clé." : "";
  const proProperties = isPro ? {
    cpc: { type: Type.NUMBER, description: "Estimation du CPC en USD" },
    trend: { type: Type.STRING, description: "En hausse, En baisse, ou Stable" },
    pro_insight: { type: Type.STRING, description: "Un conseil stratégique d'une phrase pour ce mot-clé" }
  } : {};
  const proRequired = isPro ? ["cpc", "trend", "pro_insight"] : [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agissez comme un outil d'expert en SEO YouTube comme vidIQ. Analysez le mot-clé : "${keyword}". Fournissez des données estimées réalistes pour le volume de recherche, le niveau de concurrence et un score SEO global (0-100).
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES DE YOUTUBE. Utilisez Google Search pour trouver de vraies chaînes et vidéos classées pour ce mot-clé.
    
    Fournissez également des listes pour :
    1. Mots-clés associés (Related keywords)
    2. Termes correspondants (Matching terms - mots-clés contenant la phrase exacte)
    3. Questions (Des questions - questions contenant le mot-clé)
    
    Si le mot-clé est très long ou obscur, vous pouvez renvoyer des tableaux vides pour les listes afin de simuler un état "non trouvé".
    ${proPrompt}
    
    RÉPONDEZ TOUJOURS EN FRANÇAIS.`,
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

  const proPrompt = isPro ? "En tant que fonctionnalité PRO, fournissez une estimation très précise du CPC (Coût par Clic) en USD, une tendance de recherche détaillée (En hausse, En baisse, Stable), et un 'pro_insight' qui est un conseil stratégique d'une phrase pour ce mot-clé." : "";
  const proProperties = isPro ? {
    cpc: { type: Type.NUMBER, description: "Estimation du CPC en USD" },
    trend: { type: Type.STRING, description: "En hausse, En baisse, ou Stable" },
    pro_insight: { type: Type.STRING, description: "Un conseil stratégique d'une phrase pour ce mot-clé" }
  } : {};
  const proRequired = isPro ? ["cpc", "trend", "pro_insight"] : [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agissez comme un outil d'expert en SEO YouTube comme vidIQ. Analysez la liste de mots-clés suivante : ${JSON.stringify(keywords)}. 
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES DE YOUTUBE. Utilisez Google Search pour trouver de réelles tendances et données pour ces mots-clés.
    Pour chaque mot-clé, fournissez des données estimées réalistes pour le volume de recherche, le niveau de concurrence et un score SEO global (0-100).
    ${proPrompt}
    
    RÉPONDEZ TOUJOURS EN FRANÇAIS.`,
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
  // Truncate inputs to prevent prompt injection or token limit issues
  const safeTitle = title.slice(0, 200);
  const safeDescription = description.slice(0, 3000);
  const safeTags = tags.slice(0, 500);

  const hash = generateHash(safeTitle + safeDescription + safeTags);
  const cacheKey = `seo_${hash}_${isPro}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  if (!apiKey) {
    throw new Error('API Key is missing. Please configure GEMINI_API_KEY.');
  }

  try {
    const proPrompt = isPro ? "Fournissez également 3 variations de titre pour l'A/B testing qui sont hautement cliquables et optimisées, une estimation très précise du CPC (Coût par Clic) en USD, et une tendance de recherche détaillée (En hausse, En baisse, Stable)." : "";
    const proProperties = isPro ? {
      ab_test_titles: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "3 highly clickable title variations for A/B testing"
      },
      cpc: { type: Type.NUMBER, description: "Estimated CPC in USD" },
      trend: { type: Type.STRING, description: "Up, Down, or Stable" }
    } : {};
    const proRequired = isPro ? ["ab_test_titles", "cpc", "trend"] : [];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Agissez en tant qu'expert en SEO YouTube, avec une expertise approfondie dans le contexte culturel et linguistique du Sénégal. Analysez les métadonnées vidéo suivantes.

VOUS DEVEZ COMPRENDRE ET ANALYSER LE WOLOF. Si le titre, la description ou les tags contiennent des mots en Wolof, vous devez les interpréter correctement dans leur contexte culturel.

VOUS DEVEZ ÉGALEMENT COMPRENDRE LES ENJEUX SPÉCIFIQUES À LA LUTTE SÉNÉGALAISE ET À LA POLITIQUE SÉNÉGALAISE. Appliquez cette connaissance pour optimiser le SEO, car ces sujets ont des dynamiques d'engagement très particulières.

Fournissez un score SEO (0-100), des recommandations exploitables EN FRANÇAIS, et une version hautement optimisée des métadonnées qui obtiendrait un score de 95+ EN FRANÇAIS. ${proPrompt}
      
      TITRE: ${safeTitle}
      DESCRIPTION: ${safeDescription}
      TAGS: ${safeTags}
      
      Calculez un score basé sur :
      - Optimisation des mots-clés du titre (25%)
      - Longueur de la description et mots-clés (20%)
      - Pertinence et nombre de tags (20%)
      - Potentiel d'engagement estimé (20%)
      - Potentiel de volume de mots-clés (15%)

      Fournissez également un 'thumbnail_prompt' : une description détaillée pour un générateur d'images IA afin de créer une miniature YouTube professionnelle, à fort contraste et très cliquable pour cette vidéo.
      TRÈS IMPORTANT POUR LE THUMBNAIL_PROMPT : S'il y a du texte sur la miniature, il doit être TRÈS COURT (1 à 3 mots maximum). Vous devez insister dans le prompt pour que le générateur d'images orthographie ce texte PARFAITEMENT, SANS AUCUNE FAUTE.
      
      TOUTES LES RECOMMANDATIONS ET LES TEXTES GÉNÉRÉS DOIVENT ÊTRE EN FRANÇAIS.
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
            thumbnail_prompt: { type: Type.STRING, description: "Detailed prompt for generating a thumbnail" },
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
          required: ["seo_score", "title_score", "description_score", "tags_score", "recommendations", "viral_potential", "thumbnail_prompt", "optimized_metadata", ...proRequired]
        }
      }
    });

    const result = safeJsonParse(response.text, {});
    if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error in analyzeVideoSEO:", error);
    throw error;
  }
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
  const cacheKey = `competitor_v3_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Act as a YouTube strategist. Analyze the real YouTube channel "${channelName}".
    
    CRITICAL INSTRUCTION: YOU MUST USE REAL, CURRENT YOUTUBE DATA. 
    1. Use Google Search to find the EXACT channel "${channelName}".
    2. If there are multiple channels with similar names, identify the most relevant one but BE PRECISE about its stats.
    3. DO NOT HALLUCINATE OR GUESS. If you find a channel with 150 subscribers, DO NOT report 215k.
    4. Cross-reference multiple search results to verify subscriber counts and view counts.
    5. Provide the exact subscriber count as shown on YouTube.
    
    Provide the response in FRENCH.
    
    Provide:
    1. The EXACT name of the channel you found (real_channel_name)
    2. Exact or highly accurate subscriber count (number)
    3. Average views per video based on the last 10 videos (number)
    4. Upload frequency (string, e.g., "2 vidéos/semaine")
    5. Estimated Engagement Rate (percentage, e.g., "4.2%")
    6. Estimated Monthly Revenue Range (string, e.g., "500€ - 2500€")
    7. Top 5 keywords they actually rank for
    8. Their 3 main strengths
    9. 3-5 actionable recommendations
    10. The exact YouTube channel URL (channel_url). VERIFY THIS URL.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          real_channel_name: { type: Type.STRING, description: "The exact name of the channel found" },
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
        required: ["real_channel_name", "estimated_subscribers", "avg_views_per_video", "upload_frequency", "engagement_rate", "estimated_monthly_revenue", "top_keywords", "strengths", "recommendations", "channel_url"]
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
  const cacheKey = `traffic_v2_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Agissez comme un analyste de données YouTube expert (type SocialBlade / vidIQ). Analysez la chaîne YouTube SPÉCIFIQUE : "${channelName}".
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES ET VÉRIDIQUES. Utilisez Google Search pour trouver les statistiques publiques réelles de "${channelName}" (vues mensuelles, abonnés, revenus estimés sur SocialBlade/NoxInfluencer).
    
    Puisque les sources de trafic exactes sont privées, vous devez faire une ESTIMATION TRÈS PRÉCISE ET RÉALISTE basée sur le type de contenu de la chaîne (ex: les tutoriels ont >60% de recherche, le divertissement a >70% de suggestions/navigation).
    
    RÉPONDEZ EN FRANÇAIS.
    
    Fournissez :
    1. Vues mensuelles estimées (donnée réelle).
    2. Revenus mensuels estimés (donnée réelle basée sur le RPM du marché).
    3. Score d'autorité de la chaîne (0-100).
    4. Le moteur de trafic principal (ex: "Recherche YouTube", "Fonctionnalités de navigation").
    5. Géographie de l'audience (estimation basée sur la langue et le contenu).
    6. Sources de trafic (estimations réalistes en % qui totalisent 100%).
    7. Métriques d'engagement (Taux d'engagement réel estimé, Rétention estimée).
    8. 3 recommandations ultra-spécifiques et actionnables pour cette chaîne exacte.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          monthly_views_estimate: { type: Type.STRING, description: "Ex: '1.5M - 2M vues/mois'" },
          monthly_revenue_estimate: { type: Type.STRING, description: "Ex: '3 000 € - 8 000 €'" },
          channel_authority_score: { type: Type.NUMBER, description: "Score 0-100" },
          primary_traffic_driver: { type: Type.STRING },
          audience_geography: { type: Type.STRING },
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
          engagement_metrics: {
            type: Type.OBJECT,
            properties: {
              engagement_rate: { type: Type.STRING, description: "Ex: '4.5%'" },
              estimated_retention: { type: Type.STRING, description: "Ex: '40-50%'" }
            },
            required: ["engagement_rate", "estimated_retention"]
          },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["monthly_views_estimate", "monthly_revenue_estimate", "channel_authority_score", "primary_traffic_driver", "audience_geography", "traffic_sources", "engagement_metrics", "recommendations"]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

export async function fetchChannelTopVideos(channelName: string) {
  const cacheKey = `top_videos_v2_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Agissez comme un outil d'analyse YouTube. Trouvez les 5 VIDÉOS LES PLUS VUES (Top vidéos) RÉELLES de la chaîne "${channelName}".
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES ET VÉRIDIQUES. Cherchez spécifiquement les vidéos les plus populaires de cette chaîne exacte.
    Ne confondez pas avec d'autres chaînes.
    Pour chaque vidéo, fournissez :
    - title: Le titre EXACT de la vidéo.
    - views: Le nombre de vues RÉEL (ex: '4.2M vues').
    - url: L'URL réelle de la vidéo ou un lien de recherche pertinent.
    - published_date: La date ou l'année de publication (ex: 'Il y a 2 ans').
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
            url: { type: Type.STRING },
            published_date: { type: Type.STRING }
          },
          required: ["title", "views", "url", "published_date"]
        }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(cacheKey, result);
  return result;
}

export async function generateGrowthStrategy(channelName: string, analysis: any) {
  const cacheKey = `strategy_v3_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Agissez en tant que stratège YouTube d'élite mondial. En vous basant sur l'analyse de la chaîne "${channelName}": ${JSON.stringify(analysis)}, fournissez LA SOLUTION PARFAITE À SUIVRE (un plan d'action infaillible et étape par étape) pour faire exploser la croissance de la chaîne.
    
    RÉPONDEZ EN FRANÇAIS.
    
    La stratégie doit être structurée comme une feuille de route (roadmap) parfaite :
    1. Un résumé percutant de la stratégie globale.
    2. Une feuille de route en 3 phases (ex: Immédiat, Court terme, Long terme) avec des actions ultra-spécifiques.
    3. La "Sauce Secrète" (1 ou 2 tactiques psychologiques ou de rétention très avancées).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategy_summary: { type: Type.STRING },
          perfect_roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase_name: { type: Type.STRING, description: "Ex: Phase 1 : Optimisation Immédiate (Jours 1-7)" },
                objective: { type: Type.STRING },
                action_steps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["phase_name", "objective", "action_steps"]
            }
          },
          secret_sauce: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["strategy_summary", "perfect_roadmap", "secret_sauce"]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

