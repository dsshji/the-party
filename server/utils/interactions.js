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
  PARTY_END: 'closing remarks'
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
                Only reference traits, genres, and vibes explicitly listed in the input. Do not invent cultural labels, nationalities, or genre tags not present in the data.
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

// API call for Global Dominant Event
async function dialogueGlobal(entries) {
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
                Author lines: funny self-praise with speaker's vibe based on tags.
                Max 10 words per line. No greetings. Never explain the joke.
                Only reference traits, genres, and vibes explicitly listed in the input. Do not invent cultural labels, nationalities, or genre tags not present in the data.
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

// API call for Party End event
async function dialogueEnd(entries) {
    if (!entries.length) return [];
    const items = entries.map((e, i) =>
        `${i + 1}. Role: ${e.role}, Speaker: ${e.speaker.id} (${e.speaker.subgenre}, vibes: ${e.speaker.vibes.join(', ')}) | Other guests' genres: ${e.othersSubgenres} | Write a closing remark from ${e.speaker.id}'s perspective on how the party went.`
    ).join('\n');
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You write closing remarks for characters leaving a music party.
                If the role is 'dominant' then closing remark is exactly 3 short connected phrases separated by "...". They should build on each other — like one slow, deadpan thought trailing off.
                If the role is 'breaker' then closing remark is exactly 1 short phrase contradicting the closing remark by 'dominant'.
                The speaker reflects on the party: the music, the crowd, or something everyone had in common despite their differences.
                Style: Tomodachi Life — robotic, dry, deadpan, occasionally absurd. Never warm or enthusiastic.
                Max 6 words per phrase. No goodbyes or greetings. Never explain the joke.
                Only reference traits and vibes explicitly listed in the input. Do not invent cultural labels or genre tags not in the data.
                Return ONLY a JSON object: { "lines": ["<3-phrase remark for entry 1>", ...] } — one string per numbered entry, in order.`
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


// ========================= ARRIVAL ==============================
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

// =================== TRACK_PLAY ======================================
export function generateTrackPlaySequence(artists, relArtists, track) {
    let sequence = [];
    for (const art of artists) {
        let rel = "";
        if (art.id === track.artist_id) rel = "author";
        else rel = getRelationship(art.id, track.artist_id, relArtists);
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
    const track_name = track.name;
    return {
        track_name,
        dialogues: entries.map((e, i) => ({ speaker: e.event.speaker, line: lines[i] }))
    };
}

let artistDominantID = '';
// =================== ARTIST_DOMINANT ========================
export function generateArtistDominantSequence(guesltList_artists, relArtists, guestList_tracks) {
    let sequence = [];

    const counts = {};
    for (const t of guestList_tracks) {
        counts[t.artist_id] = (counts[t.artist_id] || 0) + 1;
    }

    const maxCount = Math.max(...Object.values(counts));
    // artists.find returns the earliest in the guest list among ties
    const dominantId = guesltList_artists.find(a => counts[a.id] === maxCount)?.id;
    artistDominantID = dominantId;
    if (!dominantId) return sequence;

    let reacted = [];
    for (const art of guesltList_artists) {
        const rel = getRelationship(art.id, dominantId, relArtists);
        if (!reacted.includes(rel) && rel == 'ally' || rel == 'opposite') {
            sequence.push({ type: 'ARTIST_DOMINANT', speaker: art.id, target_artist: dominantId, relationship: rel });
            reacted.push(rel);
        }
    }
    return sequence;
}

export async function artistDominant(sequence, guestList_artists, relArtists) {
    const entries = sequence.map(event => {
        const speaker = guestList_artists.find(a => a.id === event.speaker);
        const target = guestList_artists.find(a => a.id === event.target_artist);
        const relationshipData = relArtists.allies.find(
            p => (p.a === event.speaker && p.b === event.target_artist) || (p.a === event.target_artist && p.b === event.speaker)
        ) || relArtists.opposites.find(
            p => (p.a === event.speaker && p.b === event.target_artist) || (p.a === event.target_artist && p.b === event.speaker)
        );
        return { event, speaker, target, reason: relationshipData?.reason || '', target_type: 'artist' };
    });
    const lines = await dialogueBatch(entries);
    return entries.map((e, i) => ({ speaker: e.event.speaker, line: lines[i] }));
}

// =================== PARTY_END ========================
export async function partyEnd(guestList_artists, relArtists) {
    // prefer the first opposite of the dominant artist; fallback to last guest
    let speakerDominant = guestList_artists.find(a => a.id === artistDominantID);
    let speakerArtist = guestList_artists.find(a =>
        relArtists.opposites.some(
            p => (p.a === artistDominantID && p.b === a.id) || (p.a === a.id && p.b === artistDominantID)
        )
    ) ?? guestList_artists[guestList_artists.length - 1];

    const dominantOthersSubgenres = guestList_artists.filter(a => a.id !== speakerDominant.id).map(a => a.subgenre).join(' - ');
    const entries = [
        { event: { type: 'PARTY_END' }, speaker: speakerDominant, role: 'dominant', othersSubgenres: dominantOthersSubgenres },
        { event: { type: 'PARTY_END' }, speaker: speakerArtist, role: 'breaker', othersSubgenres: speakerDominant.subgenre }
    ];
    const lines = await dialogueEnd(entries);
    return { dialogues: entries.map((e, i) => ({ speaker: e.speaker.id, line: lines[i] })) };
}
