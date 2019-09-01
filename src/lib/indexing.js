import _ from 'lodash'

/**
 * Creates a map from 0 to size with values given by table
 *
 *
*/


    // _builRates(rateList) {
    //     const rates = _.isArray(rateList) ? rateList : []
    //     return rates.sort((a, b) => b - a)  // sort desc
    // }

    // _passedRate(i, size, rates) {
    //     const currentPercentage = this._getCurrentPercentage(i, size)
    //     return currentPercentage > _.last(rates)
    // }

    // _getCurrentPercentage(i, size) {
    //     const cellNum = i + 1
    //     return Math.floor((cellNum * 100) / size)
    // }

// use this to map  a numeric range to true | false -> mascara binaria
// bitmask

export class IndexToValueMap {
    constructor(size, values) {
        this.map    = this._buildMap(size, values)
        this.values = values
        this.size   = size
    }

    _buildMap(size, values) {
        const map = []
        for (let i = 0; i < size; i++) {
            let value = this._getValue(i, size, values)
            map.push(value)
        }
        return map
    }

    _getValue(i, size, values) {
        const indexesPervalue = Math.floor(size / values.length)
        const rawIndex = Math.floor(i / indexesPervalue)
        const index = Math.min(rawIndex, values.length - 1)
        return values[index]
    }

    get(index) {
        if (!this.map[index]) {
            const msg = `Index: ${index} on map ${this.map}`
            throw new RangeError(msg)
        }
        return this.map[index]
    }
}


window.IndexToValueMap = IndexToValueMap
