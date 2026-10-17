
const STORAGE_KEY = "odaading_keranjang";
const NAMA_MINIMAL = 3;
const HARGA_MINIMAL = 500;
const BATAS_DISKON_OTOMATIS = 50000;
const PERSEN_DISKON = 0.1;
const KODE_PROMO = "ODA10";

let keranjang = [];
let promoAktif = false;

const formTambah = document.getElementById("form-tambah-barang");
const inputNama = document.getElementById("input-nama");
const inputHarga = document.getElementById("input-harga");
const inputQty = document.getElementById("input-qty");
const tbodyKeranjang = document.getElementById("tbody-keranjang");
const emptyKeranjang = document.getElementById("empty-keranjang");
const totalBelanjaEl = document.getElementById("total-belanja");
const barisDiskon = document.getElementById("baris-diskon");
const diskonSumber = document.getElementById("diskon-sumber");
const diskonNominal = document.getElementById("diskon-nominal");
const totalAkhirEl = document.getElementById("total-akhir");
const inputPromo = document.getElementById("input-promo");
const btnPromo = document.getElementById("btn-promo");
const promoInfo = document.getElementById("promo-info");
const inputBayar = document.getElementById("input-bayar");
const kembalianBox = document.getElementById("kembalian-box");
const kembalianNominal = document.getElementById("kembalian-nominal");
const kembalianPesan = document.getElementById("kembalian-pesan");
const btnReset = document.getElementById("btn-reset");

const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

const escapeHtml = (teks) =>
  teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");


const validasiNama = (nama) => nama.trim().length >= NAMA_MINIMAL;

const validasiHarga = (nilai) => {
  if (nilai === "") return false;
  const harga = Number(nilai);
  return Number.isFinite(harga) && harga >= HARGA_MINIMAL;
};

const validasiQty = (nilai) => {
  if (nilai === "") return false;
  const qty = Number(nilai);
  return Number.isInteger(qty) && qty >= 1;
};

const tampilkanError = (inputEl, pesan) => {
  const errorEl = document.getElementById(`error-${inputEl.name}`);
  errorEl.textContent = pesan;
  errorEl.hidden = false;
  inputEl.classList.add("input-invalid");
  inputEl.setAttribute("aria-invalid", "true");
};

const sembunyikanError = (inputEl) => {
  const errorEl = document.getElementById(`error-${inputEl.name}`);
  errorEl.textContent = "";
  errorEl.hidden = true;
  inputEl.classList.remove("input-invalid");
  inputEl.removeAttribute("aria-invalid");
};

const bersihkanSemuaError = () => {
  [inputNama, inputHarga, inputQty].forEach(sembunyikanError);
};

const hitungSubtotal = (item) => item.harga * item.qty;

const hitungTotal = () => keranjang.reduce((sum, item) => sum + hitungSubtotal(item), 0);

const hitungDiskon = (total) => {
  if (promoAktif) {
    return { nominal: Math.round(total * PERSEN_DISKON), sumber: "PROMO" };
  }
  if (total >= BATAS_DISKON_OTOMATIS) {
    return { nominal: Math.round(total * PERSEN_DISKON), sumber: "OTOMATIS" };
  }
  return { nominal: 0, sumber: null };
};

const hitungTotalAkhir = () => {
  const total = hitungTotal();
  return total - hitungDiskon(total).nominal;
};

const simpanKeranjang = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keranjang));
};

const muatKeranjang = () => {
  try {
    const mentah = localStorage.getItem(STORAGE_KEY);
    if (!mentah) return;
    const data = JSON.parse(mentah);
    if (Array.isArray(data)) {
      keranjang = data.filter(
        (item) =>
          item &&
          typeof item.nama === "string" &&
          Number.isFinite(item.harga) &&
          Number.isFinite(item.qty)
      );
    }
  } catch (error) {
    console.error("Gagal memuat keranjang:", error);
    keranjang = [];
  }
};
const renderTabel = () => {
  if (keranjang.length === 0) {
    tbodyKeranjang.innerHTML = "";
    emptyKeranjang.hidden = false;
  } else {
    emptyKeranjang.hidden = true;
    tbodyKeranjang.innerHTML = keranjang
      .map(
        (item, index) => `
        <tr>
          <td class="col-no">${index + 1}</td>
          <td class="cell-nama">${escapeHtml(item.nama)}</td>
          <td class="col-num">${formatRupiah(item.harga)}</td>
          <td class="col-num">${item.qty}</td>
          <td class="col-num cell-subtotal">${formatRupiah(hitungSubtotal(item))}</td>
          <td class="col-aksi">
            <button type="button" class="btn-hapus" data-id="${item.id}" aria-label="Hapus ${escapeHtml(item.nama)}">Hapus</button>
          </td>
        </tr>`
      )
      .join("");
  }
};

