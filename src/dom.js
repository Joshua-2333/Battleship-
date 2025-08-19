// dom.js
// Handles DOM element references, initial styling, and audio setup

// Import assets
import logoImg from './images/logo.png';
import scrollBgImg from './images/pirateScroll.png';
import startBtnImg from './images/start_btn.png';
import player1ImgFile from './images/player1.png';
import player2ImgFile from './images/player2.png';

import battleSong from './sfx/battleSong.mp3';
import hitSoundFile from './sfx/hitSound.mp3';
import missSoundFile from './sfx/missSound.mp3';

// --- DOM references ---
const logo = document.getElementById('logo');
const scrollBg = document.getElementById('scroll-bg');
const startBtn = document.getElementById('start-btn');
const player1Img = document.getElementById('player1-img');
const player2Img = document.getElementById('player2-img');
const playerNameInput = document.getElementById('player-name');

const introScreen = document.getElementById('intro-screen');
const setupScreen = document.getElementById('setup-screen');
const battleScreen = document.getElementById('battle-screen');

const playerGridContainer = document.getElementById('player-grid'); // setup grid
const battlePlayerGridContainer = document.getElementById('player-grid-battle'); // battle grid
const enemyGridContainer = document.getElementById('enemy-grid');

const orientationBtn = document.getElementById('orientation-btn');
const confirmBtn = document.getElementById('confirm-btn');
const resetBtn = document.getElementById('reset-btn');
const controls = document.getElementById('controls');

// --- Attach images ---
logo.src = logoImg;
scrollBg.src = scrollBgImg;
player1Img.src = player1ImgFile;
player2Img.src = player2ImgFile;

// --- Style start button ---
startBtn.style.backgroundImage = `url(${startBtnImg})`;
startBtn.setAttribute('aria-label', 'Start Game');
startBtn.disabled = true; // enabled once name is entered

// --- Audio setup ---
const battleMusic = document.getElementById('battle-music');
battleMusic.src = battleSong;

const hitSound = new Audio(hitSoundFile);
const missSound = new Audio(missSoundFile);

// --- Export all references ---
export {
  logo,
  scrollBg,
  startBtn,
  player1Img,
  player2Img,
  playerNameInput,
  introScreen,
  setupScreen,
  battleScreen,
  playerGridContainer,
  battlePlayerGridContainer,
  enemyGridContainer,
  orientationBtn,
  confirmBtn,
  resetBtn,
  controls,
  battleMusic,
  hitSound,
  missSound
};
