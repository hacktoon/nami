import Tile from './tile'
import { Grid } from '/lib/grid'
import { Name } from '/lib/name'
import { Random } from '/lib/base'


export default class World {
    constructor(seed, size) {
        this.seed = seed
        this.name = Name.createLandmassName()
        this.size = size
        this.area = size * size
        this.grid = new Grid(size, size, point => new Tile(point))
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    get(point) {
        return this.grid.get(point)
    }
}