

export default class Tile {
    constructor (point) {
        this.point = point
        this.water = undefined
        this.biome = undefined
        this.state = undefined
    }

    get isLand() { return Boolean(this.water) }
    get isWater() { return this.isLand }

}
