// jest.setup.js

class MockAudio {
  play() {}
  pause() {}
  addEventListener() {}
  removeEventListener() {}
  set currentTime(value) {}
}

global.HTMLAudioElement = MockAudio;
