import 'dotenv/config';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// map relationship of items to each other based off its genre, subgenre, and vibe tags
export async function guestMap(items) {
    const roster = items.map(i => ({ id: i.id, name: i.name, genre: i.genre, subgenre: i.subgenre, vibes: i.vibes }));
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a music expert and social dynamics analyst. 
                Given a list of items (artists or tracks) with their genres and vibes, analyze their relationships.
                Consider real-world genre compatibility, sound and artists' style, cultural context, and vibe clash — not just surface-level genre matching.
                All passed items must be mentioned at least once either in allies, opposites, or outliers. If the item has a pair in opposites or allies, it can't be an outlier. There can be no outlier, in this case pass 'unknown' as id. 
                There can be multiple pairs of allies and opposites. One item can be mentioned multiple times.
                Reasoning should be specific and unique for the pair of items. It must not be generic but must describe speciffically this pair of items.
                Return ONLY a JSON object, no markdown, no extra text.
                Return exactly: { "allies": [{ "a": "<id>", "b": "<id>", "reason": "<short reason>" }], "opposites": [{ "a": "<id>", "b": "<id>", "reason": "<short reason>" }], "outliers": [{"id": "<id>", "reason": "<short reason>"}] }`
            },
            {
                role: 'user',
                content: `Analyze relationships between these items: ${JSON.stringify(roster)}`
            }
        ],
        // for proper reasoning: if too slow, can be changed in future dev !
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
    });
    return JSON.parse(chatCompletion.choices[0].message.content);
}