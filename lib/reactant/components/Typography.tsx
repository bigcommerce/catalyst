import React, { PropsWithChildren } from 'react';

import { ComponentClasses } from './types';

type TextProps = React.HTMLAttributes<HTMLParagraphElement> & PropsWithChildren;
type Text = React.FC<TextProps> & ComponentClasses<'default' | 'regular' | 'helping'>;

export const Text: Text = ({ children, ...props }) => {
  return <p {...props}>{children}</p>;
};

Text.default = {
  className: 'font-normal leading-[1.7em]',
};

Text.regular = {
  className: 'text-base',
};

Text.helping = {
  className: 'text-[0.8rem] lg:text-xs',
};

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & PropsWithChildren;
type Heading = React.FC<HeadingProps> & ComponentClasses<'default'>;

export const H1: Heading = ({ children, ...props }) => {
  return <h1 {...props}>{children}</h1>;
};

H1.default = {
  className: 'font-black leading-[1.3em] text-[3.052rem] lg:text-[4.209rem]',
};

export const H2: Heading = ({ children, ...props }) => {
  return <h2 {...props}>{children}</h2>;
};

H2.default = {
  className: 'font-black leading-[1.3em] text-[2.441rem] lg:text-[3.157rem]',
};

export const H3: Heading = ({ children, ...props }) => {
  return <h3 {...props}>{children}</h3>;
};

H3.default = {
  className: 'font-black leading-[1.3em] text-[2.369rem]',
};

export const H4: Heading = ({ children, ...props }) => {
  return <h4 {...props}>{children}</h4>;
};

H4.default = {
  className: 'font-bold leading-[1.3em] text-[1.953rem] lg:text-[1.777rem]',
};

export const H5: Heading = ({ children, ...props }) => {
  return <h5 {...props}>{children}</h5>;
};

H5.default = {
  className: 'font-bold leading-[1.3em] text-xl lg:text-[1.333rem]',
};

export const H6: Heading = ({ children, ...props }) => {
  return <h6 {...props}>{children}</h6>;
};

H6.default = {
  className: 'font-bold leading-[1.3em] text-base',
};
