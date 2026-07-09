import { connect } from "@nats-io/transport-node";
import { spawn } from "node:child_process";
import process from "node:process";
import { createInterface } from "node:readline";
import type { PartialNowPlaying, NowPlayingPayload } from "./types.js";
import { createStableWatcher, pick } from "./utils.js";

const isNowPlayingPayloadComplete = (nowPlaying: PartialNowPlaying): boolean =>
  !!nowPlaying.album &&
  !!nowPlaying.artist &&
  !!nowPlaying.artworkData &&
  !!nowPlaying.playing &&
  !!nowPlaying.title;

const isSameNowPlayingSong = (
  nowPlaying: PartialNowPlaying,
  otherNowPlaying: PartialNowPlaying,
): boolean =>
  nowPlaying.title === otherNowPlaying.title && nowPlaying.artist === otherNowPlaying.artist;

const main = async () => {
  const natsUrl = process.env["NATS_URL"];

  if (!natsUrl) {
    console.error("Unable to find $NATS_URL env. var.");
    process.exit(-1);
  }

  const nc = await connect({ servers: natsUrl });
  const child = spawn("media-control", ["stream"], { stdio: ["ignore", "pipe", "inherit"] });

  const rl = createInterface({ input: child.stdout });

  var prevNowPlaying: PartialNowPlaying = {};
  var nowPlaying: PartialNowPlaying = {};
  const startPlayingWatcher = createStableWatcher({ delayMs: 1000 });
  const stopPlayingWatcher = createStableWatcher({ delayMs: 1000 });

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const data = JSON.parse(line) as NowPlayingPayload;

      const newNowPlaying = pick(
        data.payload,
        ["album", "artist", "artworkData", "playing", "title"],
        { discardNullables: true },
      );

      Object.assign(nowPlaying, newNowPlaying);

      startPlayingWatcher.watch(
        isNowPlayingPayloadComplete(nowPlaying) && nowPlaying.playing === true,
        () => {
          if (!isSameNowPlayingSong(prevNowPlaying, nowPlaying)) {
            nc.publish("now-playing.start", JSON.stringify(nowPlaying));
            prevNowPlaying = { ...nowPlaying };
          }
        },
      );

      stopPlayingWatcher.watch(nowPlaying.playing === false, () => {
        nc.publish("now-playing.stop");
        prevNowPlaying = {};
      });
    } catch (e) {
      console.error("parse error:", line, e);
    }
  }

  await nc.drain();
};

await main();
