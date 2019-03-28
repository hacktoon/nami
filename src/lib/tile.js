export default class Tile {
    constructor () {
        this.placeName = ""
        this.heat = undefined
        this.moisture = undefined
        this.relief = undefined
        this.biome = undefined
        this.isAboveSeaLevel = true
        this.isUnderwater = false
        this.isRiverSource = false
        this.isVolcano = false
        this.lastState = undefined
    }
}
