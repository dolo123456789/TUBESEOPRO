import { GoogleGenAI, Type } from "@google/genai";

const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is missing. AI features will not work.');
}

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

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

export async function generateThumbnail(prompt: string, referenceImage?: string, mode: 'mixed' | 'double_16_9' = 'mixed') {
  if (!apiKey) {
    throw new Error('API Key is missing. Please configure GEMINI_API_KEY.');
  }

  try {
    const basePrompt = `Generate a professional, high-quality, high-contrast YouTube thumbnail. It should be EXTREMELY eye-catching and designed for maximum CTR (Click-Through Rate). 
    Style: Modern, vibrant, cinematic, and highly emotional.
    
    KEY ELEMENTS FOR HIGH CTR:
    1. SUBJECT: A strong central subject with an intense, exaggerated emotional expression (shock, extreme surprise, intense determination, or fear).
    2. CONTRAST: Use high-contrast colors and professional lighting (rim lighting, dramatic shadows).
    3. BACKGROUND: A vibrant, detailed background that complements the subject but doesn't distract.
    4. VISUAL HOOKS: Include subtle visual cues like arrows, circles, or "proof" elements if relevant to the prompt.
    5. TEXT: If text is requested, it MUST be large, bold, and perfectly legible with a strong drop shadow or stroke.
    
CRITICAL INSTRUCTION FOR IDENTITY: You are provided with a reference image. You MUST use this reference image as the definitive source for the person's identity. Do not alter the facial features, appearance, or identity of the person in the reference image. The person in the generated thumbnail MUST be identical to the person in the reference image. If you are generating multiple images, the person in ALL generated images MUST be identical to the person in the reference image. If the prompt mentions a specific public figure (e.g., a Senegalese wrestler or politician), ensure the generated image is a precise and accurate representation of that specific person, maintaining consistency with the reference image.

CRITICAL INSTRUCTION FOR TEXT: If the prompt asks for text on the image, you MUST spell it EXACTLY as requested. Pay extreme attention to spelling. DO NOT add extra letters, typos, or gibberish. Keep the text large, bold, and perfectly legible.

Prompt: ${prompt}`;

    const parts: any[] = [{ text: basePrompt }];

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

    // Generate second thumbnail (either 9:16 or another 16:9)
    const secondAspectRatio = mode === 'double_16_9' ? '16:9' : '9:16';
    const responseSecond = await generateWithRetry('gemini-2.5-flash-image', {
      imageConfig: {
        aspectRatio: secondAspectRatio,
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

    for (const part of responseSecond.candidates?.[0]?.content?.parts || []) {
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
export async function generateKeywordData(keyword: string, isPro: boolean = false, region: string = 'Global') {
  const cacheKey = `keyword_v5_${keyword}_${isPro}_${region}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const proPrompt = isPro ? "En tant que fonctionnalité PRO, fournissez une estimation très précise du CPC (Coût par Clic) en USD, une tendance de recherche détaillée (En hausse, En baisse, Stable), et un 'pro_insight' qui est un conseil stratégique d'une phrase pour ce mot-clé. Ajoutez également une analyse de la 'difficulté' de classement (0-100) et pourquoi." : "";
  const proProperties = isPro ? {
    cpc: { type: Type.NUMBER, description: "Estimation du CPC en USD" },
    trend: { type: Type.STRING, description: "En hausse, En baisse, ou Stable" },
    pro_insight: { type: Type.STRING, description: "Un conseil stratégique d'une phrase pour ce mot-clé" },
    difficulty_score: { type: Type.NUMBER, description: "Difficulté de classement de 0 à 100" },
    difficulty_reason: { type: Type.STRING, description: "Explication de la difficulté" }
  } : {};
  const proRequired = isPro ? ["cpc", "trend", "pro_insight", "difficulty_score", "difficulty_reason"] : [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agissez comme un outil d'expert en SEO YouTube comme vidIQ. Analysez le mot-clé : "${keyword}". 
    Région cible : ${region}
    
    Fournissez des données estimées réalistes pour le volume de recherche, le niveau de concurrence et un score SEO global (0-100).
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES DE YOUTUBE. Utilisez Google Search pour trouver de vraies chaînes et vidéos classées pour ce mot-clé dans la région spécifiée.
    
    Fournissez également des listes pour :
    1. Mots-clés associés (Related keywords)
    2. Termes correspondants (Matching terms)
    3. Questions (Des questions)
    4. Top 5 des vidéos actuellement classées pour ce mot-clé (top_ranking_videos). Pour chaque vidéo, trouvez son URL réelle et son URL de miniature.
    
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
          },
          top_ranking_videos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                channel: { type: Type.STRING },
                views: { type: Type.STRING },
                published: { type: Type.STRING },
                video_url: { type: Type.STRING },
                thumbnail_url: { type: Type.STRING }
              },
              required: ["title", "channel", "views", "published", "video_url", "thumbnail_url"]
            }
          }
        },
        required: ["overall_score", "score_label", "search_volume", "search_volume_trend", "competition", "competition_trend", "related_keywords", "matching_terms", "questions", "top_ranking_videos", ...proRequired]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

export async function generateBulkKeywordData(keywords: string[], isPro: boolean = false, region: string = 'Global') {
  const cacheKey = `bulk_v2_${keywords.join('_')}_${isPro}_${region}`;
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
    Région cible : ${region}
    
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES DE YOUTUBE. Utilisez Google Search pour trouver de réelles tendances et données pour ces mots-clés dans la région spécifiée.
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
      contents: `Agissez en tant qu'expert en SEO YouTube de classe mondiale. Analysez les métadonnées vidéo suivantes.
      
      UTILISEZ GOOGLE SEARCH pour :
      1. Identifier les vidéos les plus performantes actuellement sur ce sujet : "${safeTitle}".
      2. Analyser les tendances de recherche actuelles pour les mots-clés liés à ce sujet.
      3. Trouver des "mots-clés de niche" à fort volume et faible concurrence que l'utilisateur a pu manquer.

      VOUS DEVEZ ÉGALEMENT COMPRENDRE ET ANALYSER LE WOLOF SI PRÉSENT. Si le titre, la description ou les tags contiennent des mots en Wolof, vous devez les interpréter correctement dans leur contexte culturel (Sénégal).
      
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

      Fournissez également :
      - 'thumbnail_prompt' : une description ultra-détaillée pour un générateur d'images IA (comme Midjourney ou DALL-E). La description doit inclure :
        1. Un sujet central fort avec une expression émotionnelle intense (surprise, choc, détermination).
        2. Un arrière-plan contrasté et vibrant.
        3. Des éléments visuels de "preuve" (flèches, cercles, graphiques en hausse).
        4. Des instructions sur l'éclairage (cinématique, dramatique) et la composition (règle des tiers).
        5. Du texte court et percutant (max 3 mots) à inclure sur l'image, avec des instructions de police grasse et lisible.
      - 'competitor_insights' : ce que font les vidéos du top 3 que l'utilisateur ne fait pas.
      - 'audience_retention_strategy' : comment structurer les 30 premières secondes pour maximiser la rétention.
      - 'keyword_gap' : 3-5 mots-clés manquants cruciaux.
      
      TOUTES LES RECOMMANDATIONS ET LES TEXTES GÉNÉRÉS DOIVENT ÊTRE EN FRANÇAIS.
      `,
      config: {
        tools: [{ googleSearch: {} }],
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
            viral_potential: { type: Type.NUMBER, description: "Estimated viral potential 0-100" },
            thumbnail_prompt: { type: Type.STRING, description: "Detailed prompt for generating a thumbnail" },
            competitor_insights: { type: Type.STRING, description: "Analysis of top competitors for this topic" },
            audience_retention_strategy: { type: Type.STRING, description: "Tips for the first 30 seconds" },
            keyword_gap: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missing high-potential keywords" },
            optimized_metadata: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "A highly optimized, click-worthy title" },
                description: { type: Type.STRING, description: "A highly optimized description" },
                tags: { type: Type.STRING, description: "A comma-separated list of optimized tags" }
              },
              required: ["title", "description", "tags"]
            },
            ...proProperties
          },
          required: ["seo_score", "title_score", "description_score", "tags_score", "recommendations", "viral_potential", "thumbnail_prompt", "competitor_insights", "audience_retention_strategy", "keyword_gap", "optimized_metadata", ...proRequired]
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
    contents: `Agissez comme un générateur de tags YouTube. Générez 15 tags YouTube hautement optimisés et pertinents pour le sujet : "${topic}". Classez-les du plus pertinent/général aux mots-clés de longue traîne plus spécifiques. RÉPONDEZ TOUJOURS EN FRANÇAIS.`,
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
    10. The exact YouTube channel URL (channel_url). VERIFY THIS URL.
    11. A brief analysis of their niche (niche_analysis)
    12. A suggested content strategy to compete with them (content_strategy)
    `,
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
          channel_url: { type: Type.STRING, description: "The verified working URL of the YouTube channel" },
          niche_analysis: { type: Type.STRING },
          content_strategy: { type: Type.STRING }
        },
        required: ["real_channel_name", "estimated_subscribers", "avg_views_per_video", "upload_frequency", "engagement_rate", "estimated_monthly_revenue", "top_keywords", "strengths", "recommendations", "channel_url", "niche_analysis", "content_strategy"]
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
    
    RÉPONDEZ TOUJOURS EN FRANÇAIS.
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

export async function fetchTrendingVideos(query: string, category: string = 'All', region: string = 'Global') {
  const cacheKey = `trending_v4_${query}_${category}_${region}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agissez comme un expert en analyse de tendances YouTube (type YouTube Culture & Trends). Trouvez 8 vidéos YouTube RÉELLES et ACTUELLEMENT TENDANCES liées au sujet : "${query}".
    Catégorie : ${category}
    Région : ${region}
    
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES ET VÉRIDIQUES. Utilisez Google Search pour trouver des vidéos qui font le buzz en ce moment même (dernières 24-72 heures).
    
    Pour chaque vidéo, fournissez :
    - title : Le titre exact de la vidéo.
    - channel : Le nom RÉEL de la chaîne.
    - views : Nombre de vues (ex: '1.2M', '450K').
    - growth : Taux de croissance estimé (ex: '+150% en 24h').
    - thumbnail : L'URL directe de la miniature YouTube (ex: https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg).
    - tags : Tableau de 3 tags pertinents.
    - viral_score : Un score de 0 à 100 représentant le potentiel viral.
    - video_url : L'URL réelle de la vidéo YouTube au format standard (https://www.youtube.com/watch?v=ID). Assurez-vous que la vidéo autorise l'intégration.
    - published_at : Date de publication relative (ex: 'Il y a 12 heures').
    - trending_reason : Une phrase expliquant POURQUOI cette vidéo est tendance (ex: 'Nouveau record de vues', 'Sujet d'actualité brûlant', 'Collaboration majeure').
    
    RÉPONDEZ TOUJOURS EN FRANÇAIS.
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
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            viral_score: { type: Type.NUMBER },
            video_url: { type: Type.STRING },
            published_at: { type: Type.STRING },
            trending_reason: { type: Type.STRING }
          },
          required: ["title", "channel", "views", "growth", "thumbnail", "tags", "viral_score", "video_url", "published_at", "trending_reason"]
        }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(cacheKey, result);
  return result;
}

export async function fetchPoliticalPredictions(forceRefresh: boolean = false) {
  const cacheKey = `political_predictions_senegal_v1`;
  if (!forceRefresh) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agissez comme un analyste politique expert du Sénégal. Votre mission est de générer des prédictions "chocs" et percutantes à COURT TERME (prochains jours ou semaines) sur l'actualité politique au Sénégal.
    
    Ces prédictions doivent être basées sur une analyse fine des tendances actuelles, des discours, et du climat politique réel au Sénégal (pouvoir, opposition, société civile, enjeux économiques et sociaux). L'objectif est d'attirer des visiteurs sur une chaîne YouTube en proposant des angles d'analyse originaux, provocateurs et à impact immédiat (mais restant dans le domaine de l'analyse politique crédible).
    
    Pour chaque prédiction, fournissez :
    - category : Une catégorie parmi ['Gouvernance', 'Opposition', 'Économie', 'Social', 'International', 'Justice'].
    - title : Un titre accrocheur et "choc" (ex: 'Le remaniement surprise ?', 'La nouvelle alliance de l'opposition').
    - description : Une analyse détaillée de 3-4 phrases expliquant pourquoi cet événement pourrait se produire à très court terme.
    - probability : Un pourcentage de probabilité (0-100%).
    - impact_score : Un score d'impact sur la scène politique (0-100).
    - key_actors : Les acteurs clés impliqués (ex: 'Gouvernement', 'Opposition', 'Syndicats', 'Acteurs internationaux').
    - recommended_video_title : Un titre de vidéo YouTube optimisé pour le CTR basé sur cette prédiction.
    - thumbnail_idea : Une idée de miniature visuelle pour cette vidéo.
    - hashtags : 3-5 hashtags pertinents (ex: #Senegal #Politique #Actualite #Analyse).
    - trend : La tendance actuelle de cette prédiction ('up' pour une probabilité en hausse, 'down' pour une probabilité en baisse, 'stable' pour une probabilité stable).
    
    Générez 6 prédictions distinctes qui frappent fort.
    RÉPONDEZ TOUJOURS EN FRANÇAIS.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            probability: { type: Type.NUMBER },
            impact_score: { type: Type.NUMBER },
            key_actors: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommended_video_title: { type: Type.STRING },
            thumbnail_idea: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            trend: { type: Type.STRING, description: "One of: 'up', 'down', 'stable'" }
          },
          required: ["category", "title", "description", "probability", "impact_score", "key_actors", "recommended_video_title", "thumbnail_idea", "hashtags", "trend"]
        }
      }
    }
  });

  const result = safeJsonParse(response.text, []);
  if (result && result.length > 0) setCache(cacheKey, result);
  return result;
}

export async function analyzeTrafficSources(channelName: string) {
  const cacheKey = `traffic_v3_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Agissez comme un analyste de données YouTube expert de classe mondiale (type SocialBlade / vidIQ / Think with Google). Analysez la chaîne YouTube SPÉCIFIQUE : "${channelName}".
    
    VOUS DEVEZ UTILISER DES DONNÉES RÉELLES ET VÉRIDIQUES. Utilisez Google Search pour trouver :
    1. Les statistiques publiques réelles (vues mensuelles, abonnés, revenus estimés).
    2. Les tendances de croissance récentes (30/90 derniers jours).
    3. Les 3 principaux concurrents directs dans la même niche et comment cette chaîne se compare à eux.
    4. Les types de contenu qui performent le mieux pour cette chaîne (Shorts vs Long-form).
    
    Puisque les sources de trafic exactes sont privées, vous devez faire une ESTIMATION TRÈS PRÉCISE ET ANALYTIQUE basée sur le type de contenu, les titres, et l'engagement (ex: les tutoriels ont >60% de recherche, le divertissement a >70% de suggestions/navigation).
    
    RÉPONDEZ EN FRANÇAIS.
    
    Fournissez une analyse complète incluant :
    - Benchmarking de niche : Comparaison avec les leaders du secteur.
    - Tendances de croissance : Analyse de la trajectoire actuelle.
    - Démographie estimée : Âge et genre probables de l'audience.
    - Analyse des sources de trafic détaillée.`,
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
          growth_trends: {
            type: Type.OBJECT,
            properties: {
              subscriber_trend: { type: Type.STRING, description: "Ex: '+15% ce mois-ci'" },
              view_trend: { type: Type.STRING, description: "Ex: 'Stable mais en légère hausse'" },
              trajectory: { type: Type.STRING, description: "Ex: 'Croissance exponentielle'" }
            },
            required: ["subscriber_trend", "view_trend", "trajectory"]
          },
          niche_benchmarking: {
            type: Type.OBJECT,
            properties: {
              competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
              market_position: { type: Type.STRING, description: "Ex: 'Leader de niche', 'Challenger émergent'" },
              competitive_advantage: { type: Type.STRING }
            },
            required: ["competitors", "market_position", "competitive_advantage"]
          },
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
              engagement_rate: { type: Type.STRING },
              estimated_retention: { type: Type.STRING },
              best_content_format: { type: Type.STRING, description: "Ex: 'Shorts éducatifs'" }
            },
            required: ["engagement_rate", "estimated_retention", "best_content_format"]
          },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["monthly_views_estimate", "monthly_revenue_estimate", "channel_authority_score", "primary_traffic_driver", "audience_geography", "growth_trends", "niche_benchmarking", "traffic_sources", "engagement_metrics", "recommendations"]
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
    
    RÉPONDEZ TOUJOURS EN FRANÇAIS.
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
  const cacheKey = `strategy_v4_${channelName}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Agissez en tant que stratège YouTube d'élite mondial (type MrBeast Advisor / Derral Eves). En vous basant sur l'analyse approfondie de la chaîne "${channelName}": ${JSON.stringify(analysis)}, fournissez LA SOLUTION PARFAITE ET SUR-MESURE pour dominer sa niche.
    
    RÉPONDEZ EN FRANÇAIS.
    
    La stratégie doit être une roadmap chirurgicale :
    1. Résumé stratégique : La vision globale pour les 12 prochains mois.
    2. Piliers de contenu : 3 thématiques ou formats spécifiques sur lesquels doubler la mise.
    3. Roadmap en 3 phases : Actions concrètes, mesurables et chronométrées.
    4. Stratégie de monétisation : Comment diversifier les revenus au-delà d'AdSense.
    5. Tactiques de croissance "Hacker" : Astuces psychologiques, collaborations ciblées et optimisation de la rétention.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategy_summary: { type: Type.STRING },
          content_pillars: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 specific content themes to focus on" },
          perfect_roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase_name: { type: Type.STRING },
                objective: { type: Type.STRING },
                action_steps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["phase_name", "objective", "action_steps"]
            }
          },
          monetization_roadmap: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific ways to monetize beyond AdSense" },
          secret_sauce: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Advanced psychological or growth hacking tactics" }
        },
        required: ["strategy_summary", "content_pillars", "perfect_roadmap", "monetization_roadmap", "secret_sauce"]
      }
    }
  });

  const result = safeJsonParse(response.text, {});
  if (result && Object.keys(result).length > 0) setCache(cacheKey, result);
  return result;
}

