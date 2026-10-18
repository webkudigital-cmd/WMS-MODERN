// GANTI URL DENGAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbz4AxbimFPIx6Wog2TKqtUm4yY2SfMjvfYrAEgL1ZdrS5cS0x2bDorgJkYF1N6L3BDf_g/exec";

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  // Handlers
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("formBarangMasuk").addEventListener("submit", handleBarangMasuk);
});

async function apiRequest(action, payload = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload, user: currentUser })
    });
    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    return { success: false, message: "Koneksi ke backend gagal." };
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;

  const res = await apiRequest("login", { username, password });
  if (res.success) {
    currentUser = res.user;
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");
    document.getElementById("userInfo").innerText = `${currentUser.username} (${currentUser.role})`;
    loadDashboard();
  } else {
    alert(res.message);
  }
}

function logout() {
  currentUser = null;
  document.getElementById("appPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function switchPage(pageName) {
  document.querySelectorAll(".page-view").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));

  if (pageName === "dashboard") {
    document.getElementById("viewDashboard").classList.remove("hidden");
    loadDashboard();
  } else if (pageName === "masterBarang") {
    document.getElementById("viewMasterBarang").classList.remove("hidden");
    loadMasterBarang();
  } else if (pageName === "barangMasuk") {
    document.getElementById("viewBarangMasuk").classList.remove("hidden");
  }
}

async function loadDashboard() {
  const res = await apiRequest("getDashboardStats");
  if (res.success) {
    document.getElementById("statTotalSKU").innerText = res.data.totalSKU;
    document.getElementById("statTotalStok").innerText = res.data.totalStok;
    document.getElementById("statBarangMasuk").innerText = res.data.totalMasuk;
    document.getElementById("statBarangKeluar").innerText = res.data.totalKeluar;
    renderChart();
  }
}

async function loadMasterBarang() {
  const res = await apiRequest("getMasterBarang");
  const tbody = document.getElementById("tableMasterBarang");
  tbody.innerHTML = "";

  if (res.success) {
    res.data.forEach(item => {
      tbody.innerHTML += `
        <tr>
          <td><b>${item.sku}</b></td>
          <td>${item.namaBarang}</td>
          <td>${item.kategori}</td>
          <td>${item.lokasiRak}</td>
          <td>${item.stokMin}</td>
          <td><span class="badge">${item.status}</span></td>
        </tr>
      `;
    });
  }
}

async function handleBarangMasuk(e) {
  e.preventDefault();
  const payload = {
    tanggal: document.getElementById("inTanggal").value,
    supplier: document.getElementById("inSupplier").value,
    sku: document.getElementById("inSKU").value,
    namaBarang: document.getElementById("inNama").value,
    jumlah: Number(document.getElementById("inJumlah").value),
    lokasi: document.getElementById("inLokasi").value,
    noSuratJalan: "SJ-" + Date.now(),
    catatan: "Input via Web WMS"
  };

  const res = await apiRequest("createBarangMasuk", payload);
  alert(res.message);
  if (res.success) e.target.reset();
}

function renderChart() {
  const ctx = document.getElementById('movementChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      datasets: [{
        label: 'Barang Masuk',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: '#2563EB'
      }, {
        label: 'Barang Keluar',
        data: [8, 11, 5, 8, 3, 7],
        backgroundColor: '#7C3AED'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}
