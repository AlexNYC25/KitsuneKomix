import type { ObjectDirective, DirectiveBinding } from 'vue'

interface TooltipValue {
  value: string
  showDelay?: number
}

type TooltipBindingValue = string | TooltipValue

interface TooltipState {
  cleanup: () => void
}

const tooltipStates = new WeakMap<HTMLElement, TooltipState>()

function parseValue(binding: DirectiveBinding<TooltipBindingValue>): { text: string; delay: number } {
  if (typeof binding.value === 'string') {
    return { text: binding.value, delay: 500 }
  }
  return {
    text: binding.value.value,
    delay: binding.value.showDelay ?? 500,
  }
}

function getPosition(modifiers: Partial<Record<string, boolean>>): string {
  if (modifiers.top) return 'top'
  if (modifiers.bottom) return 'bottom'
  if (modifiers.left) return 'left'
  if (modifiers.right) return 'right'
  return 'bottom'
}

function createTooltipEl(text: string): HTMLDivElement {
  const el = document.createElement('div')
  el.textContent = text
  el.className = 'fixed z-50 px-2 py-1 text-xs font-medium rounded whitespace-nowrap pointer-events-none transition-opacity duration-150'
  el.style.backgroundColor = 'var(--color-bg-inverse, #1f2937)'
  el.style.color = 'var(--color-text-inverse, #ffffff)'
  el.style.opacity = '0'
  el.style.border = '1px solid var(--color-border, #e5e7eb)'
  el.setAttribute('role', 'tooltip')
  return el
}

function positionTooltip(tooltipEl: HTMLDivElement, target: HTMLElement, position: string): void {
  const targetRect = target.getBoundingClientRect()
  const gap = 6

  const pos = { top: 0, left: 0 }

  switch (position) {
    case 'top':
      pos.top = targetRect.top - gap
      pos.left = targetRect.left + targetRect.width / 2
      tooltipEl.style.transform = 'translate(-50%, -100%)'
      break
    case 'bottom':
      pos.top = targetRect.bottom + gap
      pos.left = targetRect.left + targetRect.width / 2
      tooltipEl.style.transform = 'translate(-50%, 0)'
      break
    case 'left':
      pos.top = targetRect.top + targetRect.height / 2
      pos.left = targetRect.left - gap
      tooltipEl.style.transform = 'translate(-100%, -50%)'
      break
    case 'right':
      pos.top = targetRect.top + targetRect.height / 2
      pos.left = targetRect.right + gap
      tooltipEl.style.transform = 'translate(0, -50%)'
      break
  }

  tooltipEl.style.top = `${pos.top}px`
  tooltipEl.style.left = `${pos.left}px`
}

const tooltipDirective: ObjectDirective<HTMLElement, TooltipBindingValue> = {
  mounted(el, binding) {
    const { text, delay } = parseValue(binding)
    const position = getPosition(binding.modifiers)
    let tooltipEl: HTMLDivElement | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const show = () => {
      if (tooltipEl) return
      tooltipEl = createTooltipEl(text)
      document.body.appendChild(tooltipEl)
      positionTooltip(tooltipEl, el, position)
      requestAnimationFrame(() => {
        if (tooltipEl) tooltipEl.style.opacity = '1'
      })
    }

    const hide = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      if (tooltipEl) {
        tooltipEl.style.opacity = '0'
        setTimeout(() => {
          if (tooltipEl && tooltipEl.parentNode) {
            tooltipEl.parentNode.removeChild(tooltipEl)
          }
          tooltipEl = null
        }, 150)
      }
    }

    const onEnter = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(show, delay)
    }

    const onLeave = () => {
      hide()
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('focus', onEnter)
    el.addEventListener('blur', onLeave)

    tooltipStates.set(el, {
      cleanup: () => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.removeEventListener('focus', onEnter)
        el.removeEventListener('blur', onLeave)
        hide()
      },
    })
  },

  unmounted(el) {
    const state = tooltipStates.get(el)
    if (state) {
      state.cleanup()
      tooltipStates.delete(el)
    }
  },
}

export default tooltipDirective
