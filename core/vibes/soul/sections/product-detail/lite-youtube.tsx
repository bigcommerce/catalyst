'use client';

// lite-youtube-embed is a tiny, dependency-free custom element that renders a
// YouTube facade (poster + play button) and only injects the real iframe on
// click — the standard "third-party facade" pattern. The CSS styles the element.
import 'lite-youtube-embed/src/lite-yt-embed.css';

import type { CSSProperties } from 'react';

// Register the <lite-youtube> custom element on the client only: the package
// subclasses HTMLElement at import time, which isn't defined during SSR. The
// element still renders as inert markup on the server and upgrades on hydration.
if (typeof window !== 'undefined') {
  void import('lite-youtube-embed');
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lite-youtube': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        videoid: string;
        playlabel?: string;
        params?: string;
      };
    }
  }
}

export interface LiteYouTubeProps {
  videoId: string;
  /** Visually-hidden label for the play button (accessibility). */
  playLabel: string;
  className?: string;
  style?: CSSProperties;
}

export function LiteYouTube({ videoId, playLabel, className, style }: LiteYouTubeProps) {
  return (
    <lite-youtube
      className={className}
      params="rel=0"
      playlabel={playLabel}
      style={style}
      videoid={videoId}
    />
  );
}
