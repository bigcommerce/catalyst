import { ComponentPropsWithoutRef } from 'react'

import * as LabelPrimitive from '@radix-ui/react-label'
import { clsx } from 'clsx'

export function Label({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      {...rest}
      className={clsx('font-mono text-xs uppercase text-contrast-500', className)}
    />
  )
}
