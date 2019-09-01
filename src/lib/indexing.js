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

export class ValueDistributionMap {
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
        let indexesPerValue = Math.max(1, Math.round(size / values.length))
        const index = Math.min(Math.floor(i / indexesPerValue), values.length - 1)
        return values[index]
    }

    get(index) {
        if (!this.map[index]) {
            throw new RangeError(`Index: ${index} on map ${this.map}`)
        }
        return this.map[index]
    }
}


window.ValueDistributionMap = ValueDistributionMap
