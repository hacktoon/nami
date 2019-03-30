export default class Tile {
    constructor (point) {
        this.point = point
        this.type = undefined
        this.isAboveSeaLevel = true
        this.isWater = false
        this.isRiverSource = false
        this.isVolcano = false
        this.lastState = undefined
    }
}
