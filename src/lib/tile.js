export default class Tile {
    constructor () {
        this.heat = undefined
        this.moisture = undefined
        this.elevation = undefined
        this.biome = undefined
        this.isAboveSeaLevel = true
        this.isUnderwater = false
        this.isRiverSource = false
        this.lastState = undefined
    }
}
