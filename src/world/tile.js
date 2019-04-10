

export default class Tile {
    constructor (point) {
        this.point = point
        this.waterbody = undefined
        this.biome = undefined
        this.state = undefined
    }

    get isLand() { return Boolean(this.waterbody) }
    get isWater() { return this.isLand }

}
