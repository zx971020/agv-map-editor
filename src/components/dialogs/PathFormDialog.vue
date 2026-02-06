<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? '编辑路径' : '创建路径' }}</DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-4">
        <!-- 起始节点 -->
        <div class="space-y-2">
          <Label for="startNode" :class="['after:content-[\'_*\'] after:text-red-500']">
            起始节点
          </Label>
          <NodeSelect
            id="startNode"
            v-model="formData.startNode"
            placeholder="选择起始节点"
            :disabled="!!initialStartNode"
          />
          <p v-if="errors.startNode" class="text-sm text-red-500">{{ errors.startNode }}</p>
        </div>

        <!-- 结束节点 -->
        <div class="space-y-2">
          <Label for="endNode" :class="['after:content-[\'_*\'] after:text-red-500']">
            结束节点
          </Label>
          <NodeSelect
            id="endNode"
            v-model="formData.endNode"
            placeholder="选择结束节点"
          />
          <p v-if="errors.endNode" class="text-sm text-red-500">{{ errors.endNode }}</p>
        </div>

        <!-- 路径类型 -->
        <div class="space-y-2">
          <Label for="lineType">路径类型</Label>
          <Select v-model="formData.lineType">
            <SelectTrigger>
              <SelectValue placeholder="选择路径类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="item in lineTypeOptions"
                :key="item.value"
                :value="parseInt(item.value)"
              >
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 控制点（仅弧线时显示） -->
        <div v-if="formData.lineType === 1" class="space-y-4">
          <div class="space-y-2">
            <Label for="cpx" :class="['after:content-[\'_*\'] after:text-red-500']">
              控制点 X
            </Label>
            <Input
              id="cpx"
              v-model="formData.cpx"
              type="number"
              step="0.01"
              placeholder="输入控制点 X 坐标"
            />
            <p v-if="errors.cpx" class="text-sm text-red-500">{{ errors.cpx }}</p>
          </div>

          <div class="space-y-2">
            <Label for="cpy" :class="['after:content-[\'_*\'] after:text-red-500']">
              控制点 Y
            </Label>
            <Input
              id="cpy"
              v-model="formData.cpy"
              type="number"
              step="0.01"
              placeholder="输入控制点 Y 坐标"
            />
            <p v-if="errors.cpy" class="text-sm text-red-500">{{ errors.cpy }}</p>
          </div>
        </div>

        <!-- 车道方向 -->
        <div class="space-y-2">
          <Label for="laneDir">车道方向</Label>
          <Select v-model="formData.laneDir">
            <SelectTrigger>
              <SelectValue placeholder="选择车道方向" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="item in lineDirectionOptions"
                :key="item.value"
                :value="parseInt(item.value)"
              >
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 速度 -->
        <div class="space-y-2">
          <Label for="speed">速度</Label>
          <Input
            id="speed"
            v-model="formData.speed"
            type="number"
            step="0.1"
            min="0"
            placeholder="输入速度限制"
          />
        </div>

        <!-- 航向角字段（可折叠） -->
        <details class="space-y-4 rounded-lg border p-4">
          <summary class="cursor-pointer font-medium text-sm text-slate-700 dark:text-slate-300">
            高级选项（航向角）
          </summary>

          <div class="space-y-4 pt-2">
            <div class="space-y-2">
              <Label for="positiveCourse">正向航向角</Label>
              <Input
                id="positiveCourse"
                v-model="formData.positiveCourse"
                type="number"
                step="0.1"
                placeholder="输入正向航向角"
              />
            </div>

            <div class="space-y-2">
              <Label for="negativeCourse">反向航向角</Label>
              <Input
                id="negativeCourse"
                v-model="formData.negativeCourse"
                type="number"
                step="0.1"
                placeholder="输入反向航向角"
              />
            </div>

            <div class="space-y-2">
              <Label for="carBodyPositiveCourse">车体正向航向角</Label>
              <Input
                id="carBodyPositiveCourse"
                v-model="formData.carBodyPositiveCourse"
                type="number"
                step="0.1"
                placeholder="输入车体正向航向角"
              />
            </div>

            <div class="space-y-2">
              <Label for="carBodyNegativeCourse">车体反向航向角</Label>
              <Input
                id="carBodyNegativeCourse"
                v-model="formData.carBodyNegativeCourse"
                type="number"
                step="0.1"
                placeholder="输入车体反向航向角"
              />
            </div>
          </div>
        </details>

        <!-- 表单按钮 -->
        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">
            取消
          </Button>
          <Button type="submit">
            {{ isEdit ? '保存' : '创建' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useCanvasStore } from '@/stores/canvasStore'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import NodeSelect from '@/components/ui/NodeSelect.vue'
import dictData from '@/assets/dict.json'

const props = defineProps<{
  open: boolean
  initialStartNode?: number | null // 从右键菜单传入的起始节点
  pathId?: string | null // 编辑模式时传入路径 ID
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const canvasStore = useCanvasStore()

// 字典选项
const lineTypeOptions = dictData.lineType
const lineDirectionOptions = dictData.lineDirection

// 表单数据
const formData = reactive({
  startNode: null as number | null,
  endNode: null as number | null,
  lineType: 0, // 默认直线
  cpx: undefined as number | undefined,
  cpy: undefined as number | undefined,
  laneDir: 1, // 默认双向
  speed: 0,
  positiveCourse: 0,
  negativeCourse: 0,
  carBodyPositiveCourse: 0,
  carBodyNegativeCourse: 0,
})

// 表单错误
const errors = reactive({
  startNode: '',
  endNode: '',
  cpx: '',
  cpy: '',
})

// 是否为编辑模式
const isEdit = ref(false)

// 监听对话框打开状态，初始化表单
watch(
  () => props.open,
  (newOpen) => {
    if (newOpen) {
      resetForm()
      
      // 如果有初始起始节点，设置它
      if (props.initialStartNode !== undefined && props.initialStartNode !== null) {
        formData.startNode = props.initialStartNode
      }

      // 如果是编辑模式，加载路径数据
      if (props.pathId) {
        isEdit.value = true
        loadPathData(props.pathId)
      } else {
        isEdit.value = false
      }
    }
  }
)

// 重置表单
const resetForm = () => {
  formData.startNode = null
  formData.endNode = null
  formData.lineType = 0
  formData.cpx = undefined
  formData.cpy = undefined
  formData.laneDir = 1
  formData.speed = 0
  formData.positiveCourse = 0
  formData.negativeCourse = 0
  formData.carBodyPositiveCourse = 0
  formData.carBodyNegativeCourse = 0

  errors.startNode = ''
  errors.endNode = ''
  errors.cpx = ''
  errors.cpy = ''
}

// 加载路径数据（编辑模式）
const loadPathData = (pathId: string) => {
  const path = canvasStore.pathLines.find(p => p.id === pathId)
  if (path) {
    formData.startNode = path.startNode
    formData.endNode = path.endNode
    formData.lineType = path.lineType
    formData.cpx = path.cpx
    formData.cpy = path.cpy
    formData.laneDir = path.laneDir
    formData.speed = path.speed
    formData.positiveCourse = path.positiveCourse
    formData.negativeCourse = path.negativeCourse
    formData.carBodyPositiveCourse = path.carBodyPositiveCourse
    formData.carBodyNegativeCourse = path.carBodyNegativeCourse
  }
}

// 表单验证
const validateForm = (): boolean => {
  let isValid = true

  // 重置错误
  errors.startNode = ''
  errors.endNode = ''
  errors.cpx = ''
  errors.cpy = ''

  // 验证起始节点
  if (formData.startNode === null) {
    errors.startNode = '请选择起始节点'
    isValid = false
  }

  // 验证结束节点
  if (formData.endNode === null) {
    errors.endNode = '请选择结束节点'
    isValid = false
  }

  // 验证节点不能相同
  if (formData.startNode !== null && formData.endNode !== null) {
    if (formData.startNode === formData.endNode) {
      errors.endNode = '起始节点和结束节点不能相同'
      isValid = false
    }
  }

  // 验证节点是否存在
  if (formData.startNode !== null) {
    const startNodeExists = canvasStore.nodes.some(n => n.node === formData.startNode)
    if (!startNodeExists) {
      errors.startNode = '起始节点不存在'
      isValid = false
    }
  }

  if (formData.endNode !== null) {
    const endNodeExists = canvasStore.nodes.some(n => n.node === formData.endNode)
    if (!endNodeExists) {
      errors.endNode = '结束节点不存在'
      isValid = false
    }
  }

  // 验证弧线控制点
  if (formData.lineType === 1) {
    if (formData.cpx === undefined || formData.cpx === null || isNaN(formData.cpx)) {
      errors.cpx = '弧线路径必须输入控制点 X 坐标'
      isValid = false
    }
    if (formData.cpy === undefined || formData.cpy === null || isNaN(formData.cpy)) {
      errors.cpy = '弧线路径必须输入控制点 Y 坐标'
      isValid = false
    }
  }

  return isValid
}

// 提交表单
const handleSubmit = () => {
  if (!validateForm()) {
    return
  }

  // 构建路径数据
  const pathData = {
    startNode: formData.startNode!,
    endNode: formData.endNode!,
    lineType: formData.lineType,
    laneDir: formData.laneDir,
    speed: formData.speed,
    positiveCourse: formData.positiveCourse,
    negativeCourse: formData.negativeCourse,
    carBodyPositiveCourse: formData.carBodyPositiveCourse,
    carBodyNegativeCourse: formData.carBodyNegativeCourse,
    ...(formData.lineType === 1 && {
      cpx: formData.cpx!,
      cpy: formData.cpy!,
    }),
  }

  if (isEdit.value && props.pathId) {
    // 编辑模式：更新路径
    canvasStore.updatePathLine(props.pathId, pathData)
  } else {
    // 创建模式：添加新路径
    canvasStore.addPathFromData(pathData)
  }

  // 触发成功事件并关闭对话框
  emit('success')
  handleOpenChange(false)
}

// 取消操作
const handleCancel = () => {
  handleOpenChange(false)
}

// 处理对话框打开状态变化
const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>

<style scoped>
/* details 样式优化 */
details[open] {
  background-color: hsl(var(--muted) / 0.3);
}

summary {
  user-select: none;
}

summary:hover {
  color: hsl(var(--primary));
}
</style>
