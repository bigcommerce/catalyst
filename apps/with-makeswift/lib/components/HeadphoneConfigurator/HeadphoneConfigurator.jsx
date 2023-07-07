import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button } from '../Button';

const DEFAULT_MATERIAL_COLORS = {
  Base: '#eeeeee',
  Mesh: '#cccccc',
  Cushion: '#eeeeee',
  Speaker: '#ffffff',
};

const DEFAULT_COLOR_OPTIONS = ['#80C9DB', '#AC73C0', '#F1B074', '#F5A0BD', '#DDE4EE', '#000000'];

const DynamicHeadphoneCanvas = dynamic(
  () => import('./HeadphoneCanvas').then(({ HeadphoneCanvas }) => HeadphoneCanvas),
  {
    loading: () => (
      <Image alt="headphones-placeholder" className="blur" fill src="/headphones.png" />
    ),
  },
);

export function HeadphoneConfigurator({
  className = '',
  enableRotate = false,
  colorOptions = DEFAULT_COLOR_OPTIONS,
}) {
  const [materialColors, setMaterialColors] = useState(DEFAULT_MATERIAL_COLORS);
  const [hoveredMaterial, setHoveredMaterial] = useState(null);
  const [focusedMaterial, setFocusedMaterial] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hoveredMaterial) return () => {};

    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${materialColors[hoveredMaterial]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`;

    document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(cursor)}'), auto`;

    return () =>
      (document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(auto)}'), auto`);
  }, [hoveredMaterial, materialColors]);

  return (
    <div className={clsx('relative aspect-square', className)}>
      {visible && (
        <DynamicHeadphoneCanvas
          enableRotate={enableRotate}
          materialColors={materialColors}
          onMaterialClick={setFocusedMaterial}
          onMaterialHover={setHoveredMaterial}
        />
      )}
      <div className="absolute bottom-0 left-0 mb-12 w-full text-center">
        <p className="text-h3 font-bold uppercase text-white">
          {hoveredMaterial || focusedMaterial}
        </p>
        <div className="mt-6 flex w-full justify-center gap-4">
          {colorOptions.map((color, index) => (
            <button
              className={clsx(
                'relative h-12 w-12 rounded-full after:absolute after:rounded-full after:ring-2 after:ring-white after:transition-all enabled:hover:after:-inset-1',
                color === materialColors[focusedMaterial] ? 'after:-inset-1' : 'after:inset-0',
              )}
              disabled={!focusedMaterial}
              key={index}
              onClick={() => setMaterialColors((prev) => ({ ...prev, [focusedMaterial]: color }))}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      {!visible && (
        <div className="absolute inset-0">
          <Image className="blur" fill src="/headphones.png" />
          <div className="absolute left-1/2 top-1/2 z-10 w-[500px] -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-6 text-h3 font-bold uppercase leading-none text-white md:mb-8 md:text-h2">
              Headphones made to truly fit you
            </div>
            <Button onClick={() => setVisible(true)} variant="secondary">
              Start customizing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
