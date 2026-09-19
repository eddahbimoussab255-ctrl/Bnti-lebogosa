// Small interactions keep the page feeling like a personal surprise.
const response = document.querySelector('#response');
const floatingHearts = document.querySelector('.floating-hearts');
const soundToggle = document.querySelector('#soundToggle');
const soundLabel = document.querySelector('#soundLabel');
const audioFileInput = document.querySelector('#audioFileInput');
const audioPlayer = document.querySelector('#audioPlayer');
const audioSongName = document.querySelector('#audioSongName');
const audioPlay = document.querySelector('#audioPlay');
const audioProgress = document.querySelector('#audioProgress');
const audioVolume = document.querySelector('#audioVolume');
const audioElement = document.querySelector('#audioElement');
let selectedAudioUrl;
const defaultAudioPath = 'assets/audio/rachida-song.mp4';
let usingDefaultAudio = false;

const messages = {
  hero: 'Rachida, nti l surprise li ma kentch 3aref belli kan7tajha f 7yati ♥',
  laugh: 'Hadi hiya! De7ketek rba7at nhari kamel 😂♥',
  shy: 'Ahaaa, 7chmti! Safi ghadi nskt... ghir daba 😏♥',
  future: 'W3d: ghadi nb9a dima 7dak, f de7k w f s3ib, 7tta l akhir ♥'
};

function showMessage(message) {
  response.textContent = message;
  response.animate([
    { opacity: 0, transform: 'translateY(8px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 420, easing: 'ease-out' });
  createHeartBurst();
}

function createHeartBurst() {
  for (let index = 0; index < 7; index += 1) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = index % 2 ? '♥' : '✦';
    heart.style.left = `${35 + Math.random() * 30}%`;
    heart.style.bottom = '18%';
    heart.style.animationDelay = `${index * 80}ms`;
    heart.style.fontSize = `${0.65 + Math.random() * 0.65}rem`;
    floatingHearts.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  }
}

document.querySelector('#heroSurprise').addEventListener('click', () => showMessage(messages.hero));
document.querySelector('#laughButton').addEventListener('click', () => showMessage(messages.laugh));
document.querySelector('#shyButton').addEventListener('click', () => showMessage(messages.shy));
document.querySelector('#futureButton').addEventListener('click', () => showMessage(messages.future));

soundToggle.addEventListener('click', () => audioFileInput.click());

audioElement.volume = Number(audioVolume.value);
audioElement.addEventListener('error', () => {
  if (usingDefaultAudio) {
    audioPlayer.classList.remove('is-visible');
    audioPlayer.setAttribute('aria-hidden', 'true');
    audioSongName.textContent = 'Ma kayna 7ta aghniya';
  }
});

async function loadBundledAudio() {
  try {
    const audioResponse = await fetch(defaultAudioPath);
    if (!audioResponse.ok) throw new Error('Audio ma t9rach');
    const audioBlob = await audioResponse.blob();
    selectedAudioUrl = URL.createObjectURL(audioBlob);
    usingDefaultAudio = true;
    audioElement.src = selectedAudioUrl;
    audioElement.volume = Number(audioVolume.value);
    audioSongName.textContent = 'Lmousi9a dyal Rachida';
    audioPlayer.classList.add('is-visible');
    audioPlayer.setAttribute('aria-hidden', 'false');
    soundToggle.setAttribute('aria-pressed', 'true');
  } catch {
    audioPlayer.classList.remove('is-visible');
    audioPlayer.setAttribute('aria-hidden', 'true');
  }
}

loadBundledAudio();

audioFileInput.addEventListener('change', () => {
  const [file] = audioFileInput.files;
  const isAudioFile = file && (file.type.startsWith('audio/') || /\.(mp3|mpeg|mp4|m4a|wav|ogg|webm)$/i.test(file.name));
  if (!isAudioFile) return;
  if (selectedAudioUrl) URL.revokeObjectURL(selectedAudioUrl);
  usingDefaultAudio = false;
  selectedAudioUrl = URL.createObjectURL(file);
  audioElement.src = selectedAudioUrl;
  audioElement.volume = Number(audioVolume.value);
  audioSongName.textContent = file.name;
  audioPlayer.classList.add('is-visible');
  audioPlayer.setAttribute('aria-hidden', 'false');
  soundToggle.setAttribute('aria-pressed', 'true');
  soundLabel.textContent = 'Lmousi9a wajda';
  audioPlay.textContent = '▶';
  audioProgress.value = '0';
});

audioPlay.addEventListener('click', async () => {
  if (!audioElement.src) return;
  if (audioElement.paused) {
    await audioElement.play();
    audioPlay.textContent = 'Ⅱ';
    soundLabel.textContent = 'Lmousi9a khdama';
  } else {
    audioElement.pause();
    audioPlay.textContent = '▶';
    soundLabel.textContent = 'Lmousi9a wa9fa';
  }
});

audioElement.addEventListener('timeupdate', () => {
  if (audioElement.duration) audioProgress.value = String((audioElement.currentTime / audioElement.duration) * 100);
});
audioElement.addEventListener('ended', () => {
  audioPlay.textContent = '▶';
  soundLabel.textContent = 'Lmousi9a wajda';
  audioProgress.value = '0';
});
audioProgress.addEventListener('input', () => {
  if (audioElement.duration) audioElement.currentTime = (Number(audioProgress.value) / 100) * audioElement.duration;
});
audioVolume.addEventListener('input', () => { audioElement.volume = Number(audioVolume.value); });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const memoryCards = [...document.querySelectorAll('.memory-card')];
const galleryImages = [...document.querySelectorAll('.memory-image img'), document.querySelector('.final-memory-photo img')];
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxPlaceholder = document.querySelector('#lightboxPlaceholder');
const lightboxCaption = document.querySelector('#lightboxCaption');
const lightboxCount = document.querySelector('#lightboxCount');
const uploadStorageKey = 'rachida-memory-photos-v1';
let activeMemory = 0;

galleryImages.forEach((image) => {
  image.addEventListener('load', () => image.classList.add('image-ready'));
});

function getSavedUploads() {
  try {
    return JSON.parse(localStorage.getItem(uploadStorageKey)) || {};
  } catch {
    return {};
  }
}

function saveUploads(uploads) {
  try {
    localStorage.setItem(uploadStorageKey, JSON.stringify(uploads));
    return true;
  } catch {
    return false;
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const source = new Image();
      source.onload = () => {
        const maxSize = 1500;
        const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(source.width * scale);
        canvas.height = Math.round(source.height * scale);
        canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .82));
      };
      source.onerror = reject;
      source.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateCardImage(card, imageSource, uploads) {
  const image = card.querySelector('.memory-image img');
  card.dataset.image = imageSource;
  card.dataset.hasUpload = 'true';
  image.src = imageSource;
  image.classList.add('image-ready');
  uploads[card.dataset.slot] = imageSource;
  saveUploads(uploads);
}

function resetCardImage(card, uploads) {
  const image = card.querySelector('.memory-image img');
  const defaultImage = card.dataset.defaultImage;
  delete uploads[card.dataset.slot];
  saveUploads(uploads);
  card.dataset.image = defaultImage;
  card.dataset.hasUpload = 'false';
  image.classList.remove('image-ready');
  image.src = defaultImage;
}

function addUploadControls(card, index, uploads) {
  card.dataset.slot = String(index + 1);
  card.dataset.defaultImage = card.dataset.image;
  card.dataset.hasUpload = 'false';
  const controls = document.createElement('div');
  controls.className = 'memory-controls';

  const addButton = document.createElement('button');
  addButton.className = 'memory-control';
  addButton.type = 'button';
  addButton.textContent = '+ ZID TSWIRA ♥';
  addButton.title = 'Zid tswira';

  const replaceButton = document.createElement('button');
  replaceButton.className = 'memory-control';
  replaceButton.type = 'button';
  replaceButton.textContent = 'BDDEL TSWIRA';
  replaceButton.title = 'Bddel tswira';

  const removeButton = document.createElement('button');
  removeButton.className = 'memory-control memory-control-remove';
  removeButton.type = 'button';
  removeButton.textContent = '7YED TSWIRA';
  removeButton.title = '7yed tswira';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;
  fileInput.tabIndex = -1;

  const chooseFile = () => fileInput.click();
  addButton.addEventListener('click', (event) => { event.stopPropagation(); chooseFile(); });
  replaceButton.addEventListener('click', (event) => { event.stopPropagation(); chooseFile(); });
  removeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    resetCardImage(card, uploads);
  });
  fileInput.addEventListener('change', async () => {
    const [file] = fileInput.files;
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const compressedImage = await compressImage(file);
      updateCardImage(card, compressedImage, uploads);
    } catch {
      fileInput.value = '';
    }
    fileInput.value = '';
  });

  controls.append(addButton, replaceButton, removeButton, fileInput);
  card.append(controls);
  if (uploads[card.dataset.slot]) updateCardImage(card, uploads[card.dataset.slot], uploads);
}

