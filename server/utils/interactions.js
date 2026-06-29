// return the relationship of an item with another item
export function getRelationship(idA, idB, guestMap) {
  const isAlly = guestMap.allies.some(
    pair => (pair.a === idA && pair.b === idB) || (pair.a === idB && pair.b === idA)
  );
  if (isAlly) return 'ally';

  const isOpposite = guestMap.opposites.some(
    pair => (pair.a === idA && pair.b === idB) || (pair.a === idB && pair.b === idA)
  );
  if (isOpposite) return 'opposite';

  if (guestMap.outliers.some(o => o.id === idA || o.id === idB)) return 'outlier';
  
  return 'neutral';
}

const EVENT_TYPES = {
  ARRIVAL: 'character arrives at the party',
  TRACK_PLAYS: 'a track is now playing',
  ARTIST_DOMINANT: 'one artist has too many songs',
  GLOBAL_DOMINANT: 'shared trait discovered across all guests',
  PARTY_END: 'closing remarks'
}


export function generateArrivalSequence(artists, relArt) {
    let sequence = [];
    const interactedPairs = new Set();
    for (let i = 0; i < artists.length; i++) {
        if (i==0) sequence.push({ type: 'ARRIVAL', speaker: artists[i].id, target: null });
        else {
            for (let j = 0; j < i; j++) {
                if (!interactedPairs.has([artists[i].id, artists[j].id].sort().join('-'))) {
                    const rel = getRelationship(artists[i].id, artists[j].id, relArt);
                    if (["outlier", "neutral"].includes(rel)) continue;
                    sequence.push({ type: 'ARRIVAL', speaker: artists[i].id, target: artists[j].id, relationship: rel });
                    sequence.push({ type: 'ARRIVAL', speaker: artists[j].id, target: artists[i].id, relationship: rel });
                    interactedPairs.add([artists[i].id, artists[j].id].sort().join('-'));
                } else continue;
            }            
        }
    }
    return sequence;
}




/*

// interactions calls and mapping
import 'dotenv/config';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export async function dialogue(items) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: ``
            },
            {
                role: 'user',
                content: ``
            }
        ],
        // for proper reasoning: if too slow, can be changed in future dev !
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'string' },
    });
    return chatCompletion.choices[0].message.content;
}

*/