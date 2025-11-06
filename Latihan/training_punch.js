// ===================================
// === Inisialisasi Elemen HTML ===
// ===================================

const startBtn = document.getElementById('start-sesi-btn');
// Menggunakan ID yang benar dari HTML yang baru:
const exitBtn = document.getElementById('exit-btn'); 
const timerEl = document.getElementById('timer-display');
const countEl = document.getElementById('punch-count');
const targetEl = document.getElementById('display-target');
const powerEl = document.getElementById('display-power');
const messageEl = document.getElementById('session-message');
const levelSelect = document.getElementById('level-select'); 

// ===================================
// === Variabel Global Kontrol Sesi & Akselerometer ===
// ===================================

let timerInterval;
let isSessionActive = false;
let timeRemaining = 0; 
let duration = 0;
let targetCount = 0;
let minPeak = 0; 

// Variabel Akselerometer
let movementBuffer = [];
const bufferSize = 10; 
let lastZ = 0;
let punchCount = 0; 
let sessionEnded = false; // FLAG BARU untuk Kontrol Reset

// ===================================
// === Fungsi Akselerometer & Deteksi Pukulan ===
// ===================================

function handleMotionEvent(event) {
    if (!isSessionActive) return;

    let z = event.accelerationIncludingGravity.z || 0;
    
    // Moving Average
    movementBuffer.push(z);
    if (movementBuffer.length > bufferSize) {
        movementBuffer.shift(); 
    }
    let avgZ = movementBuffer.reduce((a,b) => a+b, 0) / movementBuffer.length;
    
    // Menghitung Power/Peak rata-rata (disesuaikan dengan tampilan Power)
    powerEl.textContent = avgZ.toFixed(1); 

    // Peak Detection
    // Jika ada peningkatan signifikan (avgZ - lastZ > minPeak), hitung sebagai pukulan
    if(avgZ - lastZ > minPeak){ 
        punchCount++; 
        countEl.textContent = punchCount; 
        
        if (punchCount >= targetCount) {
             endSession("TARGET TERCAPAI!");
        }
    }
    
    lastZ = avgZ; 
}


// ===================================
// === Fungsi Setup Level & Timer ===
// ===================================

function setupLevel(selectedLevel) {
    // Implementasi mode Easy, Medium, Hard dengan else if
    if (selectedLevel === 'hard') {
        duration = 1 * 60; // 1 Menit
        targetCount = 200;
        minPeak = 4.5;
    } else if (selectedLevel === 'medium') {
        duration = 3 * 60; // 3 Menit
        targetCount = 150;
        minPeak = 3.5;
    } else if (selectedLevel === 'easy') {
        duration = 5 * 60; // 5 Menit
        targetCount = 100;
        minPeak = 2.5;
    } else {
        // Fallback jika 'none' atau nilai tidak valid
        duration = 0;
        targetCount = 0;
        minPeak = 0;
    }
    
    timeRemaining = duration;
    targetEl.textContent = targetCount;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    timerEl.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


function startSensorAndTimer() {
    // Dipanggil setelah izin berhasil
    window.addEventListener('devicemotion', handleMotionEvent, true);
    isSessionActive = true;
    sessionEnded = false; // Pastikan flag reset mati
    startBtn.disabled = false; // Tombol bisa digunakan untuk Stop/Pause
    startBtn.textContent = "STOP SESI";
    levelSelect.disabled = true; 
    messageEl.textContent = "BERLANGSUNG...";
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            endSession("WAKTU HABIS!");
        }
    }, 1000);
}

function fullReset() {
    if (timerInterval) clearInterval(timerInterval);
    window.removeEventListener('devicemotion', handleMotionEvent, true);
    
    // Reset semua variabel
    punchCount = 0;
    timeRemaining = 0; 
    movementBuffer = [];
    isSessionActive = false;
    sessionEnded = false;
    
    // Reset tampilan
    countEl.textContent = 0;
    powerEl.textContent = 0;
    targetEl.textContent = 0;
    timerEl.textContent = '00:00';
    startBtn.textContent = "Mulai Sesi";
    startBtn.disabled = false;
    levelSelect.disabled = false;
    messageEl.textContent = "Start";
    levelSelect.value = 'none'; // Set kembali ke 'Pilih Mode'
}

