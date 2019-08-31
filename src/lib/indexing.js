

/**
 * Creates a map from 0 to size with values given by table
 *
 *
*/

export class IndexToValueMap {
    constructor(size, values, rates = undefined) {
        this.map = this._buildMap(size, values, rates || [])
        this.values = values
        this.size = size
    }

    _buildMap(size, values, rates) {
        const map = []
        const indexesPerValue = Math.floor(size / values.length)
        // function to recalculate rest of values
        for (let i = 0; i < size; i++) {
            // if i <= 37%  get current rate method
            //
            const vIndex = Math.floor(i / indexesPerValue)
            map.push(values[vIndex])
        }
        return map
    }

    _buildMapSegment(map, values) {

    }

    _percentToIndex(rate) {
        return Math.floor((rate * this.size) / 100)
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
