import { isNumber } from '../../is';

export default function rgb255ToRgb1(rgb) {
    return {
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255,
        a: isNumber(rgb.a)
            ? rgb.a
            : 1 /* eslint-disable-line no-restricted-globals */,
    };
}
