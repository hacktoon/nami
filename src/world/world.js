import Tile from '../lib/tile'
import {Grid} from '../lib/grid'


export default class World {
    constructor(size) {
        this.size = size
        this.area = size * size
        this.geo = new WorldGeo()
        this.bio = {}
        this.climate = {}

        this.grid = new Grid(size, size, () => new Tile())
    }

    forEach(callback) {
        this.grid.forEach((tile, point) => {
            callback(tile, point)
        })
    }

    get(point) {
        return this.grid.get(point)
    }

    set (point, tile) {
        return this.grid.set(point, tile)
    }

    getHeight(point) {
        return this.grid.get(point).relief.baseHeight
    }
}


class WorldGeo {
    constructor () {
        this.totalWaterPoints = 0
        this.totalLandPoints = 0
        this.volcanoes = []
        this.riverSources = []
        this.seas = []
        this.lakes = []
        this.oceans = []
    }

    get waterPercentage() {
        let value = (this.totalWaterPoints * 100) / this.area
        return value.toFixed(1)
    }
}
