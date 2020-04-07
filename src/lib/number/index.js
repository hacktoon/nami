

export const interpolateNumbers = function(from, to, totalItems){
    var totalNumbers = to - from + 1,
        stepValue = totalNumbers / totalItems,
        numbers = [from],
        currentValue = from

    for(let i=0; i<totalItems - 2; i++) {
        currentValue += stepValue
        numbers.push(Math.round(currentValue))
    }
    numbers.push(to)
    return numbers
}


export const clamp = function(number, min, max) {
    return Math.max(min, Math.min(number, max))
}


export const sum = arr => arr.reduce((a,b) => a + b, 0)