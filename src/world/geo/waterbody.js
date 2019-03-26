import { ScanlineFill, Grid } from '../../lib/grid'
import { Name } from '../../lib/name'

const EMPTY_VALUE = 0


export class WaterBodyMap {
    constructor(world) {
        this.world = world
        this.idMap = {}
        this.waterBodyCounter = 1
        this.grid = new Grid(world.size, world.size, EMPTY_VALUE)
        this.minOceanArea = world.area / 10
        this.minSeaArea = world.area / 50

        this.build()
    }

    get(point) {
        return this.grid.get(point)
    }

    build() {
        this.world.forEach((tile, point) => {
            this._detectWaterBody(point)
        })
    }

    _detectWaterBody(startPoint) {
        let tileCount = 0
        const isFillable = point => {
            let tile = this.world.getTile(point)
            let isEmpty = this.grid.get(point) == EMPTY_VALUE
            return tile.elevation.isBelowSeaLevel && isEmpty
        }
        const onFill = point => {
            this.grid.set(point, this.waterBodyCounter)
            tileCount++
        }

        new ScanlineFill(this.world.grid, startPoint, onFill, isFillable).fill()
        this._buildWaterBody(this.waterBodyCounter, tileCount)
    }

    _buildWaterBody(id, tileCount) {
        let waterBody

        if (tileCount == 0)
            return
        if (this._isOcean(tileCount)) {
            waterBody = new Ocean(id, Name.createOceanName(), tileCount)
        } else if (this._isSea(tileCount)) {
            waterBody = new Sea(id, "Sea " + id, tileCount)
        } else {
            waterBody = new Lake(id, "Lake " + id, tileCount)
        }
        this.idMap[id] = waterBody
        this.waterBodyCounter++
    }

    _isOcean(tileCount) {
        return tileCount > this.minOceanArea
    }

    _isSea(tileCount) {
        return !this._isOcean(tileCount) && tileCount > this.minSeaArea
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
