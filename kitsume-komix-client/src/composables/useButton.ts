export interface ButtonOptions {
  severity?: 'primary' | 'secondary' | 'info' | 'success' | 'danger'
  text?: boolean
  size?: 'small'
  rounded?: boolean
  disabled?: boolean
  loading?: boolean
}

export function getButtonClasses(opts: ButtonOptions): string {
  const classes: string[] = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-brand/50',
  ]

  if (opts.size === 'small') {
    classes.push('text-sm', 'px-3', 'py-1.5')
  } else {
    classes.push('text-sm', 'px-4', 'py-2')
  }

  if (opts.text) {
    classes.push('bg-transparent', 'hover:bg-surface-overlay')
    if (opts.severity === 'info') {
      classes.push('text-text-secondary', 'hover:text-blue-500')
    } else if (opts.severity === 'danger') {
      classes.push('text-text-secondary', 'hover:text-brand-danger')
    } else if (opts.severity === 'success') {
      classes.push('text-text-secondary', 'hover:text-green-500')
    } else {
      classes.push('text-text-secondary', 'hover:text-text-primary')
    }
  } else if (opts.severity === 'info') {
    classes.push('bg-blue-500', 'text-white', 'hover:bg-blue-600')
  } else if (opts.severity === 'danger') {
    classes.push('bg-brand-danger', 'text-white', 'hover:brightness-110')
  } else if (opts.severity === 'success') {
    classes.push('bg-green-600', 'text-white', 'hover:bg-green-700')
  } else if (opts.severity === 'secondary') {
    classes.push('bg-surface-elevated', 'text-text-primary', 'border', 'border-surface-overlay', 'hover:bg-surface-overlay')
  } else {
    classes.push('bg-brand', 'text-white', 'hover:brightness-110')
  }

  if (opts.rounded) {
    classes.push('rounded-full')
  } else {
    classes.push('rounded-lg')
  }

  if (opts.disabled) {
    classes.push('opacity-50', 'cursor-not-allowed')
  }
  if (opts.loading) {
    classes.push('opacity-80', 'pointer-events-none')
  }

  return classes.join(' ')
}
