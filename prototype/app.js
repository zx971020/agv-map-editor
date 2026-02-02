const canvasStage = document.getElementById("canvasStage");
const canvasContent = document.getElementById("canvasContent");
const canvasViewport = document.getElementById("canvasViewport");
const emptyHint = document.getElementById("emptyHint");
const zoomRange = document.getElementById("zoomRange");
const zoomValue = document.getElementById("zoomValue");
const selectedLabel = document.getElementById("selectedLabel");
const clearSelectionButton = document.getElementById("clearSelection");
const propertiesPanel = document.getElementById("propertiesPanel");
const propertiesToggle = document.getElementById("propertiesToggle");

const propName = document.getElementById("propName");
const propType = document.getElementById("propType");
const propX = document.getElementById("propX");
const propY = document.getElementById("propY");
const propW = document.getElementById("propW");
const propH = document.getElementById("propH");

let currentScale = 1;
let selectedNode = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const updateEmptyHint = () => {
  emptyHint.style.display = canvasContent.children.length ? "none" : "block";
};

const updateSelection = (node) => {
  if (selectedNode) {
    selectedNode.classList.remove("selected");
  }
  selectedNode = node;
  if (selectedNode) {
    selectedNode.classList.add("selected");
    selectedLabel.textContent = selectedNode.dataset.label || "已选择";
    propName.value = selectedNode.dataset.label || "";
    propType.value = selectedNode.dataset.type || "";
    propX.value = Math.round(parseFloat(selectedNode.style.left) || 0);
    propY.value = Math.round(parseFloat(selectedNode.style.top) || 0);
    propW.value = Math.round(selectedNode.offsetWidth);
    propH.value = Math.round(selectedNode.offsetHeight);
  } else {
    selectedLabel.textContent = "未选择";
    propName.value = "";
    propType.value = "";
    propX.value = "";
    propY.value = "";
    propW.value = "";
    propH.value = "";
  }
};

const createNode = ({ type, label, x, y }) => {
  const node = document.createElement("div");
  node.className = "node";
  node.dataset.type = type;
  node.dataset.label = label;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;

  node.innerHTML = `
    <div class="node-icon">${label.slice(0, 1)}</div>
    <div class="node-label">${label}</div>
  `;

  node.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    updateSelection(node);
    isDragging = true;
    const rect = node.getBoundingClientRect();
    dragOffset = {
      x: (event.clientX - rect.left) / currentScale,
      y: (event.clientY - rect.top) / currentScale,
    };
  });

  node.addEventListener("click", (event) => {
    event.stopPropagation();
    updateSelection(node);
  });

  canvasContent.appendChild(node);
  updateEmptyHint();
  updateSelection(node);
};

const toCanvasPoint = (clientX, clientY) => {
  const rect = canvasViewport.getBoundingClientRect();
  const x = (clientX - rect.left + canvasViewport.scrollLeft) / currentScale;
  const y = (clientY - rect.top + canvasViewport.scrollTop) / currentScale;
  return { x, y };
};

document.querySelectorAll(".element-card").forEach((card) => {
  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", "");
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: card.dataset.type,
        label: card.dataset.label,
      })
    );
  });
});

canvasViewport.addEventListener("dragover", (event) => {
  event.preventDefault();
});

canvasViewport.addEventListener("drop", (event) => {
  event.preventDefault();
  const data = event.dataTransfer.getData("application/json");
  if (!data) return;
  const payload = JSON.parse(data);
  const point = toCanvasPoint(event.clientX, event.clientY);
  createNode({
    type: payload.type,
    label: payload.label,
    x: point.x - 46,
    y: point.y - 36,
  });
});

canvasViewport.addEventListener("click", () => {
  updateSelection(null);
});

document.addEventListener("mousemove", (event) => {
  if (!isDragging || !selectedNode) return;
  const point = toCanvasPoint(event.clientX, event.clientY);
  const newX = point.x - dragOffset.x;
  const newY = point.y - dragOffset.y;
  selectedNode.style.left = `${Math.max(0, newX)}px`;
  selectedNode.style.top = `${Math.max(0, newY)}px`;
  propX.value = Math.round(newX);
  propY.value = Math.round(newY);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

const syncNodeFromInputs = () => {
  if (!selectedNode) return;
  selectedNode.dataset.label = propName.value || selectedNode.dataset.label;
  const labelEl = selectedNode.querySelector(".node-label");
  if (labelEl) labelEl.textContent = selectedNode.dataset.label;
  const iconEl = selectedNode.querySelector(".node-icon");
  if (iconEl) iconEl.textContent = selectedNode.dataset.label.slice(0, 1);

  const nextX = Number(propX.value);
  const nextY = Number(propY.value);
  const nextW = Number(propW.value);
  const nextH = Number(propH.value);

  if (!Number.isNaN(nextX)) selectedNode.style.left = `${nextX}px`;
  if (!Number.isNaN(nextY)) selectedNode.style.top = `${nextY}px`;
  if (!Number.isNaN(nextW) && nextW > 20) selectedNode.style.width = `${nextW}px`;
  if (!Number.isNaN(nextH) && nextH > 20) selectedNode.style.height = `${nextH}px`;
};

[
  propName,
  propX,
  propY,
  propW,
  propH,
].forEach((input) => {
  input.addEventListener("input", syncNodeFromInputs);
});

clearSelectionButton.addEventListener("click", () => {
  updateSelection(null);
});

zoomRange.addEventListener("input", (event) => {
  const value = Number(event.target.value);
  currentScale = value / 100;
  canvasStage.style.transform = `scale(${currentScale})`;
  zoomValue.textContent = `${value}%`;
});

// 属性栏折叠/展开功能
const togglePropertiesPanel = () => {
  propertiesPanel.classList.toggle("collapsed");
  document.querySelector(".app").classList.toggle("properties-collapsed");
  
  // 保存折叠状态到 localStorage
  const isCollapsed = propertiesPanel.classList.contains("collapsed");
  localStorage.setItem("propertiesPanelCollapsed", isCollapsed);
};

propertiesToggle.addEventListener("click", togglePropertiesPanel);

// 键盘快捷键支持：Ctrl + \ 切换属性栏
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "\\") {
    event.preventDefault();
    togglePropertiesPanel();
  }
});

// 页面加载时恢复上次的折叠状态
const savedCollapsedState = localStorage.getItem("propertiesPanelCollapsed");
if (savedCollapsedState === "true") {
  propertiesPanel.classList.add("collapsed");
  document.querySelector(".app").classList.add("properties-collapsed");
}

updateEmptyHint();
