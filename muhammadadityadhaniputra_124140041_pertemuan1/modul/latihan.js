
const nama = "Muhammad Aditya Dhani Putra";
let umur = 20;
const kotaAsal = "[Kota Asal]";

const nilaiUjian = 85;

let statusLulus = "";
if (nilaiUjian >= 70) {
  statusLulus = "Lulus";
} else {
  statusLulus = "Tidak Lulus";
}

const statusTernari = nilaiUjian >= 70 ? "Lulus" : "Tidak Lulus";

let kategoriUmur = "";
if (umur < 12) {
  kategoriUmur = "anak";
} else if (umur <= 17) {
  kategoriUmur = "remaja";
} else if (umur <= 59) {
  kategoriUmur = "dewasa";
} else {
  kategoriUmur = "lansia";
}

console.log("Nama:", nama, "| Umur:", umur, "| Kota:", kotaAsal);
console.log("Nilai:", nilaiUjian, "->", statusLulus, "/", statusTernari);
console.log("Kategori umur:", kategoriUmur);

document.getElementById("out-variabel").innerHTML = `
  <p>Nama: <strong>${nama}</strong> (${umur} tahun, ${kotaAsal})</p>
  <p>Nilai ${nilaiUjian}: <strong>${statusLulus}</strong> (kategori umur: ${kategoriUmur})</p>
`;

function hitung(angka1, angka2, operasi) {
  switch (operasi) {
    case "tambah":
      return angka1 + angka2;
    case "kurang":
      return angka1 - angka2;
    case "kali":
      return angka1 * angka2;
    case "bagi":
      if (angka2 === 0) return "Error: pembagian dengan nol";
      return angka1 / angka2;
    default:
      return "Operasi tidak valid";
  }
}

const hasilTambah = hitung(12, 4, "tambah");
const hasilBagi = hitung(12, 4, "bagi");
const hasilBagiNol = hitung(12, 0, "bagi");

console.log("12 + 4 =", hasilTambah);
console.log("12 / 4 =", hasilBagi);
console.log("12 / 0 =", hasilBagiNol);

document.getElementById("out-kalkulator").innerHTML = `
  <p>12 + 4 = <strong>${hasilTambah}</strong></p>
  <p>12 / 4 = <strong>${hasilBagi}</strong></p>
  <p>12 / 0 = <strong class="text-red-600">${hasilBagiNol}</strong></p>
`;

const fizzbuzz = [];
for (let i = 1; i <= 20; i++) {
  if (i % 15 === 0) {
    fizzbuzz.push("FizzBuzz");
  } else if (i % 3 === 0) {
    fizzbuzz.push("Fizz");
  } else if (i % 5 === 0) {
    fizzbuzz.push("Buzz");
  } else {
    fizzbuzz.push(i);
  }
}

console.log("FizzBuzz:", fizzbuzz.join(", "));

document.getElementById("out-fizzbuzz").innerHTML = fizzbuzz
  .map((item) => {
    const warna =
      item === "FizzBuzz"
        ? "bg-purple-100 text-purple-700"
        : item === "Fizz"
          ? "bg-blue-100 text-blue-700"
          : item === "Buzz"
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-600";
    return `<span class="px-2 py-1 rounded text-sm font-semibold ${warna}">${item}</span>`;
  })
  .join("");

const daftarMahasiswa = [
  { nama: "[Nama]", nim: "124140041", jurusan: "Teknik Informatika", nilai: 88 },
  { nama: "Budi", nim: "124140001", jurusan: "Teknik Informatika", nilai: 75 },
  { nama: "Citra", nim: "124140002", jurusan: "Sistem Informasi", nilai: 92 },
  { nama: "Dewi", nim: "124140003", jurusan: "Teknik Informatika", nilai: 64 },
  { nama: "Eka", nim: "124140004", jurusan: "Sistem Informasi", nilai: 81 },
];

// Render tabel HTML dari array of objects
const barisTabel = daftarMahasiswa
  .map(
    (mhs, index) => `
    <tr class="border-t">
      <td class="py-1 pr-4">${index + 1}</td>
      <td class="py-1 pr-4">${mhs.nama}</td>
      <td class="py-1 pr-4">${mhs.nim}</td>
      <td class="py-1 pr-4">${mhs.jurusan}</td>
      <td class="py-1">${mhs.nilai}</td>
    </tr>`
  )
  .join("");

const terbaik = daftarMahasiswa.reduce((max, mhs) =>
  mhs.nilai > max.nilai ? mhs : max
);

const rataRata =
  daftarMahasiswa.reduce((sum, mhs) => sum + mhs.nilai, 0) /
  daftarMahasiswa.length;
const diAtasRataRata = daftarMahasiswa
  .filter((mhs) => mhs.nilai > rataRata)
  .map((mhs) => mhs.nama);

console.log("Nilai tertinggi:", terbaik.nama, terbaik.nilai);
console.log("Rata-rata:", rataRata.toFixed(2));
console.log("Di atas rata-rata:", diAtasRataRata.join(", "));

document.getElementById("out-mahasiswa").innerHTML = `
  <table class="text-sm mb-3">
    <thead>
      <tr class="text-left text-slate-500">
        <th class="pr-4">No</th><th class="pr-4">Nama</th>
        <th class="pr-4">NIM</th><th class="pr-4">Jurusan</th><th>Nilai</th>
      </tr>
    </thead>
    <tbody>${barisTabel}</tbody>
  </table>
  <p>Nilai tertinggi: <strong>${terbaik.nama} (${terbaik.nilai})</strong></p>
  <p>Rata-rata: <strong>${rataRata.toFixed(2)}</strong> —
     di atas rata-rata: ${diAtasRataRata.join(", ")}</p>
`;

const KUNCI = "latihan_nama";
localStorage.setItem(KUNCI, JSON.stringify({ nama: nama, kota: kotaAsal }));

let dataTersimpan = null;
try {
  dataTersimpan = JSON.parse(localStorage.getItem(KUNCI));
} catch (error) {
  console.error("Gagal membaca localStorage:", error);
}

console.log("Data dari localStorage:", dataTersimpan);

document.getElementById("out-storage").innerHTML = `
  <p>Data tersimpan di <code>localStorage</code> dengan kunci
     <code>${KUNCI}</code> lalu dimuat ulang dengan
     <code>JSON.parse()</code>:</p>
  <p class="mt-1"><strong>${dataTersimpan.nama}</strong> — ${dataTersimpan.kota}</p>
  <p class="text-sm text-slate-500 mt-1">Refresh halaman: data tetap ada.</p>
`;
