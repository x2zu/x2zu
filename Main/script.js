function createShootingStar() {
  const star = document.createElement('div');
  star.classList.add('shooting-star');

  // Posisi acak vertikal (antara 20% - 80% viewport height)
  star.style.top = `${Math.random() * 60 + 20}vh`;

  // Posisi awal acak sedikit vertikal supaya natural
  star.style.left = `-150px`;

  document.querySelector('.main').appendChild(star);

  // Durasi animasi 2.5 detik, hapus setelah selesai
  star.style.animation = `shooting 2.5s ease-in-out forwards`;

  setTimeout(() => star.remove(), 2500);
}

// Spawn shooting star tiap 1.5 - 3 detik, maksimal 3 star berbarengan
let shootingStarCount = 0;
setInterval(() => {
  if (shootingStarCount < 3) {
    createShootingStar();
    shootingStarCount++;
    setTimeout(() => shootingStarCount--, 2500);
  }
}, Math.random() * 1500 + 1500);
const starsContainer = document.querySelector('.stars');

function createStar() {
  const star = document.createElement('div');
  star.classList.add('star');

  // Ukuran acak antara 1px sampai 3px
  const size = Math.random() * 2 + 1;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;

  // Posisi acak di seluruh area
  star.style.top = `${Math.random() * 100}%`;
  star.style.left = `${Math.random() * 100}%`;

  // Opacity acak supaya terlihat natural
  star.style.opacity = Math.random() * 0.7 + 0.3;

  // Animasi twinkle dengan delay random
  star.style.animationDelay = `${Math.random() * 3}s`;

  starsContainer.appendChild(star);
}

// Buat 80 bintang
for (let i = 0; i < 80; i++) {
  createStar();
}
