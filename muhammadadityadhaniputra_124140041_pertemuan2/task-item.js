const tanggalValid = (tanggal) => {
  if (typeof tanggal !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return false;
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  const nilai = new Date(tahun, bulan - 1, hari);
  return nilai.getFullYear() === tahun && nilai.getMonth() === bulan - 1 && nilai.getDate() === hari;
};

export class TaskItem {
  constructor({
    id = globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    judul = "",
    mataKuliah = "Umum",
    deadline = "",
    prioritas = "normal",
    selesai = false,
    dibuatPada = new Date().toISOString(),
  }) {
    this.id = String(id);
    this.judul = String(judul).trim();
    this.mataKuliah = String(mataKuliah || "Umum").trim() || "Umum";
    this.deadline = tanggalValid(deadline) ? deadline : "";
    this.prioritas = ["normal", "penting", "mendesak"].includes(prioritas) ? prioritas : "normal";
    this.selesai = Boolean(selesai);
    this.dibuatPada = dibuatPada;
  }
}
