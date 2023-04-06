interface ClassName {
  className: string;
}

export type ComponentClasses<Union extends string> = Record<Union, ClassName>;
