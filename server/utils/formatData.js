export function formatArtist(raw) {
  return { id: raw.id, name: raw.name, image: raw.images[0].url }
}
export function formatTrack(raw) {
    return {id: raw.id, release_date: raw.album.release_date, image: raw.album.images[0].url, artist_id: raw.artists[0].id, name: raw.name};
}