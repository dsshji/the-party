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


export function generateArrivalSequence(artists, relArtists) {
    let sequence = [];
    const interactedPairs = new Set();
    for (let i = 0; i < artists.length; i++) {
        if (i==0) sequence.push({ type: 'ARRIVAL', speaker: artists[i].id, target: null });
        else {
            for (let j = 0; j < i; j++) {
                if (!interactedPairs.has([artists[i].id, artists[j].id].sort().join('-'))) {
                    const rel = getRelationship(artists[i].id, artists[j].id, relArtists);
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

// interactions calls and mapping
import 'dotenv/config';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export async function dialogue(event, speaker, target, reason) {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You write one short dialogue line for a character at a music party.
                Style: Tomodachi Life — robotic, dry, deadpan, occasionally absurd. Never warm or enthusiastic. 
                Ally lines should be dry and slightly backhanded, not warm. Approval is expressed reluctantly.
                The line must be max 10 words. No greetings like "hey" or "hi". Never explain the joke.
                Return ONLY valid JSON: { "line": "<dialogue line>" }`
            },
            {
                role: 'user',
                content: `Event: ${event.type}
                The line should be appropriate to this speaker: ${speaker.id}, and their vibes: ${speaker.vibes.join(', ')}, and subgenre: ${speaker.subgenre}
                Target: ${target.id}, vibes: ${target.vibes.join(', ')}
                Relationship: ${event.relationship}
                The line should subtly reference this context without stating it directly: ${reason}
                Write one line from ${speaker.id}'s perspective about or toward ${target.id}.`
            }
        ],
        // for proper reasoning: if too slow, can be changed in future dev !
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
    });
    return JSON.parse(chatCompletion.choices[0].message.content).line;
}

export async function getArrivalScript(sequence, guestList_artists, relArtists) {
    const script = [];
    for (const event of sequence) {
    if (!event.target) continue; // skip the first solo arrival
    const speaker = guestList_artists.find(a => a.id === event.speaker);
    const target = guestList_artists.find(a => a.id === event.target);
    const relationshipData = relArtists.allies.find(
        p => (p.a === event.speaker && p.b === event.target) || (p.a === event.target && p.b === event.speaker)
        ) || relArtists.opposites.find(
        p => (p.a === event.speaker && p.b === event.target) || (p.a === event.target && p.b === event.speaker)
        );
    const reason = relationshipData?.reason || '';
    const line = await dialogue(event, speaker, target, reason);
    script.push({ speaker: event.speaker, line, relationship: event.relationship });
    }
    return script;
}
