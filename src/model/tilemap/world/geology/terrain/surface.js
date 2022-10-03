import { PointSet } from '/src/lib/point/set'
import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'


const MINIMUN_OCEAN_RATIO = 1  // 1%


export class WaterSurfaceMap {
    constructor(terrainMap, waterPoints) {
        this.rect = terrainMap.rect
        this.currentID = 1
        this.allowed = new PointSet(waterPoints)
        this.filled = new PairMap()
        this.bodies = new Map()
        this.oceans = new Set()
        for (let point of waterPoints){
            this.#detectWaterbody(point)
        }
    }

    #detectWaterbody(startPoint) {
        let area = 0
        const canFill = point => this.allowed.has(point) && ! this.filled.has(...point)
        const onFill = point => {
            this.filled.set(...point, this.currentID)
            area++
        }
        const filterPoint = point => this.rect.wrap(point)
        if (canFill(startPoint)) {
            new ScanlineFill8(startPoint, {canFill, filterPoint, onFill}).fill()
            const totalArea = this.rect.area
            const id = this.currentID++
            this.bodies.set(id, area)
            const ratio = Math.round((area * 100) / totalArea)
            if (ratio >= MINIMUN_OCEAN_RATIO) {
                this.oceans.add(id)
            }
        }
    }

    isOcean(point) {
        if (this.filled.has(...point)) {
            const id = this.filled.get(...point)
            return this.oceans.has(id)
        }
        return false
    }
}
