import * as React from 'react';
import { Key } from './generator';

export type RenderNode = React.ReactNode | ((props: any) => React.ReactNode);

export type Mode = 'multiple' | 'tags' | 'combobox';

// ======================== Option ========================
export interface OptionData {
  key?: Key;
  disabled?: boolean;
  value: Key;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: React.ReactNode;
  /** @deprecated Only works when use `children` as option data */
  children?: React.ReactNode;

  /** Save for customize data */
  [prop: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface OptionGroupData {
  key?: Key;
  label?: React.ReactNode;
  options: OptionData[];
  className?: string;
  style?: React.CSSProperties;

  /** Save for customize data */
  [prop: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type OptionsType = (OptionData | OptionGroupData)[];

export interface FlattenOptionData {
  group?: boolean;
  groupOption?: boolean;
  key: string | number;
  data: OptionData | OptionGroupData;
}
