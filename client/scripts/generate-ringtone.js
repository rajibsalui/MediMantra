// This script generates a simple ringtone using the Web Audio API
// Run this in a browser console to generate the ringtone

function generateRingtone() {
  // Create an audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create an offline audio context for rendering
  const offlineContext = new OfflineAudioContext(2, 44100 * 4, 44100);
  
  // Create oscillators for the ringtone
  function createOscillator(context, freq, start, duration) {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    
    // Set up envelope
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(0.5, start + 0.05);
    gainNode.gain.setValueAtTime(0.5, start + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, start + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(start);
    oscillator.stop(start + duration);
    
    return oscillator;
  }
  
  // Create a classic ringtone pattern
  const notes = [
    { freq: 880, duration: 0.3 },  // A5
    { freq: 0, duration: 0.1 },    // Pause
    { freq: 880, duration: 0.3 },  // A5
    { freq: 0, duration: 0.3 },    // Pause
    { freq: 880, duration: 0.3 },  // A5
    { freq: 0, duration: 0.1 },    // Pause
    { freq: 880, duration: 0.3 },  // A5
    { freq: 0, duration: 0.3 },    // Pause
    { freq: 784, duration: 0.3 },  // G5
    { freq: 0, duration: 0.1 },    // Pause
    { freq: 784, duration: 0.3 },  // G5
    { freq: 0, duration: 0.3 },    // Pause
    { freq: 784, duration: 0.3 },  // G5
    { freq: 0, duration: 0.1 },    // Pause
    { freq: 784, duration: 0.3 },  // G5
  ];
  
  let time = 0;
  notes.forEach(note => {
    if (note.freq > 0) {
      createOscillator(offlineContext, note.freq, time, note.duration);
    }
    time += note.duration;
  });
  
  // Render the audio
  offlineContext.startRendering().then(renderedBuffer => {
    console.log('Rendering completed successfully');
    
    // Convert the buffer to a WAV file
    const wav = audioBufferToWav(renderedBuffer);
    
    // Create a Blob and download link
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ringtone.wav';
    a.textContent = 'Download Ringtone';
    document.body.appendChild(a);
    
    console.log('Ringtone generated. Click the link to download.');
  }).catch(err => {
    console.error('Rendering failed: ', err);
  });
}

// Function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const out = new ArrayBuffer(44 + length);
  const view = new DataView(out);
  const channels = [];
  let sample;
  let offset = 0;
  let pos = 0;
  
  // Write WAV header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(36 + length);                        // file length - 8
  setUint32(0x45564157);                         // "WAVE"
  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);  // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit
  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length);                             // chunk length
  
  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  while (pos < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
    pos++;
  }
  
  return out;
  
  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  
  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

// Call the function to generate the ringtone
generateRingtone();
