import { mount } from '@vue/test-utils'
import Panel from '@/components/common/Panel.vue'

describe('Panel', () => {
  it('renders title text', () => {
    const wrapper = mount(Panel, { props: { title: '测试标题' } })
    expect(wrapper.text()).toContain('测试标题')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(Panel, {
      props: { title: '标题', subtitle: '副标题' },
    })
    expect(wrapper.text()).toContain('副标题')
  })

  it('does not render subtitle element when not provided', () => {
    const wrapper = mount(Panel, { props: { title: '标题' } })
    // The v-if on subtitle means the element should not exist
    const subtitleEl = wrapper.findAll('.text-xs.text-muted-foreground')
    expect(subtitleEl).toHaveLength(0)
  })

  it('renders default slot content', () => {
    const wrapper = mount(Panel, {
      props: { title: '标题' },
      slots: { default: '<p>插槽内容</p>' },
    })
    expect(wrapper.text()).toContain('插槽内容')
  })

  it('renders actions slot content', () => {
    const wrapper = mount(Panel, {
      props: { title: '标题' },
      slots: { actions: '<button>操作按钮</button>' },
    })
    expect(wrapper.text()).toContain('操作按钮')
  })

  it('has correct CSS classes on root element', () => {
    const wrapper = mount(Panel, { props: { title: '标题' } })
    const root = wrapper.find('section')
    expect(root.classes()).toContain('panel-modern')
    expect(root.classes()).toContain('flex')
    expect(root.classes()).toContain('flex-col')
  })
})
