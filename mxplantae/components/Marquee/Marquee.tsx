import Image from 'next/image'
import React, { CSSProperties, Ref, forwardRef } from 'react'

import clsx from 'clsx'

type Logo = {
  logoImage?: { url: string; dimensions: { width: number; height: number } }
  logoAlt: string
  logoWidth: number
}

type Props = {
  className?: string
  logos: Logo[]
  fadeEdges?: boolean
  duration?: number
}

export const Marquee = forwardRef(function Marquee(
  { className, logos, fadeEdges = true, duration = 120 }: Props,
  ref: Ref<HTMLDivElement>
) {
  const scrollingImages = (
    <div className="flex min-w-full shrink-0 grow-0 animate-scrollLeft items-center gap-x-12 px-6 md:gap-x-24 md:px-12">
      {logos.map(({ logoImage, logoAlt, logoWidth = 120 }, index) => {
        if (logoImage == null) {
          return <div key={index} className="h-[60px] w-[120px] rounded-lg bg-black/10" />
        }

        return (
          <Image
            key={index}
            src={logoImage.url}
            alt={logoAlt}
            width={logoWidth}
            height={logoWidth / (logoImage.dimensions.width / logoImage.dimensions.height)}
          />
        )
      })}
    </div>
  )

  return (
    <div
      className={className}
      ref={ref}
      style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
    >
      {logos.length === 0 ? (
        <div className="p-6 text-center text-lg">There are no images. Try adding some.</div>
      ) : (
        <div
          className={clsx(
            fadeEdges &&
              '[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)] [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]',
            'relative flex w-full flex-row items-center overflow-hidden'
          )}
        >
          {scrollingImages}
          {scrollingImages}
        </div>
      )}
    </div>
  )
})

export default Marquee
