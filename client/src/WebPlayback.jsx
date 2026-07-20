import { useState, useEffect } from 'react';

function WebPlayback(props) {
    const [player, setPlayer] = useState(undefined);
    const [deviceID, setID] = useState(null)

    useEffect(() => {
        let player;

        const initPlayer = () => {
            player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => {
                    fetch('http://127.0.0.1:8000/refresh', { credentials: 'include' })
                        .then(res => res.json())
                        .then(data => {
                            sessionStorage.setItem('token', data.access_token);
                            cb(data.access_token);
                        });
                },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                setID(device_id);
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.connect();
        };

        let script = document.getElementById("spotify-player-sdk");
        if (!script) {
            script = document.createElement("script");
            script.id = "spotify-player-sdk";
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);
        }

        if (window.Spotify) {
            initPlayer();
        } else {
            window.onSpotifyWebPlaybackSDKReady = initPlayer;
        }

        return () => {
            player?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!deviceID) return 
        if (!props.track) return
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceID}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [props.track.uri], position_ms: Math.floor(props.track.duration_ms * 0.2) })
        })
    }, [props.track, deviceID])


   return (
      <>
        <div className="container">
           <div className="main-wrapper">

            </div>
        </div>
      </>
    );
}

export default WebPlayback
