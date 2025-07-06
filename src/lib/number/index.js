
export const interpolateNumbers = (source, target, totalItems) => {
    const totalNumbers = target - source + 1
    const stepValue = totalNumbers / totalItems
    const numbers = [source]
    let currentValue = source

    for(let i=0; i<totalItems - 2; i++) {
        currentValue += stepValue
        numbers.push(Math.round(currentValue))
    }
    numbers.push(target)
    return numbers
}


export const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

export const sum = arr => arr.reduce((a,b) => a + b, 0)
