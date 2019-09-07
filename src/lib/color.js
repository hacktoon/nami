import _ from 'lodash'
import { Random } from './base';
import { NumberInterpolation } from './base';


var RandomColor = function() {
    var letters = '0123456789ABCDEF',
        color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Random.int(0, 16))]
    }
    return color;
};

var HexByte = function (number){
    var chars = '0123456789ABCDEF',
        number = parseInt(number, 10);

    if (number == 0 || isNaN(number)) { return '00'; }

    number = Math.min(Math.max(0, number), 255);
    return chars.charAt((number - number % 16) / 16) + chars.charAt (number % 16);
};

/* Convert an RGB triplet to a hex string */
var HTMLHex = function (RGB){
    return HexByte(RGB[0]) + HexByte(RGB[1]) + HexByte(RGB[2]);
};

/* Convert a hex string to an RGB triplet */
var RGBTriplet = function(hexString) {
    if(hexString.length == 3){
        hexString = hexString[0] + hexString[0] +
            hexString[1] + hexString[1] + hexString[2] + hexString[2];
    }
    return [
        parseInt(hexString.substring(0, 2), 16),
        parseInt(hexString.substring(2, 4), 16),
        parseInt(hexString.substring(4, 6), 16)
    ];
};

export const ColorGradient = function(from, to, totalItems){
    var start = RGBTriplet(from),
        end   = RGBTriplet(to),
        red = NumberInterpolation(start[0], end[0], totalItems),
        green = NumberInterpolation(start[1], end[1], totalItems),
        blue = NumberInterpolation(start[2], end[2], totalItems),
        colors = []

    for (var i = 0; i < totalItems; i++) {
        colors.push('#' + HTMLHex([red[i], green[i], blue[i]]))
    }
    return colors
}
