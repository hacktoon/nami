import { Random } from '/lib/random'
import { NumberInterpolation } from '/lib/number'



export class Color {
    static random() {
        const r = Random.int(255)
        const g = Random.int(255)
        const b = Random.int(255)
        return '#' + HexByte(r) + HexByte(g) + HexByte(b)
    }
}


export function ColorGradient (_from, to, totalItems) {
    let start = RGBTriplet(_from),
        end = RGBTriplet(to),
        red = NumberInterpolation(start[0], end[0], totalItems),
        green = NumberInterpolation(start[1], end[1], totalItems),
        blue = NumberInterpolation(start[2], end[2], totalItems),
        colors = []

    for (let i = 0; i < totalItems; i++) {
        colors.push(HTMLHex([red[i], green[i], blue[i]]))
    }
    return colors
}


function HexByte(number) {
    const chars = '0123456789ABCDEF'
    number = parseInt(number, 10)

    if (number == 0 || isNaN(number)) { return '00' }

    number = Math.min(Math.max(0, number), 255)
    return chars.charAt((number - number % 16) / 16) + chars.charAt(number % 16)
}


function HTMLHex(RGB) {
    /* Convert an RGB triplet to a hex string */
    return '#' + HexByte(RGB[0]) + HexByte(RGB[1]) + HexByte(RGB[2])
}


function RGBTriplet(hexString) {
    /* Convert a hex string to an RGB triplet */
    hexString = hexString.replace('#', '')
    if(hexString.length == 3){
        hexString = hexString[0] + hexString[0] +
                    hexString[1] + hexString[1] +
                    hexString[2] + hexString[2]
    }
    return [
        parseInt(hexString.substring(0, 2), 16),
        parseInt(hexString.substring(2, 4), 16),
        parseInt(hexString.substring(4, 6), 16)
    ]
}
