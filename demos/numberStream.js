const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const pitchMap = {
  '1': 261.63,
  '2': 293.66,
  '3': 329.63,
  '4': 349.23,
  '5': 392.00,
  '6': 440.00,
  '7': 493.88,
  '8': 523.25
}

function playString(string) {
  // Plays a string of characters based on their input.
  let oscillator = audioContext.createOscillator();
  oscillator.type = 'triangle';
  oscillator.connect(audioContext.destination);

  const timeMulti = 0.25;
  for (let i=0; i<string.length; i++) {
    const time = (timeMulti*i) + audioContext.currentTime;
    if (string[i] in pitchMap) {
      oscillator.frequency.setValueAtTime(pitchMap[string[i]], time);
    }
  }
  oscillator.start();
  oscillator.stop((timeMulti*string.length) + audioContext.currentTime);
}

function streamApplet() {
  if (audioContext.state == 'suspended') {
    audioContext.resume();
  }
  playString($('#number-stream')[0].value);
}