
export class Random {
    static set seed(value) {
        let seed = String(value)
        Random._stringSeed = seed
        Random._numericSeed = _hash(_hashString(seed))
    }

    static get seed() {
        return Random._stringSeed
    }

    static chance(percentage) {
        let value = Random.float()
        return percentage >= value
    }

    static shuffle(items) {
        const newItems = [...items]
        for (let i = items.length - 1; i >= 0; i--) {
            let j = Random.int(0, i)  // gen random index
            // swap values
            const temp = newItems[i]
            newItems[i] = newItems[j]
            newItems[j] = temp
        }
        return newItems
    }

    static choice(...items) {
        let index = Random.int(0, items.length - 1)
        return items[index]
    }

    static choiceFrom(items) {
        let index = Random.int(0, items.length - 1)
        return items[index]
    }

    static int(lower=1, upper) {
        // return a number in close bounds
        // includes lower and upper values in results
        let num = Random.float()

        lower = parseInt(lower, 10)
        if (upper === undefined) {
            upper = lower
            lower = 0
        } else {
            upper = parseInt(upper, 10)
        }

        if (lower > upper) {
            [lower, upper] = [upper, lower]
        }
        return lower + Math.floor(num * (upper - lower + 1))
    }

    static floatRange(lower, upper) {
        let num = Random.float()
        if (lower > upper) {
            [lower, upper] = [upper, lower]
        }
        // normalize to 0..1 range
        return lower + num * (upper - lower)
    }

    static float() {
        if (Random._numericSeed === undefined) {
            Random.seed = Number(new Date())
        }
        let seed = Random._numericSeed
        Random._numericSeed = seed + 1831565813 | 0
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
        return ((t ^ t >>> 14) >>> 0) / 2 ** 32
    }
}


function _hash(seed) {
    let h = 61 ^ seed ^ seed >>> 16
    h += h << 3
    h = Math.imul(h, 668265261)
    h ^= h >>> 15
    return h >>> 0
}


function _hashString(string) {
    let h = 0, len = string.length, i = 0
    if (len > 0)
        while (i < len)
            h = (h << 5) - h + string.charCodeAt(i++) | 0
    return h
}