// dom.js
import logoImg from './images/logo.png';
import scrollBgImg from './images/pirateScroll.png';
import startBtnImg from './images/start_btn.png';
import player1ImgFile from './images/player1.png';
import player2ImgFile from './images/player2.png';

import battleSong from './sfx/battleSong.mp3';
import hitSoundFile from './sfx/hitSound.mp3';
import missSoundFile from './sfx/missSound.mp3';

// --- Audio elements (exported directly for Option 1) ---
export const battleMusic = new Audio(battleSong);
export const hitSound = new Audio(hitSoundFile);
export const missSound = new Audio(missSoundFile);

// --- Getter functions for DOM elements ---
export const getLogo = () => document.getElementById('logo');
export const getScrollBg = () => document.getElementById('scroll-bg');
export const getStartBtn = () => document.getElementById('start-btn');

// Player 1 images
export const getPlayer1SetupImg = () => document.getElementById('player1-img-setup');
export const getPlayer1BattleImg = () => document.getElementById('player1-img-battle');

export const getPlayer2Img = () => document.getElementById('player2-img');
export const getPlayerNameInput = () => document.getElementById('player-name');

export const getIntroScreen = () => document.getElementById('intro-screen');
export const getSetupScreen = () => document.getElementById('setup-screen');
export const getBattleScreen = () => document.getElementById('battle-screen');

export const getPlayerGridContainer = () => document.getElementById('player-grid');
export const getBattlePlayerGridContainer = () => document.getElementById('player-grid-battle');
export const getEnemyGridContainer = () => document.getElementById('enemy-grid');

export const getOrientationBtn = () => document.getElementById('orientation-btn');
export const getConfirmBtn = () => document.getElementById('confirm-btn');
export const getResetBtn = () => document.getElementById('reset-btn');
export const getControls = () => document.getElementById('controls');

// --- Initialize images once DOM is ready ---
document.addEventListener('DOMContentLoaded', () => {
  const logo = getLogo();
  const scrollBg = getScrollBg();
  const player1SetupImg = getPlayer1SetupImg();
  const player1BattleImg = getPlayer1BattleImg();
  const player2Img = getPlayer2Img();
  const startBtn = getStartBtn();

  if (logo) logo.src = logoImg;
  if (scrollBg) scrollBg.src = scrollBgImg;

  if (player1SetupImg) player1SetupImg.src = player1ImgFile;
  if (player1BattleImg) player1BattleImg.src = player1ImgFile;

  if (player2Img) player2Img.src = player2ImgFile;

  if (startBtn) {
    startBtn.style.backgroundImage = `url(${startBtnImg})`;
    startBtn.setAttribute('aria-label', 'Start Game');
    startBtn.disabled = true;
  }
});
