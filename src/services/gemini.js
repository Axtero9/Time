// Gemini AI Service for Time Moves Slow
// Uses the Gemini API key from environment variables (or user input)

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY || "";
const PRIMARY_MODEL = "gemini-3.6-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";

/**
 * Curate memories from an unlocked time capsule box into thematic albums
 * @param {Object} box - Box details (name, duration, members, etc.)
 * @param {Array} mediaItems - Array of media objects { id, type, url, caption, date, author, tags }
 * @returns {Promise<Object>} Curated results with albums and retrospective narrative
 */
export async function curateMemoriesWithGemini(box, mediaItems) {
  if (!mediaItems || mediaItems.length === 0) {
    return {
      retrospective: "This box was opened, but no memories had been sealed inside yet.",
      albums: []
    };
  }

  // Prepare a rich summary of each memory item for the LLM
  const itemsSummary = mediaItems.map((item, index) => {
    return {
      index: index + 1,
      id: item.id,
      type: item.type || "photo",
      caption: item.caption || "Untitled memory",
      date: item.date || item.createdAt || "Unknown date",
      uploadedBy: item.uploadedBy || "Friend",
      tags: item.tags || []
    };
  });

  const promptText = `You are the lead memory curator for "Time Moves Slow", a nostalgic time capsule platform inspired by Notion.
A time capsule box named "${box.name}" (${box.mode === "solo" ? "Solo Capsule" : `Shared by ${box.members.map(m => m.name).join(", ")}`}) has completed its duration and has just been unlocked!

Here are the sealed photos and videos that were kept hidden until today:
${JSON.stringify(itemsSummary, null, 2)}

Your mission:
1. Examine all the items and group them into 2 to 4 distinct, beautifully titled thematic albums / chapters (e.g. "🌅 Golden Hour & Coastal Escapes", "🍕 2 AM Feasts & Laughter", "🏔️ Mountain Summits & Wild Detours").
2. Write a warm, nostalgic narrative for each album (2-3 sentences capturing the emotion of the moment).
3. Assign an emoji for each album.
4. Assign the appropriate media IDs to each album. (Every media item must belong to at least one album!).
5. Select the best media ID from that album to be the 'coverPhotoId'.
6. Write an overarching "retrospectiveStory" (a heartfelt, poetic 2-paragraph reflection on this year/duration and how time moves slow when preserved with care).
7. Suggest a "highlightQuote" for each album.

Return your response in STRICT, VALID JSON format matching this schema:
{
  "retrospectiveStory": "string",
  "albums": [
    {
      "id": "album_1",
      "title": "string (with emoji)",
      "emoji": "string",
      "theme": "string",
      "narrative": "string",
      "highlightQuote": "string",
      "coverPhotoId": "string (one of the media IDs)",
      "mediaIds": ["id1", "id2"]
    }
  ]
}
Do not include any conversational filler outside the JSON. Return only the JSON string.`;

  try {
    const result = await callGeminiAPI(PRIMARY_MODEL, promptText);
    const parsed = parseGeminiJSON(result);
    if (parsed && parsed.albums && parsed.albums.length > 0) {
      return parsed;
    }
    throw new Error("Invalid structure from primary model");
  } catch (err) {
    console.warn("Primary model curation failed, trying fallback:", err);
    try {
      const fallbackResult = await callGeminiAPI(FALLBACK_MODEL, promptText);
      const parsedFallback = parseGeminiJSON(fallbackResult);
      if (parsedFallback && parsedFallback.albums && parsedFallback.albums.length > 0) {
        return parsedFallback;
      }
    } catch (fallbackErr) {
      console.warn("Fallback model also failed, generating local smart curation:", fallbackErr);
    }
    // Return graceful smart local curation
    return generateSmartLocalCuratedAlbums(box, mediaItems);
  }
}

/**
 * Call the Google Generative Language API
 */
async function callGeminiAPI(model, promptText) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      {
        parts: [
          {
            text: promptText
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text candidate returned from Gemini");
  }
  return text;
}

/**
 * Parse JSON safely from Gemini's response (handles markdown code blocks)
 */
function parseGeminiJSON(rawText) {
  try {
    let clean = rawText.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", e, rawText);
    return null;
  }
}

/**
 * Local intelligent curation fallback in case network is disconnected
 */
export function generateSmartLocalCuratedAlbums(box, mediaItems) {
  const count = mediaItems.length;
  const chunk1 = mediaItems.slice(0, Math.ceil(count / 2));
  const chunk2 = mediaItems.slice(Math.ceil(count / 2));

  const album1 = {
    id: "album_sunlit",
    title: "🌅 Sunlit Days & Golden Hours",
    emoji: "🌅",
    theme: "Spontaneous Adventures",
    narrative: `Every single memory in ${box.name} preserves the warmth of moments that felt timeless. Sealed away in this box, these frames remained hidden until the year came full circle.`,
    highlightQuote: "Time moves slow when you're truly present in the moment.",
    coverPhotoId: chunk1[0]?.id || mediaItems[0]?.id,
    mediaIds: chunk1.map(m => m.id)
  };

  const album2 = {
    id: "album_unfiltered",
    title: "✨ Unfiltered Laughter & Quiet Chaos",
    emoji: "✨",
    theme: "Behind the Scenes & Everyday Magic",
    narrative: `The candid glances, late night stories, and inside jokes that made this time capsule come alive. Now unsealed, each moment stands as a monument to shared history.`,
    highlightQuote: "The best memories are the ones you didn't know you were making.",
    coverPhotoId: chunk2[0]?.id || mediaItems[0]?.id,
    mediaIds: chunk2.map(m => m.id)
  };

  return {
    retrospectiveStory: `Opening "${box.name}" is like turning a key in an old locked drawer and discovering an entire world intact. Over this duration, life kept moving forward, but inside this vault, your memories stayed protected, patient, and untouched. Today, as the locks slide open and every photo and video steps back into the light, they remind us why taking time to preserve moments matters so deeply.`,
    albums: chunk2.length > 0 ? [album1, album2] : [album1]
  };
}
