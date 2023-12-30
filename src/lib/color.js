import { Random } from '/src/lib/random'
import { interpolateNumbers, clamp } from '/src/lib/number'


const CHARS = '0123456789ABCDEF'
const SCALE = 255


export class Color {
    static WHITE = Color.fromHex('FFF')
    static YELLOW = Color.fromHex('FF0')
    static RED = Color.fromHex('F00')
    static DARKRED = Color.fromHex('8b0000')
    static LIGHTGREEN = Color.fromHex('#90cc5e')
    static GREEN = Color.fromHex('0F0')
    static DARKGREEN = Color.fromHex('71b13e')
    static PURPLE = Color.fromHex('808')
    static BLUE = Color.fromHex('00F')
    static DARKBLUE = Color.fromHex('235')
    static BROWN = Color.fromHex('#6b573e')
    static BLACK = Color.fromHex('000')
    static GRAY = Color.fromHex('666')
    static LIGHTGRAY = Color.fromHex('d3d3d3')

    static fromInteger(id) {
        const r = 1
        const g = 1
        const b = 1
        return new Color(r, g, b)
    }

    static fromHex(value) {
        let hex = String(value).trim().replace('#', '')
        let length = hex.length
        if (length !== 3 && length != 6) {
            // invalid string size
            return new Color(0, 0, 0)
        }
        if (length == 3) {
            // expand shorthand hex code: RGB -> RRGGBB
            const r = hex[0] + hex[0]
            const g = hex[1] + hex[1]
            const b = hex[2] + hex[2]
            hex = `${r}${g}${b}`
        }
        return new Color(
            parseInt(hex.substring(0,2), 16),
            parseInt(hex.substring(2,4), 16),
            parseInt(hex.substring(4,6), 16)
        )
    }

    constructor(r=null, g=null, b=null) {
        this.r = clamp(r ?? Random.int(SCALE), 0, SCALE)
        this.g = clamp(g ?? Random.int(SCALE), 0, SCALE)
        this.b = clamp(b ?? Random.int(SCALE), 0, SCALE)
    }

    toHex() {
        const hex = n => CHARS.charAt((n - n % 16) / 16) + CHARS.charAt(n % 16)
        return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`
    }

    invert() {
        return new Color(SCALE - this.r, SCALE - this.g, SCALE - this.b)
    }

    brighten(amount) {
        return new Color(this.r + amount, this.g + amount, this.b + amount)
    }

    darken(amount) {
        return new Color(this.r - amount, this.g - amount, this.b - amount)
    }

    average(color, times=1) {
        let avgColor = color
        for(let i = 0; i < times; i++) {
            avgColor = new Color(
               Math.floor((this.r + avgColor.r) / 2),
               Math.floor((this.g + avgColor.g) / 2),
               Math.floor((this.b + avgColor.b) / 2),
           )
        }
        return avgColor
    }

    grayscale() {
        // Uses the Weighted Method
        // Grayscale  = 0.299R + 0.587G + 0.114B
        const red = this.r * 0.299
        const green = this.g * 0.587
        const blue = this.b * 0.114
        const gray = Math.round(red + green + blue)
        return new Color(gray, gray, gray)
    }
}


export function generateColorInterpolation(source, target, count) {
    let start = Color.fromHex(source),
        end = Color.fromHex(target)
    let red = interpolateNumbers(start.r, end.r, count),
        green = interpolateNumbers(start.g, end.g, count),
        blue = interpolateNumbers(start.b, end.b, count),
        colors = []

    for (let i = 0; i < count; i++) {
        let color = new Color(red[i], green[i], blue[i])
        colors.push(color.toHex())
    }
    return colors
}
