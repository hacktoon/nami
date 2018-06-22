function hex(number) {
    var chars = '0123456789ABCDEF';
    var i = parseInt(number, 10);
    if (i == 0 || isNaN (number))
        return '00';
    i = Math.round (Math.min (Math.max (0, i), 255));
    return chars.charAt((i - i % 16) / 16) + chars.charAt (i % 16);
}

/* Convert an RGB triplet to a hex string */
function convertToHex (rgb) {
    return '#' + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

/* Convert a hex string to an RGB triplet */
var convertToRGB = function(hex) {
    hex = hex.replace('#', '');
    return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16)
    ]
};


var NumberRange = function(start, end, total){
    var step = (end - start) / (total - 1);
    var items = [start];
    var current = start;
    while (current < end){
        current += step;
        items.push(Math.round(current));
    }
    return items;
};

/* The start of your code. */
var ColorGradient = function(total){
    var start = convertToRGB ('#000000');    /* The beginning of your gradient */
    var end   = convertToRGB ('#ffffff');    /* The end of your gradient */
    var total = total - 1;
    var colors = [start];

    for (i = 0; i < total; i++) {
        var c = [];

        c[0] = NumberRange(start[0], end[0], total);
        c[1] = NumberRange(start[1], end[1], total);
        c[2] = NumberRange(start[2], end[2], total);
        console.log(c);

        /* Set the background color of this element */
        colors[i] = convertToHex(c);
    }
    return colors;
};