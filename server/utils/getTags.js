import 'dotenv/config';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function tagArtist(artist) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a music classifier. Given an artist name, return ONLY a JSON object with no extra text, no markdown, no backticks.
                        Classify the artist "${artist.name}" and return exactly this structure:
                        { "genre": "<main genre>", "subgenre": "<subgenre>", "vibes": ["<tag1>", "<tag2>", "<tag3>", "<tag4>"] }

                        Rules:
                        - genre: one broad yet concrete category (e.g. "korean hip-hop", "mobb rap", "punk rock", "indie electronic", "classical piano")
                        - subgenre: one super specific style (for example "korean blasting underground", "bedroom funk", "horror storytelling rock")
                        - vibes: exactly 4 tags describing energy, mood, or feel (e.g. "japan nostalgia", "moody gaming", "cafe jazz", "hollywood gold age", "dreamy pop", "vampire")
                        - self check yourself with genre and subgenre
                        - return ONLY the JSON object, nothing else`
            }
        ],
        model: 'llama-3.1-8b-instant',
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
}


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
        model: 'llama-3.1-8b-instant',
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
}