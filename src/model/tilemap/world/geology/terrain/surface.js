import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'
import { Terrain } from './schema'


const MINIMUN_OCEAN_RATIO = 1  // 1%


export class WaterSurfaceMap {
    constructor(terrainMap, waterPoints) {
        this.terrainMap = terrainMap
        this.currentID = 1
        this.filled = new PairMap()
        this.bodies = new Map()
        this.oceans = new Set()
        for (let point of waterPoints){
            this.#detectWaterbody(point)
        }
    }

    #detectWaterbody(startPoint) {
        let area = 0
        const canFill = point => {
            const isWater = Terrain.isWater(this.terrainMap.get(point))
            return isWater && ! this.filled.has(...point)
        }
        const onFill = point => {
            this.filled.set(...point, this.currentID)
            area++
        }
        const filterPoint = point => this.terrainMap.rect.wrap(point)
        if (canFill(startPoint)) {
            new ScanlineFill8(startPoint, {canFill, filterPoint, onFill}).fill()
            const id = this.currentID++
            this.bodies.set(id, area)
            const ratio = Math.round((area * 100) / this.terrainMap.area)
            if (ratio >= MINIMUN_OCEAN_RATIO) {
                this.oceans.add(id)
            }
        }
    }

    isOcean(rawPoint) {
        const point = this.terrainMap.rect.wrap(rawPoint)
        if (this.filled.has(...point)) {
            const id = this.filled.get(...point)
            return this.oceans.has(id)
        }
        return false
    }
}
