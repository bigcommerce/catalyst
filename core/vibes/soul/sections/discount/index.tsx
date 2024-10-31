'use client';

import { BcImage } from '~/components/bc-image';
import { useEffect, useState } from 'react';

import { clsx } from 'clsx';
import { X } from 'lucide-react';

import { Button } from '@/vibes/soul/primitives/button';

interface DiscountType {
  label: string;
  code: string;
}

interface Props {
  backgroundImage: string;
  discounts: DiscountType[];
}

export const Discount = function Discount({ backgroundImage, discounts }: Props) {
  // TODO: store dismissed state in local storage
  const [dismissed, setDismissed] = useState(false);
  const [spin, setSpin] = useState(false);
  const [isSpun, setIsSpun] = useState(false);
  const [shuffledCodes, setShuffledCodes] = useState<DiscountType[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (spin) {
      setTimeout(() => {
        setIsSpun(true);
      }, 5000);
    }
  }, [spin]);

  useEffect(() => {
    const shuffled = shuffleCodes(
      Array<DiscountType>(10)
        .fill(discounts[0])
        .flatMap(() => discounts),
    );
    setShuffledCodes(shuffled);
  }, [discounts]);

  const shuffleCodes = (array: DiscountType[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shuffledCodes[shuffledCodes.length - 2].code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log('Failed to copy:', error);
    }
  };

  return (
    <section
      className={clsx(
        'fixed left-0 top-0 flex h-dvh w-full items-center justify-center bg-contrast-100 text-background transition-[opacity,transform] duration-300 @container',
        dismissed ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100',
      )}
    >
      <BcImage
        src={backgroundImage}
        alt="Background image"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
        }}
        className="absolute right-5 top-5 text-foreground transition-transform hover:scale-110"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Desktop Version */}
      <button
        onClick={() => {
          if (isSpun) {
            void copy();
          } else {
            setSpin(true);
          }
        }}
        className="z-10 m-5 hidden h-24 w-full max-w-4xl cursor-pointer items-center justify-between gap-10 overflow-hidden rounded-3xl bg-primary-shadow transition-transform active:scale-[0.99] @4xl:flex"
      >
        <DiscountUI
          isSpun={isSpun}
          copied={copied}
          spin={spin}
          setSpin={setSpin}
          discounts={discounts}
          shuffledCodes={shuffledCodes}
          copy={copy}
        />
      </button>

      {/* Mobile Version */}
      <div className="z-10 m-5 flex w-full max-w-xs cursor-pointer flex-col items-center justify-between overflow-hidden rounded-3xl transition-transform @4xl:hidden">
        <DiscountUI
          isSpun={isSpun}
          copied={copied}
          spin={spin}
          setSpin={setSpin}
          discounts={discounts}
          shuffledCodes={shuffledCodes}
          copy={copy}
          renderButton
        />
      </div>
    </section>
  );
};

const DiscountUI = ({
  isSpun,
  copied,
  spin,
  setSpin,
  discounts,
  shuffledCodes,
  copy,
  renderButton,
}: {
  isSpun: boolean;
  copied: boolean;
  spin: boolean;
  setSpin: (value: boolean) => void;
  discounts: DiscountType[];
  shuffledCodes: DiscountType[];
  copy: () => Promise<void>;
  renderButton?: boolean;
}) => {
  let discountText = 'Spin for discount';
  if (isSpun) {
    discountText = copied ? 'Copied!' : `Copy discount code`;
  }

  return (
    <>
      <h2 className="flex min-h-20 w-full select-none items-center justify-center bg-primary-shadow py-3 text-center text-3xl font-medium leading-none @4xl:mb-0 @4xl:justify-start @4xl:bg-transparent @4xl:px-6 @4xl:text-5xl">
        {discountText}
      </h2>
      <div className="flex w-full max-w-xs flex-col gap-4 rounded-b-3xl bg-background px-6 pb-6 pt-4 @4xl:rounded-t-3xl @4xl:p-0">
        <div className="relative h-[100px] w-full overflow-hidden bg-background text-foreground before:absolute before:left-0 before:top-0 before:z-10 before:h-8 before:w-full before:bg-gradient-to-b before:from-background before:to-transparent after:absolute after:bottom-0 after:left-0 after:z-10 after:h-8 after:w-full after:bg-gradient-to-t after:from-background after:to-transparent @4xl:max-w-72">
          <div
            className="absolute -top-8 left-0 w-full transition-all [transition-duration:5000ms] [transition-timing-function:cubic-bezier(0.285,-0.125,0.050,1.130)]"
            style={{
              transform: spin
                ? `translateY(calc(-100% + ${discounts.length * 33}px))`
                : 'translateY(0)',
            }}
          >
            {shuffledCodes.map((discount, index) => (
              <div
                key={index}
                className="flex select-none items-center justify-center py-1 text-5xl font-medium uppercase leading-[1] tracking-[-1px] text-foreground transition-transform duration-500 @4xl:justify-end @4xl:px-6"
              >
                {discount.label}
              </div>
            ))}
          </div>
        </div>
        {renderButton === true && (
          <Button
            variant="secondary"
            className="w-full select-none justify-center"
            onClick={() => {
              if (isSpun) {
                void copy();
              } else {
                setSpin(true);
              }
            }}
          >
            {isSpun ? 'Copy' : 'Spin'}
          </Button>
        )}
      </div>
    </>
  );
};
