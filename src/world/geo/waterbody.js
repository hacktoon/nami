import { ScanlineFill, Grid } from '../../lib/grid'
import { Name } from '../../lib/name'

const EMPTY_VALUE = 0
const OCEAN = 0
const SEA = 1
const LAKE = 2


export class WaterBodyMap {
    constructor(world) {
        this.world = world
        this.waterBodyCounter = 1
        this.grid = new Grid(world.size, world.size, EMPTY_VALUE)
        this.minOceanArea = world.area / 10
        this.minSeaArea = world.area / 50
    }

    get(point) {
        return this.grid.get(point)
    }

    detectWaterBody(startPoint) {
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

        if (!isFillable(startPoint)) return
        new ScanlineFill(this.world.grid, startPoint, onFill, isFillable).fill()
        return this._buildWaterBody(this.waterBodyCounter, startPoint, tileCount)
    }

    _buildWaterBody(id, point, tileCount) {
        if (tileCount == 0) return

        let name = Name.createWaterBodyName()
        let type = LAKE

        if (this._isOceanType(tileCount)) {
            type = OCEAN
        } else if (this._isSeaType(tileCount)) {
            type = SEA
        }
        this.waterBodyCounter++
        return new WaterBody(id, type, name, point, tileCount)
    }

    _isOceanType(tileCount) {
        return tileCount > this.minOceanArea
    }

    _isSeaType(tileCount) {
        return !this._isOceanType(tileCount) && tileCount > this.minSeaArea
    }
}


class WaterBody {
    constructor(id, type, name, point, area) {
        this.id = id
        this.name = name
        this.type = type
        this.area = area
        this.point = point
    }

    get isOcean() { return this.type == OCEAN }
    get isSea() { return this.type == SEA }
    get isLake() { return this.type == LAKE }
}
