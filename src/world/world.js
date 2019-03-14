
class World {
    constructor(size) {
        this.size = size
        this.area = Math.pow(size, 2)
        this.geo = new WorldGeo()
        this.bio = {}
        this.climate = {}

        this.grid = new Grid(size, size)

        // this.rainMap = new RainMap(this.size, roughness/2)
        // this.heatMap = new HeatMap(this.size)
    }

    getTile (point) {
        return this.grid.get(point)
    }

    setTile (point, tile) {
        return this.grid.set(point, tile)
    }

    // raiseTerrain (startPoint) {
    //     let terrain = this.grid.get(startPoint).terrain
    //     let currentlevel = terrain.id
    //     let growthRates = [8, 4, 2]

    //     if(! Terrain.isHighest(terrain)) {
    //         currentlevel++
    //     }
    //     _.times(growthRates.length, count => {
    //         new GridFill(startPoint, (point) => {
    //             let tile = this.grid.get(point)
    //             if (tile.terrain.id + 1 == currentlevel)
    //                 tile.terrain = Terrain.getTerrainById(currentlevel)
    //         }).growPartial(growthRates[count])
    //         currentlevel--
    //     })
    // }
}


class WorldGeo {
    constructor () {
        this.totalWaterPoints = 0
        this.totalLandPoints = 0
    }

    get waterPercentage() {
        let value = (this.totalWaterPoints * 100) / this.area
        return value.toFixed(1)
    }
}
