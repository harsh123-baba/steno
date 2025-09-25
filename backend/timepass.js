// (async () => {
//   const mm = await import('music-metadata');

//   async function getDuration(filePath) {
//     try {
//       const metadata = await mm.parseFile(filePath);
//       console.log(`Duration: ${metadata.format.duration.toFixed(2)} seconds`);
//     } catch (err) {
//       console.error('Error reading metadata:', err.message);
//     }
//   }

//   getDuration('/home/ubuntu/audio-files/1758439841075-615983763-20250921125055.aac');
// })();
// (async () => {
//   const mm = await import('music-metadata');

//   async function getDuration(filePath) {
//     try {
//       const metadata = await mm.parseFile(filePath);
//       if (metadata.format.duration) {
//         console.log(`Duration: ${metadata.format.duration.toFixed(2)} seconds`);
//       } else {
//         console.log("Duration could not be determined from metadata.");
//       }
//     } catch (err) {
//       console.error('Error reading metadata:', err.message);
//     }
//   }

//   getDuration('/home/ubuntu/audio-files/1758439841075-615983763-20250921125055.aac');
// })();


import('music-metadata').then(mm => {
  const ffmpeg = require('fluent-ffmpeg');

  async function getDuration(filePath) {
    try {
      const metadata = await mm.parseFile(filePath);
      if (metadata.format.duration) {
        console.log(`Duration: ${metadata.format.duration.toFixed(2)} seconds`);
        return;
      }
    } catch (err) {
      console.warn('music-metadata failed:', err.message);
    }

    // fallback to ffprobe
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('ffprobe error:', err.message);
        return;
      }
      if (metadata.format && metadata.format.duration) {
        console.log(`Duration (ffprobe): ${metadata.format.duration.toFixed(2)} seconds`);
      } else {
        console.log('Duration could not be determined.');
      }
    });
  }

  getDuration('/home/ubuntu/audio-files/1758439841075-615983763-20250921125055.aac');
});
