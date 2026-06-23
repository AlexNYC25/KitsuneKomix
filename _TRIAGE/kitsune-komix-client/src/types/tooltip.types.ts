export interface TooltipValue {
  value: string
  showDelay?: number
}

export type TooltipBindingValue = string | TooltipValue

export interface TooltipState {
  cleanup: () => void
}
