const mm = require("music-metadata");
const fs = require("fs");

async function getAudioDuration(filePath) {
  const metadata = await mm.parseFile(filePath);
  return metadata.format.duration; // in seconds
}

// Example usage
(async () => {
  const duration = await getAudioDuration("/home/ubuntu/audio-files/1758442411744-812084632-test 2 legel court.ogg");
  console.log(`Duration: ${duration} seconds`);
})();
