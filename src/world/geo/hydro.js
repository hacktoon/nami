import { ScanlineFill, Grid } from '../../lib/grid'


const EMPTY_VALUE = 0


export class HydrographyBuilder {
    constructor(world) {
        this.grid = new Grid(world.size, world.size, EMPTY_VALUE)
        this.waterBodyId = 1
        this.world = world
    }

    detectWaterBody(point) {
        const onFill = point => this.grid.set(point, this.waterBodyId)
        const isFillable = point => {
            let tile = this.world.getTile(point)
            let isEmpty = this.grid.get(point) === EMPTY_VALUE
            return tile.elevation.isBelowSeaLevel && isEmpty
        }

        if (isFillable(point)) {
            new ScanlineFill(this.world.grid, point, onFill, isFillable).fill()
            this.waterBodyId++
        }
    }
}