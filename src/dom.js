// dom.js
// Handles DOM element references, initial styling, and audio setup

// Import assets
import logoImg from './images/logo.png';
import scrollBgImg from './images/pirateScroll.png';
import startBtnImg from './images/start_btn.png';
import player1Img from './images/player1.png';
import player2Img from './images/player2.png';

import battleSong from './sfx/battleSong.mp3';
import hitSoundFile from './sfx/hitSound.mp3';
import missSoundFile from './sfx/missSound.mp3';

// DOM Elements
const logo = document.getElementById('logo');
const scrollBg = document.getElementById('scroll-bg');
const startBtn = document.getElementById('start-btn');
const player1ImgEl = document.getElementById('player1-img');
const player2ImgEl = document.getElementById('player2-img');
const playerNameInput = document.getElementById('player-name');
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const playerGridContainer = document.getElementById('player-grid');
const enemyGridContainer = document.getElementById('enemy-grid');
const battleMusic = document.getElementById('battle-music');

// Attach images
logo.src = logoImg;
scrollBg.src = scrollBgImg;
player1ImgEl.src = player1Img;
player2ImgEl.src = player2Img;

// Set start button image only
startBtn.style.backgroundImage = `url(${startBtnImg})`;
startBtn.setAttribute('aria-label', 'Start Game');
startBtn.disabled = true;

// Audio setup
battleMusic.src = battleSong;
const hitSound = new Audio(hitSoundFile);
const missSound = new Audio(missSoundFile);

export {
  logo,
  scrollBg,
  startBtn,
  player1ImgEl,
  player2ImgEl,
  playerNameInput,
  introScreen,
  gameScreen,
  playerGridContainer,
  enemyGridContainer,
  battleMusic,
  hitSound,
  missSound
};