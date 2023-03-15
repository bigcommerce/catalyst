import { PropsWithChildren } from 'react';

interface ClassName {
  className: string;
}

type ComponentProps<Props, VariantKey extends string> = React.FC<Props> &
  Record<VariantKey, ClassName>;

type PProps = React.HTMLAttributes<HTMLParagraphElement> & PropsWithChildren;
type P = ComponentProps<PProps, 'default'>;

export const P: P = ({ children, ...props }) => {
  return <p {...props}>{children}</p>;
};

P.default = {
  className: 'leading-7 text-base ',
};

type H3Props = React.HTMLAttributes<HTMLHeadingElement> & PropsWithChildren;
type H3 = ComponentProps<H3Props, 'default'>;

export const H3: H3 = ({ children, ...props }) => {
  return <h3 {...props}>{children}</h3>;
};

H3.default = {
  className: 'font-bold leading-6 text-xl',
};

interface ProductPrice {
  prices: {
    price: {
      formatted: string;
    } | null;
  };
}

type ProductPriceProps = React.HTMLAttributes<HTMLDivElement> & ProductPrice;
type ProductPriceComponent = ComponentProps<ProductPriceProps, 'default'>;

export const ProductPrice: ProductPriceComponent = ({ prices }) => (
  <div className={ProductPrice.default.className}>
    <p className="text-base">{prices.price?.formatted}</p>
  </div>
);

ProductPrice.default = {
  className: 'card-text relative py-1',
};

type FigureProps = React.HTMLAttributes<HTMLElement> & PropsWithChildren;
type Figure = ComponentProps<FigureProps, 'default'>;

type FigCaptionProps = React.HTMLAttributes<HTMLElement> & PropsWithChildren;
type FigCaption = ComponentProps<FigCaptionProps, 'default'>;

type BodyProps = React.HTMLAttributes<HTMLDivElement> & PropsWithChildren;
type Body = ComponentProps<BodyProps, 'default'>;

type ProductTileProps = React.HTMLAttributes<HTMLElement> & PropsWithChildren;
type ProductTile = ComponentProps<ProductTileProps, 'default'> & {
  Figure: Figure;
  FigCaption: FigCaption;
  Body: Body;
};

const Figure: Figure = ({ children, ...props }) => {
  return <figure {...props}>{children}</figure>;
};

Figure.default = {
  className: 'group/cardFigure mt-0 overflow-hidden p-0.5 relative bg-white mb-0',
};

const FigCaption: FigCaption = ({ children, ...props }) => {
  return <figure {...props}>{children}</figure>;
};

FigCaption.default = {
  className:
    'absolute hidden inset-0 w-full m-0 py-6 text-center group-hover/cardFigure:inline-flex flex-col justify-end',
};

const Body: Body = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

Body.default = {
  className: 'group/cardBody',
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
