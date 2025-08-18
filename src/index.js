import './styles.css';

// Import images
import logoImg from './images/logo.png';
import scrollBgImg from './images/pirateScroll.png';
import startBtnImg from './images/start_btn.png';
import player1Img from './images/player1.png';
import player2Img from './images/player2.png';
import woodTextureImg from './images/wood_texture.jpg';

// Import audio
import battleSong from './sfx/battleSong.mp3';
import hitSound from './sfx/hitSound.mp3';
import missSound from './sfx/missSound.mp3';

// Set wood background for body
document.body.style.backgroundImage = `url(${woodTextureImg})`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundRepeat = 'no-repeat';

// Attach images
document.getElementById('logo').src = logoImg;
document.getElementById('scroll-bg').src = scrollBgImg;
document.getElementById('player1-img').src = player1Img;
document.getElementById('player2-img').src = player2Img;

// Style the start button
const startBtn = document.getElementById('start-btn');
startBtn.style.backgroundImage = `url(${startBtnImg})`;
startBtn.style.backgroundSize = 'contain';
startBtn.style.backgroundRepeat = 'no-repeat';
startBtn.style.width = '250px';
startBtn.style.height = '120px';
startBtn.setAttribute('aria-label', 'Start Game'); 
startBtn.style.cursor = 'pointer';

// Attach audio
const battleMusic = document.getElementById('battle-music');
document.getElementById('battle-music').src = battleSong;
document.getElementById('hit-sound').src = hitSound;
document.getElementById('miss-sound').src = missSound;

// Get DOM elements
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const logo = document.getElementById('logo');

// Start Game button click handler
startBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert('Please enter your captain name!');
    return;
  }

  // Hide intro, show game
  introScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  // Start background music
  battleMusic.play().catch(err => console.log('Autoplay blocked:', err));

  console.log(`Captain ${playerName} has entered the battle!`);
});

// Logo click handler to return to intro screen
logo.addEventListener('click', () => {
  // Hide game, show intro
  gameScreen.classList.add('hidden');
  introScreen.classList.remove('hidden');

  // Stop and reset music
  battleMusic.pause();
  battleMusic.currentTime = 0;

  // Clear player name input
  playerNameInput.value = '';
});
