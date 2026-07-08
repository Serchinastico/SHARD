from pymicro_wakeword import MicroWakeWord, MicroWakeWordFeatures, Model
import sounddevice as sd

mww = MicroWakeWord.from_config("resources/shard.json")
mww_features = MicroWakeWordFeatures()

stream = sd.InputStream(samplerate=16000, channels=1, dtype="int16")
stream.start()

while True:
    audio, _ = stream.read(160)
    for features in mww_features.process_streaming(audio.tobytes()):
        if mww.process_streaming(features):
            print("Detected!")
