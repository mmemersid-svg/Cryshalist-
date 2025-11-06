// Ambil elemen tombol & sidebar
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeSidebar');
// Pastikan elemen ada di halaman
if (menuBtn && sidebar && closeBtn) {

  // Tombol menu (☰) buat buka sidebar
  menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
    // biar body nggak bisa discroll waktu sidebar terbuka
    document.body.style.overflow = 'hidden';
  });

  // Tombol X buat nutup sidebar
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
    document.body.style.overflow = 'auto';
  });

  // Klik di luar sidebar = tutup juga (biar natural di semua device)
  document.addEventListener('click', (e) => {
    if (
      sidebar.classList.contains('active') &&
      !sidebar.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      sidebar.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}