import { SelectProps, RefSelectProps } from '../generate';

// =================================== Shared Type ===================================
export type Key = string | number;

export type RawValueType = string | number;

export interface LabelValueType {
  key?: Key;
  value?: RawValueType;
  label?: React.ReactNode;
}
export type DefaultValueType = RawValueType | RawValueType[] | LabelValueType | LabelValueType[];

export interface DisplayLabelValueType extends LabelValueType {
  disabled?: boolean;
}

export type SingleType<MixType> = MixType extends (infer Single)[] ? Single : MixType;

// ==================================== Generator ====================================
export type GetLabeledValue<FOT extends FlattenOptionsType> = (
  value: RawValueType,
  config: {
    options: FOT;
    prevValue: DefaultValueType;
    labelInValue: boolean;
    optionLabelProp: string;
  },
) => LabelValueType;

export type FilterOptions<OptionsType extends object[]> = (
  searchValue: string,
  options: OptionsType,
  /** Component props, since Select & TreeSelect use different prop name, use any here */
  config: { optionFilterProp: string; filterOption: boolean | FilterFunc<OptionsType[number]> },
) => OptionsType;

export type FilterFunc<OptionType> = (inputValue: string, option?: OptionType) => boolean;

export declare function RefSelectFunc<OptionsType extends object[], ValueType>(
  Component: React.RefForwardingComponent<RefSelectProps, SelectProps<OptionsType, ValueType>>,
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectProps<OptionsType, ValueType>> & React.RefAttributes<RefSelectProps>
>;

export type FlattenOptionsType<OptionsType extends object[] = object[]> = {
  key: Key;
  data: OptionsType[number];
  /** Used for customize data */
  [name: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}[];
