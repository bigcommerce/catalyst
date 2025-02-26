'use client'

/* eslint-env browser */

import { useState, useEffect, forwardRef, Ref, useImperativeHandle } from 'react'

import { useIsomorphicLayoutEffect } from 'swr/_internal'
import clsx from 'clsx'

type Props = {
  id?: string
  html?: string
  width?: string
  margin?: string
}

const defaultHtml = `<div style="padding: 24px; background-color: rgba(161, 168, 194, 0.18); overflow: hidden;">
<svg width="316" height="168" viewBox="0 0 316 168" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="70" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="78" width="30" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect x="116" width="78" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect y="20" width="120" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="128" y="20" width="30" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect x="166" y="20" width="78" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect y="60" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="20" y="80" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="40" y="100" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="88" y="100" width="110" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect x="206" y="100" width="24" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect x="238" y="100" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="40" y="120" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="88" y="120" width="50" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect x="146" y="120" width="24" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect x="178" y="120" width="90" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.25"/>
<rect x="276" y="120" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect x="20" y="140" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
<rect y="160" width="40" height="8" rx="2" fill="#A1A8C2" fill-opacity="0.5"/>
</svg>
</div>`

// const defaultHtml = `<div style="padding: 24px; background-color: rgba(161, 168, 194, 0.18); overflow: hidden;">
//   <p style="color: #A1A8C2">Embed Component</p>
// </div>` 


const SCRIPT_TAG = 'script'

const Embed = forwardRef(function Embed(
  { id, width, margin, html = defaultHtml }: Props,
  ref: Ref<HTMLDivElement | null>,
) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useIsomorphicLayoutEffect(() => {
    setShouldRender(true)
  }, [])

  useImperativeHandle(ref, () => container, [container])

  useEffect(() => {
    if (!container) return

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode(node: Element) {
        return node.tagName.toLowerCase() === SCRIPT_TAG
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT
      },
    })

    const nodes: Element[] = []
    while (walker.nextNode()) nodes.push(walker.currentNode as Element)

        async function executeScripts() {
            for (let node of nodes) {
              await new Promise<void>(resolve => {
                const script = document.createElement(SCRIPT_TAG)
          
                if (node.textContent) {
                  script.textContent = node.textContent
                }
          
                Array.from(node.attributes).forEach(attr => {
                  if (attr.name !== 'src' || attr.value.trim() !== '') {
                    script.setAttribute(attr.name, attr.value)
                  }
                })
          
                script.onload = () => resolve()
                script.onerror = () => resolve()
                node.replaceWith(script)
          
                if (!script.hasAttribute('src')) resolve()
              })
            }
          }

    executeScripts().catch(console.error)
  }, [container, html])


  useEffect(() => {
    if (!container) return

    const images = container.querySelectorAll('img')
    images.forEach(img => {
      if (!img.getAttribute('src')) {
        img.setAttribute('src', 'placeholder.png') // Set a default placeholder
      }
    })
  }, [container])

  const className = clsx(width, margin)

  if (shouldRender === false) return null

  return (
    <div
      ref={setContainer}
      id={id}
      className={clsx(className, width, margin)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})

export default Embed