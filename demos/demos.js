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

let sequencerNodes = [];

function buildSequencer() {
  // I'm sorry.
  for (let i=0; i<40; i++) {
    $('#checkbox-grid').append(`<li class="centered" id="li${i}"><input type="checkbox" name="box${i}" id="box${i}" /></li>`);
  }
  let gain = audioContext.createGain();
  gain.gain.value = 0.3;
  gain.connect(audioContext.destination);
  const lookup = ['6','5','4','2','1'];
  for (let i=0; i<5; i++) {
    const osc = audioContext.createOscillator();
    const localGain = audioContext.createGain();
    localGain.gain.value = 0;
    localGain.connect(gain);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitchMap[lookup[i]], audioContext.currentTime);
    osc.connect(localGain);
    osc.start();
    sequencerNodes[i] = {osc, localGain};
  }
  if (audioContext.state == 'suspended') {
    audioContext.resume();
  }
  setInterval(nextPos, 200);
}

function stopSequencer() {
  for (let i=0; i<5; i++) {
    sequencerNodes[i].osc.stop();
  }
}

let pos = 7; // 0-7, which row is playing/highlighted.

function getLisFromOffset(off) {
  while (off < 0) off += 8;
  let nums = [];
  for (let i=0; i<5; i++) nums = nums.concat((i*8)+off);
  return nums.map((num) => {
    return $('#li'+num);
  });
}

function getChecksFromOffset(off) {
  while (off < 0) off += 8;
  let nums = [];
  for (let i=0; i<5; i++) nums = nums.concat((i*8)+off);
  return nums.map((num) => {
    return $('#box'+num)[0];
  });
}

function getNeighbours(num) {
  // Get the neighbours in our grid, the most painful operation.
  let neighbours = [];
  if (num - 8 >= 0) neighbours.push(num-8);
  if (num + 8 < 40) neighbours.push(num+8);
  if (num % 8 != 0) {
    neighbours.push(num-1);
    if (num - 9 >= 0) neighbours.push(num-9);
    if (num + 7 < 40) neighbours.push(num+7);
  }
  if (num % 8 != 7) {
    neighbours.push(num+1);
    if (num - 7 >= 0) neighbours.push(num-7);
    if (num + 9 < 40) neighbours.push(num+9);
  }
  return neighbours;
}

function gameOfLife() {
  // Oh boy here we go.
  let checked = [];
  for (let i=0; i<40; i++) {
    checked[i] = $('#box'+i)[0].checked;
  }
  for (let i=0; i<40; i++) {
    const num = getNeighbours(i).filter((n) => checked[n]).length;
    let result;
    if (checked[i]) {
      // Live rules.
      if (num < 2) {
        result = false;
      } else if (num < 4) {
        result = true;
      } else {
        result = false;
      }
    } else {
      // Dead rules.
      result = num == 3;
    }
    $('#box'+i).prop('checked', result);
  }
}

function highlightNext() {
  pos++;
  if (pos > 7) {
    pos -= 8;
    if ($('#game-of-life')[0].checked) gameOfLife();
  }
  getLisFromOffset(pos-1).map((jqs) => {
    jqs.removeClass('highlighted');
  });
  getLisFromOffset(pos).map((jqs) => {
    jqs.addClass('highlighted');
  })
}

function playAtPos() {
  getChecksFromOffset(pos).map((e, i) => {
    // Check the box value and set the gain accordingly
    sequencerNodes[i].localGain.gain.value = (e.checked) ? 1 : 0;
  });
}

function nextPos() {
  highlightNext();
  playAtPos();
}