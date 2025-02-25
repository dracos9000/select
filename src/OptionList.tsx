import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import classNames from 'classnames';
import List from 'rc-virtual-list';
import TransBtn from './TransBtn';
import {
  OptionsType as SelectOptionsType,
  FlattenOptionData as SelectFlattenOptionData,
  OptionData,
  RenderNode,
} from './interface';
import { RawValueType, FlattenOptionsType } from './interface/generator';

export interface OptionListProps<OptionsType extends object[]> {
  prefixCls: string;
  id: string;
  options: OptionsType;
  flattenOptions: FlattenOptionsType<OptionsType>;
  height: number;
  itemHeight: number;
  values: Set<RawValueType>;
  multiple: boolean;
  open: boolean;
  defaultActiveFirstOption?: boolean;
  notFoundContent?: React.ReactNode;
  menuItemSelectedIcon?: RenderNode;
  childrenAsData: boolean;
  searchValue: string;

  onSelect: (value: RawValueType, option: { selected: boolean }) => void;
  onToggleOpen: (open?: boolean) => void;
  /** Tell Select that some value is now active to make accessibility work */
  onActiveValue: (value: RawValueType, index: number) => void;
  onScroll: React.UIEventHandler<HTMLDivElement>;
}

export interface RefOptionListProps {
  onKeyDown: React.KeyboardEventHandler;
  onKeyUp: React.KeyboardEventHandler;
}

/**
 * Using virtual list of option display.
 * Will fallback to dom if use customize render.
 */
const OptionList: React.RefForwardingComponent<
  RefOptionListProps,
  OptionListProps<SelectOptionsType>
