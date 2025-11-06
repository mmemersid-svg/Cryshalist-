// <-->
// === Inisialisasi Aplikasi (SPA) ===
document.addEventListener('DOMContentLoaded', () => {
    // Load home
    loadPage('home');

    // Set listener navbar
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.target;
            setActiveNav(page);
            loadPage(page);
        });
    });
});

// <-->
// === Fungsi Pemuatan Halaman (Load Page) ===
function loadPage(page) {
    // Ambil HTML
    fetch(`pages/${page}.html`)
        .then(res => {
            if (!res.ok) throw new Error(`Halaman ${page}.html tidak ditemukan.`);
            return res.text();
        })
        .then(html => {
            document.getElementById('page-content').innerHTML = html;
            document.getElementById('pageTitle').textContent = capitalize(page);

            // Setup khusus
            if (page === 'training') setupTrainingCards();
        })
        .catch(err => {
            document.getElementById('page-content').innerHTML =
                `<p style="text-align:center; color:red;">Error: ${err.message}</p>`;
            console.error(err);
        });
}

// <-->
// === Fungsi Navigasi & Utility ===
function setActiveNav(page) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-target="${page}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// <-->
// === Setup Halaman Training ===
function setupTrainingCards() {
    const punchCard = document.querySelector('.training-card.punch'); 

    if (punchCard) {
        punchCard.addEventListener('click', () => {
            
            // Minta level
            let level = prompt("Pilih Level:\n1. Mudah (3 Menit, Target 200)\n2. Sulit (1 Menit, Target 200)");
            let selectedLevel = '';
            
            if (level === '1' || (level && level.toLowerCase().includes('mudah'))) {
                selectedLevel = 'easy';
            } else if (level === '2' || (level && (level.toLowerCase().includes('sulit') || level.toLowerCase().includes('hard')))) {
                selectedLevel = 'hard';
            } else {
                alert('Pilihan tidak valid. Membatalkan sesi.');
                return; // Batalkan sesi
            }

            // Simpan Session
            sessionStorage.setItem('punchModeLevel', selectedLevel);
            
            // Full reload
            window.location.href = 'training_punch.html';
        });
    }
}