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
  ARRIVAL: 'speaker arrives at the party',
  TRACK_PLAYS: 'a track is now playing, speaker reacts to it',
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

// batch all dialogue lines into one API call instead of one per line
async function dialogueBatch(entries) {
    if (!entries.length) return [];
    const items = entries.map((e, i) => {
        const targetLabel = e.target_type === 'track' ? `song "${e.target.name}"` : e.target.id;
        return `${i + 1}. Speaker: ${e.speaker.id} (${e.speaker.subgenre}, vibes: ${e.speaker.vibes.join(', ')}) | Target: ${targetLabel} (vibes: ${e.target.vibes.join(', ')}, ${e.target_type}) | Relationship: ${e.event.relationship} | Context: ${e.reason} | Write one line from ${e.speaker.id}'s perspective about or toward ${targetLabel}.`;
    }).join('\n');
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You write short dialogue lines for characters at a music party.
Style: Tomodachi Life — robotic, dry, deadpan, occasionally absurd. Never warm or enthusiastic.
Ally lines: dry and slightly backhanded. Approval expressed reluctantly.
Max 10 words per line. No greetings. Never explain the joke.
Make it appropriate for the speaker and the target of speaking based on passed values.
Return ONLY a JSON object: { "lines": ["<line1>", "<line2>", ...] } — one string per numbered entry, in order.`
            },
            {
                role: 'user',
                content: `Event: ${entries[0].event.type} — ${EVENT_TYPES[entries[0].event.type]}\n\n${items}`
            }
        ],
        model: 'llama-3.1-8b-instant',
        response_format: { type: 'json_object' },
    });
    return JSON.parse(chatCompletion.choices[0].message.content).lines;
}

export async function getArrivalScript(sequence, guestList_artists, relArtists) {
    const events = sequence.filter(e => e.target);
    const entries = events.map(event => {
        const speaker = guestList_artists.find(a => a.id === event.speaker);
        const target = guestList_artists.find(a => a.id === event.target);
        const relationshipData = relArtists.allies.find(
            p => (p.a === event.speaker && p.b === event.target) || (p.a === event.target && p.b === event.speaker)
        ) || relArtists.opposites.find(
            p => (p.a === event.speaker && p.b === event.target) || (p.a === event.target && p.b === event.speaker)
        );
        return { event, speaker, target, reason: relationshipData?.reason || '', target_type: 'artist' };
    });
    const lines = await dialogueBatch(entries);
    return entries.map((e, i) => ({ speaker: e.event.speaker, line: lines[i], relationship: e.event.relationship }));
}

export function generateTrackPlaySequence(artists, relArtists, track) {
    let sequence = [];
    for (const art of artists) {
        const rel = getRelationship(art.id, track.artist_id, relArtists);
        sequence.push({ type: 'TRACK_PLAYS', speaker: art.id, target_artist: track.artist_id, relationship: rel });
    }
    return sequence;
}

export async function trackReaction(sequence, guestList_artists, relArtists, track) {
    const entries = sequence.map(event => {
        const speaker = guestList_artists.find(a => a.id === event.speaker);
        const relationshipData = relArtists.allies.find(
            p => (p.a === event.speaker && p.b === event.target_artist) || (p.a === event.target_artist && p.b === event.speaker)
        ) || relArtists.opposites.find(
            p => (p.a === event.speaker && p.b === event.target_artist) || (p.a === event.target_artist && p.b === event.speaker)
        );
        return { event, speaker, target: track, reason: relationshipData?.reason || '', target_type: 'track' };
    });
    const lines = await dialogueBatch(entries);
    return {
        track,
        dialogues: entries.map((e, i) => ({ speaker: e.event.speaker, line: lines[i] }))
    };
}