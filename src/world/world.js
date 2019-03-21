import Tile from '../lib/tile'
import {HashMap} from '../lib/base'
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

    _buildTile () {
        return new Tile()
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
