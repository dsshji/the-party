import dotenv from 'dotenv'
import express from 'express'
import querystring from 'querystring'
import axios from 'axios'
dotenv.config()

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

/* test if the token is received correctly
app.get('/token-test', (req, res) => {
  res.send(token)
});
*/

app.get('/top-artists', async function(req, res) {
  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=5',
      { headers: { 'Authorization': `Bearer ${token}`} }
    );
    res.send(response.data);
  } catch (err) {
    res.json(err.response?.data || err.message);
  }
});

app.get('/top-tracks', async function(req, res) {
  var tracks_id = [];
  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10',
      { headers: { 'Authorization': `Bearer ${token}`} }
    );
    for (let i = 0; i < response.data.limit; i++) {
      tracks_id.push(response.data.items[i].id);
    }
    var id_line = tracks_id.join(',');
    //res.send(tracks_id);
    //res.json(response.data);
    const response_track = await axios.get(
      `https://api.spotify.com/v1/audio-features?ids=${id_line}`,
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    res.json(response_track.data);
  } catch (err) {
    res.json(err.response?.data || err.message);
  }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});