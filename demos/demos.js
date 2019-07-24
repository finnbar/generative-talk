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
let loop;

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
  loop = setInterval(nextPos, 200);
}

function stopSequencer() {
  for (let i=0; i<5; i++) {
    sequencerNodes[i].osc.stop();
  }
  clearInterval(loop);
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

function getXY(num) {
  const x = num % 8;
  const y = Math.floor(num / 8);
  return [x,y];
}

function getIndex(x,y) {
  if (y < 0) y += 5;
  if (y > 4) y -= 5;
  if (x < 0) x += 8;
  if (x > 7) x -= 8;
  return (y*8)+x;
}

function getNeighbours(num) {
  // Get the neighbours in our grid, the most painful operation.
  let neighbours = [];
  let [x,y] = getXY(num);
  for (let i=-1; i<=1; i++) {
    for (let j=-1; j<=1; j++) {
      if (i != 0 || j != 0) {
        neighbours.push(getIndex(x+i,y+j));
      }
    }
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