> = (
  {
    prefixCls,
    id,
    flattenOptions,
    childrenAsData,
    values,
    searchValue,
    multiple,
    defaultActiveFirstOption,
    height,
    itemHeight,
    notFoundContent,
    open,
    menuItemSelectedIcon,
    onSelect,
    onToggleOpen,
    onActiveValue,
    onScroll,
  },
  ref,
) => {
  const itemPrefixCls = `${prefixCls}-item`;

  // =========================== List ===========================
  const listRef = React.useRef<List>(null);

  const onListMouseDown: React.MouseEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
  };

  const scrollIntoView = (index: number) => {
    if (listRef.current) {
      listRef.current.scrollTo({ index });
    }
  };

  // ========================== Active ==========================
  const getEnabledActiveIndex = (index: number, offset: number = 1): number => {
    const len = flattenOptions.length;

    for (let i = 0; i < len; i += 1) {
      const current = (index + i * offset + len) % len;

      const { group, data } = flattenOptions[current];
      if (!group && !(data as OptionData).disabled) {
        return current;
      }
    }

    return -1;
  };

  const [activeIndex, setActiveIndex] = React.useState(() => getEnabledActiveIndex(0));
  const setActive = (index: number) => {
    setActiveIndex(index);

    // Trigger active event
    const flattenItem = flattenOptions[index];
    if (!flattenItem) {
      onActiveValue(null, -1);
      return;
    }

    onActiveValue((flattenItem.data as OptionData).value, index);
  };

  // Auto active first item when list length or searchValue changed
  React.useEffect(() => {
    setActive(defaultActiveFirstOption !== false ? getEnabledActiveIndex(0) : -1);
  }, [flattenOptions.length, searchValue]);

  // Auto scroll to item position in single mode
  React.useEffect(() => {
    if (!multiple && open && values.size === 1) {
      const value: RawValueType = Array.from(values)[0];
      const index = flattenOptions.findIndex(({ data }) => (data as OptionData).value === value);
      setActive(index);
      scrollIntoView(index);
    }
  }, [open]);

  // ========================== Values ==========================
  const onSelectValue = (value: RawValueType) => {
    if (value !== null) {
      onSelect(value, { selected: !values.has(value) });
    }

    // Single mode should always close by select
    if (!multiple) {
      onToggleOpen(false);
    }
  };

  // ========================= Keyboard =========================
  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ which }) => {
      switch (which) {
        // >>> Arrow keys
        case KeyCode.UP:
        case KeyCode.DOWN: {
          let offset = 0;
          if (which === KeyCode.UP) {
            offset = -1;
          } else if (which === KeyCode.DOWN) {
            offset = 1;
          }

          if (offset !== 0) {
            const nextActiveIndex = getEnabledActiveIndex(activeIndex + offset, offset);
            scrollIntoView(nextActiveIndex);
            setActive(nextActiveIndex);
          }

          break;
        }

        // >>> Select
        case KeyCode.ENTER: {
          // value
          const item = flattenOptions[activeIndex];
          if (item && !(item.data as OptionData).disabled) {
            onSelectValue((item.data as OptionData).value);
          } else {
            onSelectValue(null);
          }

          break;
        }

        // >>> Close
        case KeyCode.ESC: {
          onToggleOpen(false);
        }
      }
    },
    onKeyUp: () => {},
  }));

  // ========================== Render ==========================
  if (flattenOptions.length === 0) {
    return (
      <div
        role="listbox"
        id={`${id}_list`}
        className={`${itemPrefixCls}-empty`}
        onMouseDown={onListMouseDown}
      >
        {notFoundContent}
      </div>
    );
  }

  function renderItem(index: number) {
    const item = flattenOptions[index];
    const value = item && (item.data as OptionData).value;
    return item ? (
      <div key={index} role="option" id={`${id}_list_${index}`} aria-selected={values.has(value)}>
        {value}
      </div>
    ) : null;
  }

  return (
    <>
      <div role="listbox" id={`${id}_list`} style={{ height: 0, overflow: 'hidden' }}>
        {renderItem(activeIndex - 1)}
        {renderItem(activeIndex)}
        {renderItem(activeIndex + 1)}
      </div>
      <List<SelectFlattenOptionData>
        itemKey="key"
        ref={listRef}
        data={flattenOptions}
        height={height}
        itemHeight={itemHeight}
        fullHeight={false}
        onMouseDown={onListMouseDown}
        onScroll={onScroll}
      >
        {({ group, groupOption, data }, itemIndex) => {
          const { label, key } = data;

          // Group
          if (group) {
            return (
              <div className={classNames(itemPrefixCls, `${itemPrefixCls}-group`)}>
                {label !== undefined ? label : key}
              </div>
            );
          }

          const { disabled, value, children } = data as OptionData;

          // Option
          const selected = values.has(value);

          const optionPrefixCls = `${itemPrefixCls}-option`;
          const optionClassName = classNames(itemPrefixCls, optionPrefixCls, {
            [`${optionPrefixCls}-grouped`]: groupOption,
            [`${optionPrefixCls}-active`]: activeIndex === itemIndex && !disabled,
            [`${optionPrefixCls}-disabled`]: disabled,
            [`${optionPrefixCls}-selected`]: selected,
          });

          const mergedLabel = childrenAsData ? children : label;

          const iconVisible =
            !menuItemSelectedIcon || typeof menuItemSelectedIcon === 'function' || selected;

          return (
            <div
              aria-selected={selected}
              className={optionClassName}
              onMouseMove={() => {
                if (activeIndex === itemIndex || disabled) {
                  return;
                }

                setActive(itemIndex);
              }}
              onClick={() => {
                if (!disabled) {
                  onSelectValue(value);
                }
              }}
            >
              <div className={`${optionPrefixCls}-content`}>{mergedLabel || value}</div>
              {React.isValidElement(menuItemSelectedIcon) || selected}
              {iconVisible && (
                <TransBtn
                  className={`${itemPrefixCls}-option-state`}
                  customizeIcon={menuItemSelectedIcon}
                  customizeIconProps={{ isSelected: selected }}
                >
                  {selected ? '✓' : null}
                </TransBtn>
              )}
            </div>
          );
        }}
      </List>
    </>
  );
};

const RefOptionList = React.forwardRef<RefOptionListProps, OptionListProps<SelectOptionsType>>(
  OptionList,
);
RefOptionList.displayName = 'OptionList';

export default RefOptionList;
