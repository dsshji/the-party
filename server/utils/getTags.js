import 'dotenv/config';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// tag artist with genre, subgenre, and vibes/specific atmosphere and mood
export async function tagArtist(artist) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a music classifier. Given an artist name, return ONLY a JSON object with no extra text, no markdown, no backticks.
                        Classify the artist "${artist.name}" and return exactly this structure:
                        { "genre": "<main genre>", "subgenre": "<subgenre>", "vibes": ["<tag1>", "<tag2>", "<tag3>"] }

                        Rules:
                        - genre: one broad yet concrete category (e.g. "korean hip-hop", "mobb rap", "punk rock", "japanese indie electronic", "classical piano")
                        - subgenre: one super specific style (for example "korean blasting underground", "bedroom funk", "horror storytelling rock")
                        - vibes: exactly 3 tags describing energy, mood, or feel (e.g. "japan nostalgia", "moody gaming", "cafe jazz", "hollywood gold age", "dreamy pop", "vampire")
                        - self check yourself with genre and subgenre
                        - return ONLY the JSON object, nothing else`
            }
        ],
        // for more correct and specific classification
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
}


// tag track with genre, subgenre, and vibes/specific atmosphere and mood
export async function tagTrack(track) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a music classifier. Given a track name, return ONLY a JSON object with no extra text, no markdown, no backticks.
                        Classify the track "${track.name}" by "${track.artists[0].name}" and return exactly this structure:
                        { "genre": "<main genre>", "subgenre": "<subgenre>", "vibes": ["<tag1>", "<tag2>"] }

                        Rules:
                        - genre: one broad yet concrete category (e.g. "korean hip-hop", "mobb rap", "punk rock", "indie electronic")
                        - subgenre: one super specific style (for example "korean blasting underground", "bedroom funk", "horror storytelling rock", "weirdo edgy indie")
                        - vibes: exactly 2 tags describing energy, mood, or feel (e.g. "japan nostalgia", "moody gaming", "cafe jazz", "hollywood gold age", "dreamy pop", "vampire")
                        - self check yourself with genre and subgenre
                        - return ONLY the JSON object, nothing else`
            }
        ],
        // for more correct and specific classification
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
}