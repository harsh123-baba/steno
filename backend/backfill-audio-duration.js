require('dotenv').config({ path: __dirname + '/.env' });
const { Test } = require('./db').models;
const ffmpeg = require('fluent-ffmpeg');

// Helper function to get audio duration
async function getAudioDuration(filePath) {
  try {
    // Try with music-metadata first
    const mm = await import('music-metadata');
    const metadata = await mm.parseFile(filePath);
    if (metadata.format.duration) {
      return Math.round(metadata.format.duration);
    }
  } catch (err) {
    console.warn('music-metadata failed:', err.message);
  }

  // Fallback to ffprobe
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('ffprobe error:', err.message);
        resolve(null);
        return;
      }
      if (metadata.format && metadata.format.duration) {
        resolve(Math.round(metadata.format.duration));
      } else {
        resolve(null);
      }
    });
  });
}

async function backfillAudioDurations() {
  try {
    const tests = await Test.findAll();
    console.log(`Found ${tests.length} tests to process.`);
    
    let updatedCount = 0;
    for (const test of tests) {
      if (test.audioDuration === null && test.audioPath) {
        console.log(`Processing test ${test.id}: ${test.name}`);
        const audioDuration = await getAudioDuration(test.audioPath);
        if (audioDuration !== null) {
          test.audioDuration = audioDuration;
          await test.save();
          console.log(`Updated test ${test.id} with audio duration: ${audioDuration}s`);
          updatedCount++;
        } else {
          console.log(`Failed to get audio duration for test ${test.id}`);
        }
      } else {
        console.log(`Skipping test ${test.id} (already has audioDuration or no audioPath)`);
      }
    }
    
    console.log(`Backfill process completed. Updated ${updatedCount} tests.`);
  } catch (error) {
    console.error('Error during backfill process:', error);
  }
}

(async () => {
  await backfillAudioDurations();
})();
