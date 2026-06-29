import dotenv from 'dotenv'
import express from 'express'
import querystring from 'querystring'
import axios from 'axios'
dotenv.config()
import { formatArtist, formatTrack } from './utils/formatData.js'
import { generateArrivalSequence } from './utils/interactions.js'
import { guestMap } from './utils/guestMap.js';

function generateRandomString(length) {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array(length).fill(characters).map(x => x[Math.floor(Math.random() * x.length)]).join('');
}

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = 'http://127.0.0.1:8000/callback';
const app = express();

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

// TODO: replace globals with session store for multi-user support 
let token = '';
app.get('/callback', async function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
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
    token = access_token;
    res.redirect('/#' +
      querystring.stringify({ access_token, refresh_token }));
  } catch (err) {
    res.redirect('/#' +
      querystring.stringify({ error: 'invalid_token' }));
  }
});

/* test if the token is received correctly: FOR DEBUGGING
app.get('/token-test', (req, res) => {
  res.send(token)
});
*/

var guestList_artists = [];
var guestList_tracks = [];

async function getTopArtists() {
  const response = await axios.get(
    'https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=5',
    { headers: { 'Authorization': `Bearer ${token}`} }
  );
  const artists = await Promise.all(response.data.items.map(item => formatArtist(item)));
  guestList_artists = artists;
  return guestList_artists;
}

async function getTopTracks() {
  const response = await axios.get(
    'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=8',
    { headers: { 'Authorization': `Bearer ${token}`} }
  );
  const tracks = [];
  for (const item of response.data.items) {
    const formatted = await formatTrack(item);
    tracks.push(formatted);
  }
  guestList_tracks = tracks;
  return guestList_tracks;
}

var relArt = [];
var relTra = [];
app.get('/guests', async function(req, res) {
  try {
    const artists = guestList_artists.length ? guestList_artists : await getTopArtists();
    const tracks = guestList_tracks.length ? guestList_tracks : await getTopTracks();
    const guestsArt = await guestMap(artists);
    const guestsTra = await guestMap(tracks);
    res.json({ artists: guestsArt, tracks: guestsTra });
  } catch (err) {
    res.json(err.response?.data || err.message);
  }
});

// test call to verify sequence returns proper result
app.get('/sequence-test', async function(req, res) {
  const artists = guestList_artists.length ? guestList_artists : await getTopArtists();
  const guestsArt = await guestMap(artists);
  const sequence = generateArrivalSequence(artists, guestsArt);
  res.json(sequence);
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});