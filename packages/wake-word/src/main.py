import asyncio
import os

import nats
import sounddevice as sd
from pymicro_wakeword import MicroWakeWord, MicroWakeWordFeatures


async def main():
    nc = await nats.connect(os.environ["NATS_URL"])

    mww = MicroWakeWord.from_config("resources/shard.json")
    mww_features = MicroWakeWordFeatures()

    stream = sd.InputStream(samplerate=16000, channels=1, dtype="int16")
    stream.start()

    while True:
        audio, _ = stream.read(160)
        for features in mww_features.process_streaming(audio.tobytes()):
            if mww.process_streaming(features):
                nc.publish("wakeword", "detected")


if __name__ == "__main__":
    asyncio.run(main())
