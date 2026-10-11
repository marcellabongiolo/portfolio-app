const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-header nav');

function closeMenu() {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('open', open);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

const ambientButton = document.querySelector('.ambient-toggle');
if (ambientButton) {
  const ambientLabel = ambientButton.querySelector('.ambient-toggle-label');
  let audioContext;
  let masterGain;

  ambientButton.addEventListener('click', async () => {
    const isOn = ambientButton.getAttribute('aria-pressed') === 'true';
    if (!isOn) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        ambientLabel.textContent = 'Audio unavailable';
        ambientButton.disabled = true;
        return;
      }

      try {
        audioContext ??= new AudioContextClass();
        await audioContext.resume();
        if (!masterGain) {
          masterGain = audioContext.createGain();
          masterGain.gain.value = 0;
          masterGain.connect(audioContext.destination);

          [55, 82.41, 110, 164.81, 220].forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const voiceGain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            const panner = audioContext.createStereoPanner ? audioContext.createStereoPanner() : null;
            oscillator.type = index === 1 ? 'triangle' : 'sine';
            oscillator.frequency.value = frequency;
            filter.type = 'lowpass';
            filter.frequency.value = 420;
            voiceGain.gain.value = index === 0 ? 0.18 : 0.12;
            oscillator.connect(filter);
            filter.connect(voiceGain);
            if (panner) {
              panner.pan.value = index % 2 ? 0.45 : -0.45;
              voiceGain.connect(panner);
              panner.connect(masterGain);
              const drift = audioContext.createOscillator();
              const driftDepth = audioContext.createGain();
              drift.frequency.value = 0.06 + index * 0.012;
              driftDepth.gain.value = 0.28;
              drift.connect(driftDepth);
              driftDepth.connect(panner.pan);
              drift.start();
            } else {
              voiceGain.connect(masterGain);
            }
            oscillator.start();
          });
        }
        masterGain.gain.setTargetAtTime(0.11, audioContext.currentTime, 1.6);
        ambientButton.setAttribute('aria-pressed', 'true');
        ambientButton.setAttribute('aria-label', 'Turn space ambience off');
        ambientLabel.textContent = 'Space ambience on';
      } catch (error) {
        ambientLabel.textContent = 'Audio unavailable';
        ambientButton.disabled = true;
      }
    } else {
      masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.5);
      ambientButton.setAttribute('aria-pressed', 'false');
      ambientButton.setAttribute('aria-label', 'Enable ambient space audio');
      ambientLabel.textContent = 'Enable space ambience';
    }
  });
}
