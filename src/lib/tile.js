export default class Tile {
    constructor () {
        this.heat = undefined
        this.rain = undefined
        this.elevation = undefined
        this.biome = undefined
        this.isLand = true
        this.isWater = false
        this.isRiverSource = false
        this.lastState = undefined
    }
}
