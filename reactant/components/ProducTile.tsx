import { PropsWithChildren } from 'react';

import { ComponentClasses } from './types';

type PProps = PropsWithChildren<React.HTMLAttributes<HTMLParagraphElement>>;
type P = React.FC<PProps> & ComponentClasses<'default'>;

export const P: P = ({ children, ...props }) => {
  return <p {...props}>{children}</p>;
};

P.default = {
  className: 'leading-7 text-base',
};

type H3Props = PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>;
type H3 = React.FC<H3Props> & ComponentClasses<'default'>;

export const H3: H3 = ({ children, ...props }) => {
  return <h3 {...props}>{children}</h3>;
};

H3.default = {
  className: 'font-bold leading-6 text-xl',
};

type FigureProps = PropsWithChildren<React.HTMLAttributes<HTMLElement>>;

const Figure: ProductTile['Figure'] = ({ children, ...props }) => {
  return <figure {...props}>{children}</figure>;
};

Figure.default = {
  className: 'group/cardFigure mt-0 overflow-hidden p-0.5 relative bg-white mb-0',
};

type FigCaptionProps = PropsWithChildren<React.HTMLAttributes<HTMLElement>>;

const FigCaption: ProductTile['FigCaption'] = ({ children, ...props }) => {
  return <figcaption {...props}>{children}</figcaption>;
};

FigCaption.default = {
  className:
    'absolute hidden inset-0 w-full m-0 py-6 text-center group-hover/cardFigure:inline-flex flex-col justify-end',
};

type BodyProps = PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

const Body: ProductTile['Body'] = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

Body.default = {
  className: 'group/cardBody',
};

type ProductTileProps = PropsWithChildren<React.HTMLAttributes<HTMLElement>>;
type ProductTile = React.FC<ProductTileProps> &
  ComponentClasses<'default'> & {
    Figure: React.FC<FigureProps> & ComponentClasses<'default'>;
    FigCaption: React.FC<FigCaptionProps> & ComponentClasses<'default'>;
    Body: React.FC<BodyProps> & ComponentClasses<'default'>;
  };

export const ProductTile: ProductTile = ({ children, ...props }) => {
  return <article {...props}>{children}</article>;
};

ProductTile.default = {
  className: 'flex flex-col justify-start bg-transparent p-0 min-h-[430px]',
};

ProductTile.Figure = Figure;
ProductTile.FigCaption = FigCaption;
ProductTile.Body = Body;
