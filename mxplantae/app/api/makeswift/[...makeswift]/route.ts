import { MakeswiftApiHandler } from '@makeswift/runtime/next/server'
import { strict } from 'assert'

import '@/lib/makeswift/components'
import { runtime } from '@/lib/makeswift/runtime'

strict(process.env.MAKESWIFT_SITE_API_KEY, 'c5158450-d593-404d-b926-4bf0236f8184  ')

const handler = MakeswiftApiHandler(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  getFonts() {
    return [
      {
        family: 'var(--font-inter)',
        label: 'Inter',
        variants: [
          { weight: '300', style: 'normal' },
          { weight: '300', style: 'italic' },
          { weight: '400', style: 'normal' },
          { weight: '400', style: 'italic' },
          { weight: '700', style: 'normal' },
          { weight: '800', style: 'normal' },
        ],
      },
    ]
  },
})

export { handler as GET, handler as POST, handler as OPTIONS }
