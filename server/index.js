import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import querystring from 'querystring'
import axios from 'axios'
import { randomUUID } from 'crypto'
dotenv.config()

import { formatArtist, formatTrack } from './utils/formatData.js'
import { generateArrivalSequence, getArrivalScript, generateTrackPlaySequence, trackReaction, 
  generateArtistDominantSequence, artistDominant, partyEnd } from './utils/interactions.js'
import { guestMap } from './utils/guestMap.js';

function generateRandomString(length) {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array(length).fill(characters).map(x => x[Math.floor(Math.random() * x.length)]).join('');
}

const sessions = new Map();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://127.0.0.1:8000/callback';
const frontend_uri = 'http://127.0.0.1:5173';
const app = express();
app.use(cors({ origin: frontend_uri, credentials: true }));
app.use(cookieParser());

// middleware
app.use((req, res, next) => {
  let sid = req.cookies?.sid;

  if (!sid || !sessions.has(sid)) {
    sid = randomUUID();
    res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax' });
    sessions.set(sid, { artists: [], tracks: [], token: null, refreshToken: null, lastSeen: Date.now() });
  }

  req.session = sessions.get(sid);
  req.session.lastSeen = Date.now();
  next();
});

const SESSION_TTL = 20 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [sid, session] of sessions) {
    if (now - session.lastSeen > SESSION_TTL) sessions.delete(sid);
  }
}, 5 * 60 * 1000);

app.get('/', (req, res) => res.send('server works'))
app.get('/login', function(req, res) {
  const state = generateRandomString(16);
  const scope = 'user-read-private user-read-email user-top-read';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  });

  res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
});

app.get('/callback', async function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect(frontend_uri + '/login#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
    return;
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
        }
      }
    );

    const { access_token, refresh_token } = response.data;
    //save access_token to use later as a authentication bearer
    req.session.token = access_token;
    req.session.refreshToken = refresh_token;
    res.redirect(frontend_uri + '/login#' +
      querystring.stringify({ access_token, refresh_token }));
  } catch (err) {
    res.redirect(frontend_uri + '/login#' +
      querystring.stringify({ error: 'invalid_token' }));
  }
});

/* test if the token is received correctly: FOR DEBUGGING
app.get('/token-test', (req, res) => {
  res.send(token)
});
*/

async function refreshAccessToken(req) {
  const refresh_token = req.session.refreshToken;
  if (!refresh_token) return null;

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
      }
    }
  );

  req.session.token = response.data.access_token;
  if (response.data.refresh_token) req.session.refreshToken = response.data.refresh_token;
  return req.session.token;
}

//var guestList_artists = [];
//var guestList_tracks = [];

async function getTopArtists(req) {
  const response = await axios.get(
    'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=5',
    { headers: { 'Authorization': `Bearer ${req.session.token}`} }
  );
  const artists = await Promise.all(response.data.items.map(item => formatArtist(item)));
  req.session.artists = artists;
  return req.session.artists;
}

async function getTopTracks(req) {
  const response = await axios.get(
    'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=5',
    { headers: { 'Authorization': `Bearer ${req.session.token}`} }
  );
  const tracks = [];
  for (const item of response.data.items) {
    const formatted = await formatTrack(item);
    tracks.push(formatted);
  }
  req.session.tracks = tracks;
  return req.session.tracks;
}

//var relArtists = [];
async function getArtistRelationship(req) {
  const artists = req.session.artists.length ? req.session.artists : await getTopArtists(req);
  let relArtists = await guestMap(artists);
  // add verification that the lists aren't empty
  while (!relArtists) relArtists = await guestMap(artists);
  return relArtists;
}

async function buildScript(req) {
  // load neccessary data
  const rel = await getArtistRelationship(req);
  if (!req.session.tracks.length) await getTopTracks(req);
  // fetch ARRIVAL
  const sequence = generateArrivalSequence(req.session.artists, rel);
  const script_arrival = await getArrivalScript(sequence, req.session.artists, rel);
  // fetch TRACK_PLAY
  const script_trackPlay = [];
  for (let track of req.session.tracks) {
    const sequence_trackPlay = generateTrackPlaySequence(req.session.artists, rel, track);
    const track_reaction = await trackReaction(sequence_trackPlay, req.session.artists, rel, track);
    script_trackPlay.push(track_reaction);
  }
  // fetch ARTIST_DOMINANT
  const sequence_artistDominant = generateArtistDominantSequence(req.session.artists, rel, req.session.tracks);
  const script_artistDominant = await artistDominant(sequence_artistDominant, req.session.artists, rel);

  // fetch PARTY_END
  const script_partyEnd = await partyEnd(req.session.artists, rel);

  return { ARRIVAL: script_arrival, TRACK_PLAY: script_trackPlay,
    ARTIST_DOMINANT: script_artistDominant, PARTY_END: script_partyEnd };
}

// load script for the whole party
app.get('/script', async function(req, res) {
  if (!req.session.token) {
    return res.status(401).json({ error: 'not_authenticated', message: 'No Spotify session found. Please log in again.' });
  }

  try {
    const script = await buildScript(req)
    res.json({ script, artists: req.session.artists })
  } catch (err) {
    if (err.response?.status !== 401) {
      console.error('Failed to build script:', err.message);
      return res.status(502).json({ error: 'script_generation_failed', message: 'Could not generate the party script. Please try again.' });
    }

    const refreshed = await refreshAccessToken(req).catch(() => null);
    if (!refreshed) {
      return res.status(401).json({ error: 'invalid_token', message: 'Your Spotify session expired. Please log in again.' });
    }

    try {
    const script = await buildScript(req)
    res.json({ script, artists: req.session.artists })
    } catch (retryErr) {
      console.error('Failed to build script after token refresh:', retryErr.message);
      res.status(502).json({ error: 'script_generation_failed', message: 'Could not generate the party script. Please try again.' });
    }
  }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});