let data = [];
let interval = null;
let sidebarFilter = "all"; // all or mega

// CSV 読み込み
fetch("pokemon.csv")
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    data = lines.slice(1).map(line => {
      const values = line.split(",");
      let obj = {};

      headers.forEach((h, i) => obj[h.trim()] = values[i].trim());

      return {
        no: Number(obj["No."]),
        name: obj["name"],
        mega: Number(obj["mega"])
      };
    });
  });

// 抽選フィルタ
function getFilteredList() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const excludeMode = document.querySelector('input[name="excludeMode"]:checked').value;

  let list = [];

  if (mode === "mega") {
    list = data.filter(d => d.mega === 1);
  } else if (mode === "noMega") {
    list = data.filter(d => d.mega === 0);
  } else {
    list = data;
  }

  if (excludeMode === "on") {
    const used = getTableValues();
    list = list.filter(d => !used.includes(d.name));
  }

  return list;
}

// スロット開始/停止
function toggle() {
  const result = document.getElementById("result");

  if (interval === null) {
    interval = setInterval(() => {
      const list = getFilteredList();
      if (list.length === 0) return;

      const r = Math.floor(Math.random() * list.length);
      result.textContent = list[r].name;

    }, 50);

  } else {
    clearInterval(interval);
    interval = null;
  }
}

// セルクリック処理
function setupCellClick() {
  const table = document.getElementById("logTable");

  table.addEventListener("click", function(e) {
    const cell = e.target;

    if (cell.tagName !== "TD") return;
    if (interval !== null) return;

    if (cell.textContent !== "") {
      cell.textContent = "";
      return;
    }

    const value = document.getElementById("result").textContent;
    if (!value || value === "---") return;

    cell.textContent = value;
  });

  table.addEventListener("dblclick", function(e) {
    const cell = e.target;

    if (cell.tagName !== "TD") return;
    if (interval !== null) return;

    const oldValue = cell.textContent;

    const input = document.createElement("input");
    input.type = "text";
    input.value = oldValue;
    input.style.width = "90%";

    cell.textContent = "";
    cell.appendChild(input);
    input.focus();

    function finish() {
      cell.textContent = input.value.trim();
    }

    input.addEventListener("blur", finish);
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") finish();
    });
  });
}

function resetTable() {
  const cells = document.querySelectorAll("#logTable td");
  cells.forEach(cell => cell.textContent = "");
}

window.onload = function() {
  setupCellClick();
};

// ログ表の値取得
function getTableValues() {
  const cells = document.querySelectorAll("#logTable td");
  const values = [];

  cells.forEach(cell => {
    if (cell.textContent !== "") {
      values.push(cell.textContent);
    }
  });

  return values;
}

// ヘルプ
function toggleHelp() {
  document.getElementById("helpModal").classList.toggle("hidden");
}

/* -------------------------
   サイドバー機能
------------------------- */

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle");

  sidebar.classList.remove("hidden");
  sidebar.classList.toggle("show");

  if (sidebar.classList.contains("show")) {
    toggleBtn.classList.add("hide");
    updateSidebarListAll();
  } else {
    toggleBtn.classList.remove("hide");
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle");

  sidebar.classList.remove("show");
  sidebar.classList.add("hidden");
  toggleBtn.classList.remove("hide");
}

// フィルタ切り替え
function setSidebarFilter(mode) {
  sidebarFilter = mode;

  document.getElementById("filter-all").classList.toggle("active", mode === "all");
  document.getElementById("filter-mega").classList.toggle("active", mode === "mega");

  updateSidebarListAll();
}

// サイドバー更新
function updateSidebarListAll() {
  const listElem = document.getElementById("sidebarList");
  listElem.innerHTML = "";

  if (!data || data.length === 0) {
    const li = document.createElement("li");
    li.textContent = "読み込み中...";
    listElem.appendChild(li);
    return;
  }

  let list = [...data];

  if (sidebarFilter === "mega") {
    list = list.filter(d => d.mega === 1);
  }

  const sorted = list.sort((a, b) => a.no - b.no);

  sorted.forEach(d => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="col-no">${String(d.no).padStart(4, "0")}</span>
      <span class="col-name">${d.name}</span>
      <span class="col-mega">${d.mega === 1 ? "○" : ""}</span>
    `;

    listElem.appendChild(li);
  });
}
