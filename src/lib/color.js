import { Random } from '/src/lib/random'
import { interpolateNumbers, clamp } from '/src/lib/number'


const CHARS = '0123456789ABCDEF'


export function gradientColors(source, target, count) {
    let start = Color.fromHex(source),
        end = Color.fromHex(target)
    let red = interpolateNumbers(start.red, end.red, count),
        green = interpolateNumbers(start.green, end.green, count),
        blue = interpolateNumbers(start.blue, end.blue, count),
        colors = []

    for (let i = 0; i < count; i++) {
        let color = new Color(red[i], green[i], blue[i])
        colors.push(color.toHex())
    }
    return colors
}


const hexClamp = comp => clamp(comp, 0, 255)


const expandShorthand = hex => {
    return [
        hex[0] + hex[0],
        hex[1] + hex[1],
        hex[2] + hex[2]
    ].join('')
}


export class Color {
    static YELLOW = Color.fromHex('FF0')
    static RED = Color.fromHex('F00')
    static GREEN = Color.fromHex('0F0')
    static BLUE = Color.fromHex('00F')
    static BLACK = Color.fromHex('000')

    static fromHex(value) {
        let hex = String(value).trim().replace('#', '')
        let length = hex.length
        if (length !== 3 && length != 6)
            return new Color(0, 0, 0)
        if (length == 3)
            hex = expandShorthand(hex)
        return new Color(
            parseInt(hex.substring(0,2), 16),
            parseInt(hex.substring(2,4), 16),
            parseInt(hex.substring(4,6), 16)
        )
    }

    constructor(red=Random.int(255), green=Random.int(255), blue=Random.int(255)) {
        this.red = hexClamp(red)
        this.green = hexClamp(green)
        this.blue = hexClamp(blue)
    }

    toHex() {
        const hex = n => CHARS.charAt((n - n % 16) / 16) + CHARS.charAt(n % 16)
        return `#${hex(this.red)}${hex(this.green)}${hex(this.blue)}`
    }

    invert() {
        return new Color(
            255 - this.red,
            255 - this.green,
            255 - this.blue,
        )
    }

    brighten(amount) {
        return new Color(
            this.red + amount,
            this.green + amount,
            this.blue + amount,
        )
    }

    darken(amount) {
        return new Color(
            this.red - amount,
            this.green - amount,
            this.blue - amount,
        )
    }

    average(color) {
        return new Color(
            Math.floor((this.red + color.red) / 2),
            Math.floor((this.green + color.green) / 2),
            Math.floor((this.blue + color.blue) / 2),
        )
    }

    grayscale() {
        // Uses the Weighted Method
        // Grayscale  = 0.299R + 0.587G + 0.114B
        const red = this.red * 0.299
        const green = this.green * 0.587
        const blue = this.blue * 0.114
        const gray = Math.round(red + green + blue)
        return new Color(gray, gray, gray)
    }
}
