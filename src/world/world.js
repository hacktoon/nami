
class World {
    constructor(size) {
        this.size = size
        this.area = Math.pow(size, 2)
        this.geo = new WorldGeo()
        this.bio = {}
        this.climate = {}

        this.grid = new Grid(size, size)
    }

    getTile (point) {
        return this.grid.get(point)
    }

    setTile (point, tile) {
        return this.grid.set(point, tile)
    }
}


class WorldGeo {
    constructor () {
        this.totalWaterPoints = 0
        this.totalLandPoints = 0
        this.volcanoPoints = new HashMap()
        this.riverSourcePoints = new HashMap()
    }

    get waterPercentage() {
        let value = (this.totalWaterPoints * 100) / this.area
        return value.toFixed(1)
    }
}
