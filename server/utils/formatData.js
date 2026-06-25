import { tagArtist, tagTrack } from './getTags.js';

export async function formatArtist(raw) {
  const tags = await tagArtist(raw);
  return { id: raw.id, name: raw.name, image: raw.images[0].url, genre: tags.genre, subgenre: tags.subgenre, vibes: tags.vibes }
}
export async function formatTrack(raw) {
    const tags = await tagTrack(raw);
    return {id: raw.id, release_date: raw.album.release_date, image: raw.album.images[0].url, artist: raw.artists[0].name, artist_id: raw.artists[0].id, name: raw.name, genre: tags.genre, subgenre: tags.subgenre, vibes: tags.vibes};
}