import { ScanlineFill, Grid } from '../../lib/grid'
import { Name } from '../../lib/name'

const EMPTY_VALUE = 0


export class WaterBodyMap {
    constructor(world) {
        this.grid = new Grid(world.size, world.size, EMPTY_VALUE)
        this.waterBodyId = 1
        this.world = world
    }

    detectWaterBody(point) {
        const isFillable = point => {
            let tile = this.world.getTile(point)
            let isEmpty = this.grid.get(point) === EMPTY_VALUE
            return tile.elevation.isBelowSeaLevel && isEmpty
        }

        if (isFillable(point)) {
            let tileCount = 0
            const onFill = point => {
                this.grid.set(point, this.waterBodyId)
                tileCount++
            }

            new ScanlineFill(this.world.grid, point, onFill, isFillable).fill()
            this.buildWaterBody(this.waterBodyId, tileCount)
            this.waterBodyId++
        }
    }

    buildWaterBody(id, tileCount) {
        if (this.isOcean(tileCount)) {
            return new Ocean(id, Name.createOceanName(), tileCount)
        } else if (this.isSea(tileCount)) {
            return new Sea(id, "Sea " + id, tileCount)
        } else {
            return new Lake(id, "Lake " + id, tileCount)
        }
    }

    isOcean(tileCount) {
        return tileCount > this.world.area / 6
    }

    isSea(tileCount) {
        return !this.isOcean(tileCount) && tileCount > this.world.area / 10
    }
}


class WaterBody {
    constructor(id, name, area) {
        this.id = id
        this.name = name
        this.area = area
    }
}


class Ocean extends WaterBody { }
class Sea extends WaterBody { }
class Lake extends WaterBody { }
class River extends WaterBody { }
