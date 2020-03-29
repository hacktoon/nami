import { Random } from '/lib/random'
import { NumberInterpolation, clamp } from '/lib/number'


const CHARS = '0123456789ABCDEF'


export function gradientColors(source, target, count) {
    let start = Color.fromHex(source),
        end = Color.fromHex(target)
    let red = NumberInterpolation(start.red, end.red, count),
        green = NumberInterpolation(start.green, end.green, count),
        blue = NumberInterpolation(start.blue, end.blue, count),
        colors = []

    for (let i = 0; i < count; i++) {
        let color = new Color(red[i], green[i], blue[i])
        colors.push(color.toHex())
    }
    return colors
}


export class Color {
    constructor(red=Random.int(255), green=Random.int(255), blue=Random.int(255)) {
        this.red = clamp(red, 0, 255)
        this.green = clamp(green, 0, 255)
        this.blue = clamp(blue, 0, 255)
    }

    toHex() {
        const hex = n => CHARS.charAt((n - n % 16) / 16) + CHARS.charAt(n % 16)
        return '#' + hex(this.red) + hex(this.green) + hex(this.blue)
    }

    static fromHex(string) {
        let hex = string.replace('#', '')

        if (hex.length == 3)
            hex = expandShorthand(hex)

        return new Color(
            parseInt(hex.substring(0,2), 16),
            parseInt(hex.substring(2,4), 16),
            parseInt(hex.substring(4,6), 16)
        )
    }
}


const expandShorthand = hex => {
    return [
        hex[0] + hex[0],
        hex[1] + hex[1],
        hex[2] + hex[2]
    ].join('')
}