const savedUploads = getSavedUploads();
memoryCards.forEach((card, index) => {
  addUploadControls(card, index, savedUploads);
  card.addEventListener('click', (event) => {
    if (event.target.closest('.memory-controls')) return;
    openLightbox(index);
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(index);
    }
  });
});

function renderLightbox() {
  const card = memoryCards[activeMemory];
  const imagePath = card.dataset.image;
  if (card.dataset.hasUpload !== 'true') {
    lightboxImage.removeAttribute('src');
    lightboxImage.classList.add('is-hidden');
    lightboxPlaceholder.classList.add('is-visible');
    lightboxCaption.textContent = card.dataset.caption;
    lightboxCount.textContent = `${String(activeMemory + 1).padStart(2, '0')} / ${String(memoryCards.length).padStart(2, '0')}`;
    return;
  }
  lightboxImage.classList.remove('is-hidden');
  lightboxPlaceholder.classList.remove('is-visible');
  lightboxImage.src = imagePath;
  lightboxImage.alt = card.dataset.caption;
  lightboxImage.onerror = () => {
    lightboxImage.classList.add('is-hidden');
    lightboxPlaceholder.classList.add('is-visible');
  };
  lightboxCaption.textContent = card.dataset.caption;
  lightboxCount.textContent = `${String(activeMemory + 1).padStart(2, '0')} / ${String(memoryCards.length).padStart(2, '0')}`;
}

function openLightbox(index) {
  activeMemory = index;
  renderLightbox();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelector('#lightboxClose').addEventListener('click', closeLightbox);
document.querySelector('#lightboxPrev').addEventListener('click', () => {
  activeMemory = (activeMemory - 1 + memoryCards.length) % memoryCards.length;
  renderLightbox();
});
document.querySelector('#lightboxNext').addEventListener('click', () => {
  activeMemory = (activeMemory + 1) % memoryCards.length;
  renderLightbox();
});
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') document.querySelector('#lightboxPrev').click();
  if (event.key === 'ArrowRight') document.querySelector('#lightboxNext').click();
});

// A few slow hearts give the background a little movement without distracting from the letter.
setInterval(() => {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = Math.random() > .35 ? '♥' : '✦';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.bottom = '-2rem';
  heart.style.animationDuration = `${8 + Math.random() * 6}s`;
  floatingHearts.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}, 1800);
