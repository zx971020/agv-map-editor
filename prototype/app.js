const canvasStage = document.getElementById('canvasStage')
const canvasContent = document.getElementById('canvasContent')
const canvasViewport = document.getElementById('canvasViewport')
const emptyHint = document.getElementById('emptyHint')
const zoomRange = document.getElementById('zoomRange')
const zoomValue = document.getElementById('zoomValue')
const selectedLabel = document.getElementById('selectedLabel')
const clearSelectionButton = document.getElementById('clearSelection')
const propertiesPanel = document.getElementById('propertiesPanel')
const propertiesToggle = document.getElementById('propertiesToggle')

const propName = document.getElementById('propName')
const propType = document.getElementById('propType')
const propX = document.getElementById('propX')
const propY = document.getElementById('propY')
const propW = document.getElementById('propW')
const propH = document.getElementById('propH')

let currentScale = 1
let selectedNode = null
let isDragging = false
let dragOffset = { x: 0, y: 0 }

const updateEmptyHint = () => {
  emptyHint.style.display = canvasContent.children.length ? 'none' : 'block'
}

const updateSelection = node => {
  if (selectedNode) {
    selectedNode.classList.remove('selected')
  }
  selectedNode = node
  if (selectedNode) {
    selectedNode.classList.add('selected')
    selectedLabel.textContent = selectedNode.dataset.label || '已选择'
    propName.value = selectedNode.dataset.label || ''
    propType.value = selectedNode.dataset.type || ''
    propX.value = Math.round(parseFloat(selectedNode.style.left) || 0)
    propY.value = Math.round(parseFloat(selectedNode.style.top) || 0)
    propW.value = Math.round(selectedNode.offsetWidth)
    propH.value = Math.round(selectedNode.offsetHeight)
  } else {
    selectedLabel.textContent = '未选择'
    propName.value = ''
    propType.value = ''
    propX.value = ''
    propY.value = ''
    propW.value = ''
    propH.value = ''
  }
}

const createNode = ({ type, label, x, y }) => {
  const node = document.createElement('div')
  node.className = 'node'
  node.dataset.type = type
  node.dataset.label = label
  node.style.left = `${Math.max(0, x)}px`
  node.style.top = `${Math.max(0, y)}px`
  node.setAttribute('tabindex', '0') // 支持键盘焦点

  node.innerHTML = `
    <div class="node-icon">${label.slice(0, 1)}</div>
    <div class="node-label">${label}</div>
  `

  // 鼠标按下开始拖拽
  node.addEventListener('mousedown', event => {
    if (event.button !== 0) return // 只响应左键
    event.stopPropagation()
    updateSelection(node)
    isDragging = true
    const rect = node.getBoundingClientRect()
    dragOffset = {
      x: (event.clientX - rect.left) / currentScale,
      y: (event.clientY - rect.top) / currentScale,
    }
  })

  // 点击选中
  node.addEventListener('click', event => {
    event.stopPropagation()
    updateSelection(node)
  })

  // 双击编辑标签
  node.addEventListener('dblclick', event => {
    event.stopPropagation()
    propName.focus()
    propName.select()
  })

  canvasContent.appendChild(node)
  updateEmptyHint()
  updateSelection(node)

  return node
}

const toCanvasPoint = (clientX, clientY) => {
  const rect = canvasViewport.getBoundingClientRect()
  const x = (clientX - rect.left + canvasViewport.scrollLeft) / currentScale
  const y = (clientY - rect.top + canvasViewport.scrollTop) / currentScale
  return { x, y }
}

document.querySelectorAll('.element-card').forEach(card => {
  card.addEventListener('dragstart', event => {
    event.dataTransfer.setData('text/plain', '')
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: card.dataset.type,
        label: card.dataset.label,
      })
    )
  })
})

canvasViewport.addEventListener('dragover', event => {
  event.preventDefault()
})

canvasViewport.addEventListener('drop', event => {
  event.preventDefault()
  const data = event.dataTransfer.getData('application/json')
  if (!data) return
  const payload = JSON.parse(data)

  // 检查是否按住 Shift 键启用网格吸附
  const enableSnap = event.shiftKey
  const point = toCanvasPointWithSnap(event.clientX, event.clientY, enableSnap)

  let x = point.x - 46
  let y = point.y - 36

  // 应用网格吸附
  if (enableSnap) {
    x = snapToGrid(x)
    y = snapToGrid(y)
  }

  createNode({
    type: payload.type,
    label: payload.label,
    x,
    y,
  })
})

canvasViewport.addEventListener('click', () => {
  updateSelection(null)
})

document.addEventListener('mousemove', event => {
  if (!isDragging || !selectedNode) return

  // 检查是否按住 Shift 键启用网格吸附
  const enableSnap = event.shiftKey
  const point = toCanvasPointWithSnap(event.clientX, event.clientY, enableSnap)

  let newX = point.x - dragOffset.x
  let newY = point.y - dragOffset.y

  // 应用网格吸附
  if (enableSnap) {
    newX = snapToGrid(newX)
    newY = snapToGrid(newY)
  }

  selectedNode.style.left = `${Math.max(0, newX)}px`
  selectedNode.style.top = `${Math.max(0, newY)}px`
  propX.value = Math.round(newX)
  propY.value = Math.round(newY)
})

