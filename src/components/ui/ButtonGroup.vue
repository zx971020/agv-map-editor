<template>
  <div :class="groupClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ButtonGroupProps {
  vertical?: boolean
  attached?: boolean
}

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  vertical: false,
  attached: false,
})

const groupClasses = computed(() => {
  const classes = ['inline-flex']

  if (props.vertical) {
    classes.push('flex-col')
  }

  if (props.attached) {
    classes.push(props.vertical ? 'button-group-vertical' : 'button-group-horizontal')
  } else {
    classes.push(props.vertical ? 'gap-1' : 'gap-1.5')
  }

  return classes.join(' ')
})
</script>

<style scoped>
/* 水平连接按钮组 */
.button-group-horizontal > :deep(button:not(:first-child)) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -1px;
}

.button-group-horizontal > :deep(button:not(:last-child)) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* 垂直连接按钮组 */
.button-group-vertical > :deep(button:not(:first-child)) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  margin-top: -1px;
}

.button-group-vertical > :deep(button:not(:last-child)) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
