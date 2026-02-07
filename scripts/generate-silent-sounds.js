/**
 * Creates 3-second silent WAV files in public/sounds/.
 * Replace with real sound effects (MP3/WAV) as needed.
 */
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "sounds");

const SAMPLE_RATE = 44100;
const DURATION_SEC = 3;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;
const BLOCK_ALIGN = CHANNELS * BYTES_PER_SAMPLE;
const BYTE_RATE = SAMPLE_RATE * BLOCK_ALIGN;
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SEC * CHANNELS;
const DATA_SIZE = NUM_SAMPLES * BYTES_PER_SAMPLE;

/** Build a 3-second silent PCM WAV (44.1 kHz, mono, 16-bit). */
function buildSilentWav() {
  const dataChunkSize = 4 + 4 + DATA_SIZE; // "data" + size + payload
  const fmtChunkSize = 4 + 4 + 16; // "fmt " + size + PCM format
  const riffContentSize = 4 + fmtChunkSize + dataChunkSize; // "WAVE" + fmt + data
  const totalSize = 4 + 4 + riffContentSize; // "RIFF" + size + content

  const buf = Buffer.alloc(44 + DATA_SIZE);
  let off = 0;

  // RIFF header
  buf.write("RIFF", off); off += 4;
  buf.writeUInt32LE(riffContentSize, off); off += 4;
  buf.write("WAVE", off); off += 4;

  // fmt chunk
  buf.write("fmt ", off); off += 4;
  buf.writeUInt32LE(16, off); off += 4;
  buf.writeUInt16LE(1, off); off += 2;   // PCM
  buf.writeUInt16LE(CHANNELS, off); off += 2;
  buf.writeUInt32LE(SAMPLE_RATE, off); off += 4;
  buf.writeUInt32LE(BYTE_RATE, off); off += 4;
  buf.writeUInt16LE(BLOCK_ALIGN, off); off += 2;
  buf.writeUInt16LE(BITS_PER_SAMPLE, off); off += 2;

  // data chunk (samples = 0 for silence)
  buf.write("data", off); off += 4;
  buf.writeUInt32LE(DATA_SIZE, off); off += 4;
  // rest is already zero-filled by Buffer.alloc

  return buf;
}

const SOUND_IDS = [
  "plant",
  "harvest",
  "buy",
  "sell",
  "water",
  "weed",
  "fertilize",
  "expand",
];

const wavBuffer = buildSilentWav();

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

for (const id of SOUND_IDS) {
  const path = join(OUT_DIR, `${id}.wav`);
  writeFileSync(path, wavBuffer);
  console.log(`Written ${path} (${DURATION_SEC}s silent)`);
}

console.log("Done. Replace with real sound files if desired.");
