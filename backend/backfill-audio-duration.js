require('dotenv').config({ path: __dirname + '/.env' });
const { Test } = require('./db').models;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

// Helper function to get audio duration
async function getAudioDuration(audioPath) {
  try {
    const fullPath = path.join(process.env.AUDIO_STORAGE_PATH, path.basename(audioPath));
    const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=nw=1 "${fullPath}"`);
    const duration = parseFloat(stdout);
    return isNaN(duration) ? null : Math.round(duration);
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return null;
  }
}

async function backfillAudioDurations() {
  try {
    const tests = await Test.findAll();
    console.log(`Found ${tests.length} tests to process.`);
    
    for (const test of tests) {
      if (test.audioDuration === null && test.audioPath) {
        console.log(`Processing test ${test.id}: ${test.name}`);
        const audioDuration = await getAudioDuration(test.audioPath);
        if (audioDuration !== null) {
          test.audioDuration = audioDuration;
          await test.save();
          console.log(`Updated test ${test.id} with audio duration: ${audioDuration}s`);
        } else {
          console.log(`Failed to get audio duration for test ${test.id}`);
        }
      } else {
        console.log(`Skipping test ${test.id} (already has audioDuration or no audioPath)`);
      }
    }
    
    console.log('Backfill process completed.');
  } catch (error) {
    console.error('Error during backfill process:', error);
  }
}

backfillAudioDurations();