const renderRingkasan = () => {
  const total = hitungTotal();
  const diskon = hitungDiskon(total);
  const totalAkhir = total - diskon.nominal;

  totalBelanjaEl.textContent = formatRupiah(total);

  if (diskon.nominal > 0) {
    barisDiskon.hidden = false;
    diskonSumber.textContent = diskon.sumber;
    diskonNominal.textContent = `−${formatRupiah(diskon.nominal)}`;
  } else {
    barisDiskon.hidden = true;
  }

  totalAkhirEl.textContent = formatRupiah(totalAkhir);
};

const renderKembalian = () => {
  const nilai = inputBayar.value;
  if (nilai === "") {
    kembalianBox.classList.remove("kurang", "cukup");
    kembalianNominal.textContent = formatRupiah(0);
    kembalianPesan.textContent = "";
    return;
  }

  const bayar = Number(nilai);
  if (!Number.isFinite(bayar) || bayar < 0) {
    kembalianBox.classList.remove("cukup");
    kembalianBox.classList.add("kurang");
    kembalianNominal.textContent = formatRupiah(0);
    kembalianPesan.textContent = "Masukkan nominal uang yang valid.";
    return;
  }

  const totalAkhir = hitungTotalAkhir();
  const kembalian = bayar - totalAkhir;

  if (kembalian < 0) {
    kembalianBox.classList.remove("cukup");
    kembalianBox.classList.add("kurang");
    kembalianNominal.textContent = formatRupiah(0);
    kembalianPesan.textContent = `Uang belum mencukupi (kurang ${formatRupiah(Math.abs(kembalian))}).`;
  } else {
    kembalianBox.classList.remove("kurang");
    kembalianBox.classList.add("cukup");
    kembalianNominal.textContent = formatRupiah(kembalian);
    kembalianPesan.textContent = "Pembayaran cukup. Terima kasih!";
  }
};

const renderSemua = () => {
  renderTabel();
  renderRingkasan();
  renderKembalian();
};
const tambahBarang = (event) => {
  event.preventDefault();

  const nama = inputNama.value;
  const hargaInput = inputHarga.value;
  const qtyInput = inputQty.value;
  let valid = true;

  if (!validasiNama(nama)) {
    tampilkanError(inputNama, `Nama barang wajib diisi, minimal ${NAMA_MINIMAL} karakter.`);
    valid = false;
  } else {
    sembunyikanError(inputNama);
  }

  if (!validasiHarga(hargaInput)) {
    tampilkanError(inputHarga, `Harga harus angka positif, minimal ${formatRupiah(HARGA_MINIMAL)}.`);
    valid = false;
  } else {
    sembunyikanError(inputHarga);
  }

  if (!validasiQty(qtyInput)) {
    tampilkanError(inputQty, "Qty harus bilangan bulat, minimal 1.");
    valid = false;
  } else {
    sembunyikanError(inputQty);
  }

  // Data tidak valid: cegah barang masuk keranjang.
  if (!valid) return;

  keranjang.push({
    id: Date.now(),
    nama: nama.trim(),
    harga: Number(hargaInput),
    qty: Number(qtyInput),
  });

  simpanKeranjang();
  renderSemua();
  formTambah.reset();
  bersihkanSemuaError();
  inputNama.focus();
};

const hapusBarang = (id) => {
  keranjang = keranjang.filter((item) => item.id !== id);
  simpanKeranjang();
  renderSemua();
};

const terapkanPromo = () => {
  const kode = inputPromo.value.trim().toUpperCase();

  if (kode === "") {
    promoInfo.textContent = "";
    promoInfo.className = "promo-info";
    return;
  }

  if (kode === KODE_PROMO) {
    promoAktif = true;
    promoInfo.textContent = `Kode ${KODE_PROMO} aktif — diskon 10% diterapkan.`;
    promoInfo.className = "promo-info ok";
  } else {
    promoAktif = false;
    promoInfo.textContent = "Kode promo tidak dikenal.";
    promoInfo.className = "promo-info gagal";
  }
  renderRingkasan();
  renderKembalian();
};

const resetTransaksi = () => {
  if (keranjang.length === 0 && !promoAktif && inputBayar.value === "") return;
  if (!confirm("Mulai transaksi baru? Keranjang akan dikosongkan.")) return;

  keranjang = [];
  promoAktif = false;
  localStorage.removeItem(STORAGE_KEY);
  inputPromo.value = "";
  promoInfo.textContent = "";
  promoInfo.className = "promo-info";
  inputBayar.value = "";
  renderSemua();
  inputNama.focus();
};

formTambah.addEventListener("submit", tambahBarang);

[inputNama, inputHarga, inputQty].forEach((inputEl) => {
  inputEl.addEventListener("input", () => sembunyikanError(inputEl));
});

tbodyKeranjang.addEventListener("click", (event) => {
  const tombol = event.target.closest(".btn-hapus");
  if (tombol) hapusBarang(Number(tombol.dataset.id));
});

btnPromo.addEventListener("click", terapkanPromo);
inputPromo.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    terapkanPromo();
  }
});

inputBayar.addEventListener("input", renderKembalian);
btnReset.addEventListener("click", resetTransaksi);

muatKeranjang();
renderSemua();
