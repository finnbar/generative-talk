const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

/* Stream Applet */

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

function playString(string, gainval) {
  // Plays a string of characters based on their input.
  let gain = audioContext.createGain();
  gain.gain.value = gainval;
  gain.connect(audioContext.destination)
  let oscillator = audioContext.createOscillator();
  oscillator.type = 'triangle';
  oscillator.connect(gain);

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
  playString($('#number-stream')[0].value, $('#number-stream-gain')[0].value);
}

/* Sequencer Applet */

function buildSequencer() {
  // I'm sorry.
  for (let i=0; i<25; i++) {
    $('#checkbox-grid').append(`<li class="centered" id="li${i}"><input type="checkbox" name="box${i}" id="box${i}" /></li>`);
  }
  if (audioContext.state == 'suspended') {
    audioContext.resume();
  }
}

let pos = 0; // 0-4, which row is playing/highlighted.

function getLisFromOffset(off) {
  while (off < 0) off += 5;
  let nums = [];
  for (let i=0; i<5; i++) nums = nums.concat((i*5)+off);
  return nums.map((num) => {
    return $('#li'+num)
  });
}

function highlightNext() {
  pos++;
  if (pos > 4) pos -= 5;
  getLisFromOffset(pos-1).map((jqs) => {
    jqs.removeClass('highlighted');
  });
  getLisFromOffset(pos).map((jqs) => {
    jqs.addClass('highlighted');
  })
}