import { TaskItem } from "./task-item.js";

const STORAGE_KEY = "ruangkuliah_tugas_124140041";
const LABEL_PRIORITAS = {
  normal: "Biasa",
  penting: "Penting",
  mendesak: "Mendesak",
};
const KUTIPAN_CADANGAN = [
  { quote: "Sedikit kemajuan setiap hari akan membawa kita ke tujuan.", author: "Catatan hari ini" },
  { quote: "Kamu tidak harus hebat untuk memulai, tapi harus memulai untuk menjadi hebat.", author: "Zig Ziglar" },
  { quote: "Fokus pada langkah berikutnya, bukan seluruh tangga.", author: "Catatan hari ini" },
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatTanggal = (tanggal) => {
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
    new Date(tahun, bulan - 1, hari)
  );
};

class DashboardApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.filter = "semua";
    this.editingId = null;
    this.form = document.getElementById("form-tugas");
    this.titleInput = document.getElementById("input-judul");
    this.courseInput = document.getElementById("input-mata-kuliah");
    this.deadlineInput = document.getElementById("input-deadline");
    this.priorityInput = document.getElementById("input-prioritas");
    this.list = document.getElementById("daftar-tugas");
    this.submitButton = document.getElementById("btn-simpan");
    this.cancelButton = document.getElementById("btn-batal");
    this.errorMessage = document.getElementById("error-judul");
    this.storageNote = document.querySelector(".privacy-note");
    this.bindEvents();
    this.setToday();
    this.render();
    this.loadQuote();
  }

  loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved
        .filter((task) => task && typeof task.judul === "string" && task.judul.trim())
        .map((task) => new TaskItem(task));
    } catch {
      return [];
    }
  }

  saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      this.storageNote.innerHTML = '<span aria-hidden="true">⌑</span> Catatanmu tersimpan di browser ini.';
    } catch {
      this.storageNote.textContent = "Penyimpanan browser tidak tersedia saat ini.";
    }
  }

  bindEvents() {
    this.form.addEventListener("submit", (event) => this.saveTask(event));
    this.cancelButton.addEventListener("click", () => this.cancelEdit());
    this.list.addEventListener("click", (event) => this.handleTaskAction(event));

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => this.setFilter(button.dataset.filter));
    });

    document.getElementById("btn-fokus").addEventListener("click", () => {
      this.setFilter("aktif");
      document.getElementById("tasks-title").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.getElementById("btn-kutipan").addEventListener("click", () => this.loadQuote());
    this.titleInput.addEventListener("input", () => this.clearTitleError());
  }

  setToday() {
    const today = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    document.getElementById("tanggal-hari").textContent = today.toLocaleUpperCase("id-ID");
  }

  getVisibleTasks() {
    const visible = this.tasks.filter((task) => {
      if (this.filter === "aktif") return !task.selesai;
      if (this.filter === "selesai") return task.selesai;
      return true;
    });

    return [...visible].sort((left, right) => {
      if (left.selesai !== right.selesai) return Number(left.selesai) - Number(right.selesai);
      return (left.deadline || "9999-12-31").localeCompare(right.deadline || "9999-12-31");
    });
  }

  render() {
    this.renderStats();
    this.renderTasks();
  }

  renderStats() {
    const total = this.tasks.length;
    const selesai = this.tasks.filter(({ selesai }) => selesai).length;
    const aktif = total - selesai;
    let progres = 0;
    if (total > 0) progres = Math.round((selesai / total) * 100);

    document.getElementById("jumlah-semua").textContent = total;
    document.getElementById("jumlah-pending").textContent = aktif;
    document.getElementById("jumlah-selesai").textContent = selesai;
    document.getElementById("label-jumlah").textContent = total;
    document.getElementById("catatan-progres").textContent = total
      ? `${progres}% tugas sudah selesai`
      : "langkah kecil tetap berarti";
    document.getElementById("progres-bar").style.width = `${progres}%`;
    document.querySelector(".progress-track").setAttribute("aria-valuenow", progres);
    document.querySelector(".progress-track").setAttribute("role", "progressbar");
    document.querySelector(".progress-track").setAttribute("aria-valuemin", "0");
    document.querySelector(".progress-track").setAttribute("aria-valuemax", "100");
  }

  renderTasks() {
    const tasks = this.getVisibleTasks();
    const emptyCopy = this.tasks.length === 0
      ? "Tugas yang kamu tambahkan akan muncul di sini. Mulai dengan satu hal yang ingin diselesaikan."
      : "Belum ada tugas di bagian ini. Coba pilih filter yang lain.";

    if (tasks.length === 0) {
      this.list.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon" aria-hidden="true">✳</span>
          <h3>${this.tasks.length === 0 ? "Ruangmu masih kosong" : "Tidak ada tugas di sini"}</h3>
          <p>${emptyCopy}</p>
        </div>`;
      return;
    }

    this.list.innerHTML = tasks.map((task) => this.taskTemplate(task)).join("");
  }

  taskTemplate(task) {
    const deadline = task.deadline
      ? `<span class="task-deadline ${this.isLate(task) ? "is-late" : ""}"><span aria-hidden="true">◷</span> ${formatTanggal(task.deadline)}${this.isLate(task) ? " · Terlewat" : ""}</span>`
      : `<span class="task-deadline">Tanpa tenggat</span>`;
    const checkIcon = task.selesai
      ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3.2 3.2L13 4.5"/></svg>'
      : "";

    return `
      <article class="task-item ${task.selesai ? "completed" : ""}">
        <button class="task-check ${task.selesai ? "is-done" : ""}" type="button" data-action="toggle" data-id="${escapeHtml(task.id)}" aria-label="${task.selesai ? "Tandai belum selesai" : "Tandai selesai"}: ${escapeHtml(task.judul)}" aria-pressed="${task.selesai}">
          ${checkIcon}
        </button>
        <div class="task-main">
          <span class="task-title">${escapeHtml(task.judul)}</span>
          <div class="task-meta">
            <span class="task-course">${escapeHtml(task.mataKuliah)}</span>
            ${deadline}
            <span class="priority-badge priority-${escapeHtml(task.prioritas)}">${LABEL_PRIORITAS[task.prioritas]}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action" type="button" data-action="edit" data-id="${escapeHtml(task.id)}" aria-label="Edit ${escapeHtml(task.judul)}" title="Edit tugas">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
          </button>
          <button class="task-action delete" type="button" data-action="delete" data-id="${escapeHtml(task.id)}" aria-label="Hapus ${escapeHtml(task.judul)}" title="Hapus tugas">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>
          </button>
        </div>
      </article>`;
  }

  isLate(task) {
    if (task.selesai || !task.deadline) return false;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return task.deadline < today;
  }

  setFilter(filter) {
    this.filter = filter;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    this.renderTasks();
  }

  saveTask(event) {
    event.preventDefault();
    const judul = this.titleInput.value.trim();

    if (judul.length < 3) {
      this.errorMessage.textContent = "Nama tugas minimal 3 karakter.";
      this.errorMessage.hidden = false;
      this.titleInput.classList.add("invalid");
      this.titleInput.setAttribute("aria-invalid", "true");
      this.titleInput.focus();
      return;
    }

    const fields = {
      judul,
      mataKuliah: this.courseInput.value,
      deadline: this.deadlineInput.value,
      prioritas: this.priorityInput.value,
    };

    if (this.editingId) {
      this.tasks = this.tasks.map((task) =>
        task.id === this.editingId ? new TaskItem({ ...task, ...fields }) : task
      );
    } else {
      this.tasks = [new TaskItem(fields), ...this.tasks];
    }

    this.saveTasks();
    this.cancelEdit();
    this.setFilter("semua");
    this.render();
  }

  clearTitleError() {
    this.errorMessage.textContent = "";
    this.errorMessage.hidden = true;
    this.titleInput.classList.remove("invalid");
    this.titleInput.removeAttribute("aria-invalid");
  }

  handleTaskAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === "toggle") this.toggleTask(id);
    if (action === "edit") this.editTask(id);
    if (action === "delete") this.deleteTask(id);
  }

  toggleTask(id) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? new TaskItem({ ...task, selesai: !task.selesai }) : task
    );
    this.saveTasks();
    this.render();
  }

  editTask(id) {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) return;

    this.editingId = id;
    this.titleInput.value = task.judul;
    this.courseInput.value = task.mataKuliah;
    this.deadlineInput.value = task.deadline;
    this.priorityInput.value = task.prioritas;
    document.getElementById("form-title").textContent = "Edit tugas";
    this.submitButton.innerHTML = 'Simpan perubahan <span aria-hidden="true">↗</span>';
    this.cancelButton.hidden = false;
    this.clearTitleError();
    document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "center" });
    this.titleInput.focus({ preventScroll: true });
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveTasks();
    this.render();
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset();
    this.clearTitleError();
    document.getElementById("form-title").textContent = "Tugas baru";
    this.submitButton.innerHTML = 'Simpan tugas <span aria-hidden="true">↗</span>';
    this.cancelButton.hidden = true;
  }

  async loadQuote() {
    const quoteEl = document.getElementById("kutipan");
    const authorEl = document.getElementById("penulis-kutipan");
    const button = document.getElementById("btn-kutipan");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    button.disabled = true;

    try {
      const response = await fetch("https://dummyjson.com/quotes/random", { signal: controller.signal });
      if (!response.ok) throw new Error("Kutipan tidak tersedia.");
      const { quote, author } = await response.json();
      if (!quote || !author) throw new Error("Data kutipan tidak lengkap.");
      quoteEl.textContent = quote;
      authorEl.textContent = `— ${author}`;
    } catch {
      const fallback = KUTIPAN_CADANGAN[Math.floor(Math.random() * KUTIPAN_CADANGAN.length)];
      quoteEl.textContent = fallback.quote;
      authorEl.textContent = `— ${fallback.author}`;
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
    }
  }
}

new DashboardApp();
