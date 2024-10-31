'use client'

import { Suspense, use } from 'react'

import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

import { Drawer, DrawerItem } from '../drawer'

interface Props {
  items: DrawerItem[] | Promise<DrawerItem[]>
  paramName?: string
}

function CompareDrawerInner({ items, paramName = 'compare' }: Props) {
  const resolved = items instanceof Promise ? use(items) : items
  const [, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false })
  )

  return (
    resolved.length > 0 && (
      <Drawer
        items={resolved}
        onRemoveClick={id => {
          setParam(prev => {
            const next = prev?.filter(v => v !== id) ?? []

            return next.length > 0 ? next : null
          })
        }}
        cta={{ label: 'Compare', href: '/compare' }}
      />
    )
  )
}

export function CompareDrawer(props: Props) {
  return (
    <Suspense fallback={null}>
      <CompareDrawerInner {...props} />
    </Suspense>
  )
}