function startSession() {
    // --- 1. VALIDASI & SETUP ---
    const selectedLevel = levelSelect.value;
    if (selectedLevel === 'none' || selectedLevel === null) {
        alert("Pilih Level dulu sebelum memulai sesi!");
        return; 
    }
    
    // --- 2. LOGIKA IZIN DAN START ---
    
    // Pertama, lakukan reset persiapan
    if (timerInterval) clearInterval(timerInterval);
    window.removeEventListener('devicemotion', handleMotionEvent, true);
    punchCount = 0;
    countEl.textContent = 0;
    movementBuffer = [];
    
    // Setup Level Baru (Mengatur duration, minPeak, timeRemaining)
    setupLevel(selectedLevel); 
    
    // Feedback visual awal
    startBtn.textContent = "Loading...";
    startBtn.disabled = true;
    levelSelect.disabled = true;
    messageEl.textContent = "Mendapatkan Izin...";


    if (window.DeviceMotionEvent) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            // iOS/Safari: Perlu izin
            DeviceMotionEvent.requestPermission().then(permissionState => {
                if (permissionState === 'granted') {
                    startSensorAndTimer();
                } else {
                    messageEl.textContent = "Izin Sensor Ditolak. Klik untuk coba lagi.";
                    startBtn.textContent = "Mulai Sesi"; 
                    startBtn.disabled = false;
                    levelSelect.disabled = false;
                }
            }).catch(error => {
                messageEl.textContent = "Error Sensor Izin.";
                startBtn.textContent = "Mulai Sesi";
                startBtn.disabled = false;
                levelSelect.disabled = false;
                console.error("Izin Sensor Gagal:", error);
            });
        } else {
            // Android/Non-iOS: Tidak perlu izin
            startSensorAndTimer();
        }
    } else {
        messageEl.textContent = "Sensor Tidak Didukung.";
    }
}


function endSession(message) {
    if (timerInterval) clearInterval(timerInterval);
    isSessionActive = false;
    sessionEnded = true; // Set flag sesi berakhir
    window.removeEventListener('devicemotion', handleMotionEvent, true);
    
    // Reset tombol/status
    startBtn.textContent = "RESET SESI"; // Ganti teks tombol menjadi RESET
    startBtn.disabled = false; 
    levelSelect.disabled = false;
    
    messageEl.textContent = message;
    updateTimerDisplay(); 
}

function exitSession() {
    if (timerInterval) clearInterval(timerInterval);
    window.removeEventListener('devicemotion', handleMotionEvent, true);
    // Menggunakan ../index.html karena di HTML sudah diatur menggunakan <a> tag
    // window.location.href = '../index.html'; 
}

// ===================================
// === Handle Klik Tombol Start/Stop/Reset ===
// ===================================
function handleStartStopClick() {
    if (sessionEnded) {
        // Jika sesi sudah berakhir, klik tombol akan melakukan FULL RESET
        fullReset();
    } else if (isSessionActive) {
        // Jika sesi sedang aktif, tombol berfungsi sebagai STOP/PAUSE
        endSession("SESI DIJEDA");
        startBtn.textContent = "LANJUTKAN SESI";
        sessionEnded = false; // Tidak dihitung sebagai akhir sesi total
    } else if (timeRemaining > 0) {
        // Jika sesi dijeda, tombol berfungsi sebagai LANJUTKAN
        startSensorAndTimer();
    } else {
        // Jika sesi siap (initial start)
        startSession();
    }
}


// ===================================
// === Inisialisasi Awal Halaman (Listener) ===
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    fullReset(); // Lakukan reset penuh saat halaman dimuat
    
    // Perbaikan: Teks tombol awal
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
         startBtn.textContent = "Mulai & Beri Izin";
    } else {
         startBtn.textContent = "Mulai Sesi";
    }

    // Set listener tombol start
    startBtn.addEventListener('click', handleStartStopClick); 
    
    // exitBtn tidak perlu listener JS, karena sudah ada <a> tag di HTML.
    // Tetapi jika Anda ingin menggunakan JS:
    // exitBtn.addEventListener('click', exitSession); 
    
    // Optional: Listener untuk memastikan tampilan timer diperbarui saat level berubah sebelum start
    levelSelect.addEventListener('change', () => {
        // Reset hanya untuk memperbarui tampilan timer dan target
        setupLevel(levelSelect.value); 
    });
});