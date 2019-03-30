import Tile from '../lib/tile'
import {Grid} from '../lib/grid'


export default class World {
    constructor(size) {
        this.seed = Random.seed
        this.size = size
        this.area = size * size
        this.geo = new WorldGeo()
        this.bio = {}
        this.climate = {}

        this.grid = new Grid(size, size, point => new Tile(point))
    }

    iter(callback) {
        this.grid.forEach(tile => {
            callback(tile)
        })
    }

    get(point) {
        return this.grid.get(point)
    }

    getRelief(point) {
        return this.get(point).relief
    }

    getHeat(point) {
        return this.get(point).heat
    }

    getMoisture(point) {
        return this.get(point).moisture
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
