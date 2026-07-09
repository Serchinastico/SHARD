export type PartialNowPlaying = Pick<
  NowPlayingPayload["payload"],
  "album" | "artist" | "artworkData" | "playing" | "title"
>;

export type NowPlayingPayload = {
  type: "data";
  diff: boolean;
  payload: Partial<{
    playbackRate: number;
    album: string;
    elapsedTime: number;
    timestamp: string; // '2026-07-08T17:40:55Z'
    bundleIdentifier: string; // 'com.tidal.desktop'
    processIdentifier: number;
    title: string;
    artworkMimeType: string; // 'image/jpeg'
    duration: number; // 280.307,
    artist: string;
    contentItemIdentifier: string;
    playing: boolean;
    artworkData: string;
  }>;
};