document.addEventListener('mouseup', () => {
  isDragging = false
})

const syncNodeFromInputs = () => {
  if (!selectedNode) return

  // 更新标签
  const newLabel = propName.value.trim()
  if (newLabel) {
    selectedNode.dataset.label = newLabel
    const labelEl = selectedNode.querySelector('.node-label')
    if (labelEl) labelEl.textContent = newLabel
    const iconEl = selectedNode.querySelector('.node-icon')
    if (iconEl) iconEl.textContent = newLabel.slice(0, 1)
  }

  // 更新位置和尺寸
  const nextX = Number(propX.value)
  const nextY = Number(propY.value)
  const nextW = Number(propW.value)
  const nextH = Number(propH.value)

  if (!Number.isNaN(nextX) && nextX >= 0) selectedNode.style.left = `${nextX}px`
  if (!Number.isNaN(nextY) && nextY >= 0) selectedNode.style.top = `${nextY}px`
  if (!Number.isNaN(nextW) && nextW >= 20) selectedNode.style.width = `${nextW}px`
  if (!Number.isNaN(nextH) && nextH >= 20) selectedNode.style.height = `${nextH}px`
}

;[propName, propX, propY, propW, propH].forEach(input => {
  input.addEventListener('input', syncNodeFromInputs)
})

clearSelectionButton.addEventListener('click', () => {
  updateSelection(null)
})

// 删除按钮功能
const deleteButton = document.getElementById('deleteButton')
if (deleteButton) {
  deleteButton.addEventListener('click', () => {
    if (selectedNode) {
      deleteSelectedNode()
    }
  })
}

zoomRange.addEventListener('input', event => {
  const value = Number(event.target.value)
  currentScale = value / 100
  canvasStage.style.transform = `scale(${currentScale})`
  zoomValue.textContent = `${value}%`
})

// 属性栏折叠/展开功能
const togglePropertiesPanel = () => {
  propertiesPanel.classList.toggle('collapsed')
  document.querySelector('.app').classList.toggle('properties-collapsed')

  // 保存折叠状态到 localStorage
  const isCollapsed = propertiesPanel.classList.contains('collapsed')
  localStorage.setItem('propertiesPanelCollapsed', isCollapsed)
}

propertiesToggle.addEventListener('click', togglePropertiesPanel)

// 键盘快捷键支持
document.addEventListener('keydown', event => {
  // Ctrl + \ 切换属性栏
  if (event.ctrlKey && event.key === '\\') {
    event.preventDefault()
    togglePropertiesPanel()
    return
  }

  // Delete 或 Backspace 删除选中元素
  if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNode) {
    event.preventDefault()
    deleteSelectedNode()
    return
  }

  // Escape 取消选择
  if (event.key === 'Escape' && selectedNode) {
    event.preventDefault()
    updateSelection(null)
    return
  }

  // 方向键移动选中元素
  if (selectedNode && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault()
    const step = event.shiftKey ? 10 : 1 // Shift 加速移动
    const currentX = parseFloat(selectedNode.style.left) || 0
    const currentY = parseFloat(selectedNode.style.top) || 0

    switch (event.key) {
      case 'ArrowUp':
        selectedNode.style.top = `${Math.max(0, currentY - step)}px`
        break
      case 'ArrowDown':
        selectedNode.style.top = `${currentY + step}px`
        break
      case 'ArrowLeft':
        selectedNode.style.left = `${Math.max(0, currentX - step)}px`
        break
      case 'ArrowRight':
        selectedNode.style.left = `${currentX + step}px`
        break
    }

    // 更新属性面板
    propX.value = Math.round(parseFloat(selectedNode.style.left) || 0)
    propY.value = Math.round(parseFloat(selectedNode.style.top) || 0)
    return
  }

  // Ctrl + D 复制选中元素
  if (event.ctrlKey && event.key === 'd' && selectedNode) {
    event.preventDefault()
    duplicateSelectedNode()
    return
  }
})

// 删除选中节点
const deleteSelectedNode = () => {
  if (!selectedNode) return
  const nodeToDelete = selectedNode
  updateSelection(null)
  nodeToDelete.remove()
  updateEmptyHint()
}

// 复制选中节点
const duplicateSelectedNode = () => {
  if (!selectedNode) return
  const offset = 20 // 复制偏移量
  createNode({
    type: selectedNode.dataset.type,
    label: selectedNode.dataset.label,
    x: (parseFloat(selectedNode.style.left) || 0) + offset,
    y: (parseFloat(selectedNode.style.top) || 0) + offset,
  })
}

// 网格吸附功能
const snapToGrid = (value, gridSize = 20) => {
  return Math.round(value / gridSize) * gridSize
}

// 改进的坐标转换，支持网格吸附
const toCanvasPointWithSnap = (clientX, clientY, enableSnap = false) => {
  const point = toCanvasPoint(clientX, clientY)
  if (enableSnap) {
    point.x = snapToGrid(point.x)
    point.y = snapToGrid(point.y)
  }
  return point
}

// 页面加载时恢复上次的折叠状态
const savedCollapsedState = localStorage.getItem('propertiesPanelCollapsed')
if (savedCollapsedState === 'true') {
  propertiesPanel.classList.add('collapsed')
  document.querySelector('.app').classList.add('properties-collapsed')
}

updateEmptyHint()
