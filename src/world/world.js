import Tile from './tile'
import {Grid} from '../lib/grid'
import { Name } from '../lib/name';


export default class World {
    constructor(size) {
        this.id = Random.seed
        this.name = Name.createLandformName()
        this.seed = Random.seed
        this.size = size
        this.area = size * size
        this.geo = new WorldGeo()
        this.bio = {}
        this.climate = {}

        this.grid = new Grid(size, size, point => new Tile(point))
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    get(point) {
        return this.grid.get(point)
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
