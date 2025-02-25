/**
 * Cursor rule:
 * 1. Only `showSearch` enabled
 * 2. Only `open` is `true`
 * 3. When typing, set `open` to `true` which hit rule of 2
 *
 * Accessibility:
 * - https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html
 */

import * as React from 'react';
import KeyCode from 'rc-util/lib/KeyCode';
import MultipleSelector from './MultipleSelector';
import SingleSelector from './SingleSelector';
import { LabelValueType, RawValueType } from '../interface/generator';
import { RenderNode, Mode } from '../interface';

export interface InnerSelectorProps {
  prefixCls: string;
  id: string;
  mode: Mode;

  inputRef: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  values: LabelValueType[];
  showSearch?: boolean;
  searchValue: string;
  accessibilityIndex: number;
  open: boolean;
  tabIndex?: number;

  onInputKeyDown: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export interface RefSelectorProps {
  focus: () => void;
  blur: () => void;
}

export interface SelectorProps {
  id: string;
  prefixCls: string;
  showSearch?: boolean;
  open: boolean;
  /** Display in the Selector value, it's not same as `value` prop */
  values: LabelValueType[];
  multiple: boolean;
  mode: Mode;
  searchValue: string;
  activeValue: string;
  inputElement: JSX.Element;

  autoFocus?: boolean;
  accessibilityIndex: number;
  tabIndex?: number;
  disabled?: boolean;
  placeholder?: React.ReactNode;
  removeIcon?: RenderNode;

  // Tags
  maxTagCount?: number;
  maxTagTextLength?: number;
  maxTagPlaceholder?: (omittedValues: LabelValueType[]) => React.ReactNode;

  // Motion
  choiceTransitionName?: string;

  onToggleOpen: (open?: boolean) => void;
  /** `onSearch` returns go next step boolean to check if need do toggle open */
  onSearch: (searchValue: string) => boolean;
  onSelect: (value: RawValueType, option: { selected: boolean }) => void;
  onInputKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

const Selector: React.RefForwardingComponent<RefSelectorProps, SelectorProps> = (props, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    prefixCls,
    multiple,

    onSearch,
    onToggleOpen,
    onInputKeyDown,
  } = props;

  // ======================= Ref =======================
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    blur: () => {
      inputRef.current.blur();
    },
  }));

  // ====================== Input ======================
  const onInternalInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = event => {
    const { which } = event;

    if (which === KeyCode.UP || which === KeyCode.DOWN) {
      event.preventDefault();
    }

    if (onInputKeyDown) {
      onInputKeyDown(event);
    }

    if (![KeyCode.SHIFT, KeyCode.TAB, KeyCode.BACKSPACE, KeyCode.ESC].includes(which)) {
      onToggleOpen(true);
    }
  };

  const onInputChange = ({ target: { value } }) => {
    if (onSearch(value) !== false) {
      onToggleOpen(true);
    }
  };

  // ====================== Focus ======================
  // Should focus input if click the selector
  const onClick = ({ target }) => {
    if (target !== inputRef.current) {
      inputRef.current.focus();
    }
  };

  const onMouseDown: React.MouseEventHandler<HTMLElement> = event => {
    if (event.target !== inputRef.current) {
      event.preventDefault();
    }

    onToggleOpen();
  };

  // ================= Inner Selector ==================
  const sharedProps = {
    inputRef,
    onInputKeyDown: onInternalInputKeyDown,
    onInputChange,
  };

  const selectNode = multiple ? (
    <MultipleSelector {...props} {...sharedProps} />
  ) : (
    <SingleSelector {...props} {...sharedProps} />
  );

  return (
    <div className={`${prefixCls}-selector`} onClick={onClick} onMouseDown={onMouseDown}>
      {selectNode}
    </div>
  );
};

const ForwardSelector = React.forwardRef<RefSelectorProps, SelectorProps>(Selector);
ForwardSelector.displayName = 'Selector';

export default ForwardSelector;
