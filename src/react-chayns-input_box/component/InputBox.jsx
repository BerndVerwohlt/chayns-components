import { useRect } from '@reach/rect';
import classnames from 'clsx';
import PropTypes from 'prop-types';
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import Overlay from '../../components/overlay/Overlay';
import Input from '../../react-chayns-input/component/Input';
import { isFunction } from '../../utils/is';

const InputBox = React.forwardRef((props, ref) => {
    const {
        inputComponent: InputComponent,
        children,
        parent,
        inputRef,
        onFocus,
        className,
        overlayProps,
        boxClassName,
        style,
        onBlur,
        ...restProps
    } = props;

    const wrapperRef = useRef();
    const boxRef = useRef();

    const [isHidden, setIsHidden] = useState(true);

    const rect = useRect(wrapperRef);

    useImperativeHandle(
        ref,
        () => ({
            focus() {
                setIsHidden(false);
            },
            blur() {
                setIsHidden(true);
            },
        }),
        []
    );

    useEffect(() => {
        function handleBlur(event) {
            if (isHidden) return;

            if (
                wrapperRef.current?.contains(event.target) ||
                boxRef.current?.contains(event.target)
            ) {
                return;
            }

            setIsHidden(true);

            if (onBlur && isFunction(onBlur)) {
                onBlur(event);
            }
        }

        function hide() {
            setIsHidden(true);
        }

        function handleKeyDown({ keyCode, target }) {
            if (keyCode === 9 && wrapperRef.current?.contains(target)) {
                hide();
            }
        }

        document.addEventListener('mousedown', handleBlur);
        document.addEventListener('touchstart', handleBlur);

        window.addEventListener('blur', hide);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleBlur);
            document.removeEventListener('touchstart', handleBlur);

            window.removeEventListener('blur', hide);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isHidden, onBlur]);

    function handleFocus(e) {
        setIsHidden(false);

        if (onFocus) {
            return onFocus(e);
        }
        return null;
    }

    const setBoxRef = useCallback(
        (node) => {
            boxRef.current = node;

            if (overlayProps?.ref) {
                overlayProps.ref(node);
            }
        },
        [overlayProps]
    );

    if (!InputComponent) {
        return null;
    }

    const positionStyles = rect
        ? {
              width: `${rect.width}px`,
              top: `${rect.bottom}px`,
              left: `${rect.left}px`,
          }
        : null;

    return (
        <div
            style={{
                display: 'inline-block',
                ...style,
            }}
            className={classnames('cc__input-box', className)}
            ref={wrapperRef}
        >
            <InputComponent
                {...restProps}
                ref={inputRef}
                onFocus={handleFocus}
            />
            <Overlay parent={parent}>
                {!!(rect && !isHidden && children) && (
                    <div
                        onClick={(e) => e.preventDefault()}
                        className={classnames(
                            'cc__input-box__overlay',
                            'scrollbar',
                            boxClassName
                        )}
                        style={{
                            ...positionStyles,
                            ...overlayProps?.style,
                        }}
                        {...overlayProps}
                        ref={setBoxRef}
                    >
                        {children}
                    </div>
                )}
            </Overlay>
        </div>
    );
});

InputBox.propTypes = {
    onBlur: PropTypes.func,
    inputComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    parent:
        typeof Element !== 'undefined'
            ? PropTypes.instanceOf(Element)
            : () => {},
    onFocus: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(PropTypes.node),
    ]),
    className: PropTypes.string,
    boxClassName: PropTypes.string,
    inputRef: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    overlayProps: PropTypes.object,
    style: PropTypes.objectOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
};

InputBox.defaultProps = {
    onBlur: null,
    inputComponent: Input,
    parent: null,
    onFocus: null,
    children: null,
    className: null,
    boxClassName: null,
    inputRef: null,
    overlayProps: null,
    style: null,
};

InputBox.displayName = 'InputBox';

export default InputBox;
