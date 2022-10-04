import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'
import { PairMap } from '/src/lib/map'
import { Terrain } from './schema'


const MINIMUN_OCEAN_RATIO = 1  // 1%


export class LandmassMap {
    constructor(terrainLayer) {
        this.terrainLayer = terrainLayer
        this.waterBodyMap = new PairMap()
        this.bodies = new Map()
        this.oceans = new Set()
    }

    detect(landmassId, startPoint) {
        let area = 0
        const canFill = point => {
            const isWater = Terrain.isWater(this.terrainLayer.get(point))
            return isWater && ! this.waterBodyMap.has(...point)
        }
        const onFill = point => {
            this.waterBodyMap.set(...point, landmassId)
            area++
        }
        const wrapPoint = point => this.terrainLayer.rect.wrap(point)
        if (canFill(startPoint)) {
            new ScanlineFill8(startPoint, {canFill, wrapPoint, onFill}).fill()
            this.bodies.set(landmassId, area)
            const ratio = Math.round((area * 100) / this.terrainLayer.area)
            if (ratio >= MINIMUN_OCEAN_RATIO) {
                this.oceans.add(landmassId)
            }
            return true
        }
        return false
    }

    isOcean(point) {
        if (this.waterBodyMap.has(...point)) {
            const id = this.waterBodyMap.get(...point)
            return this.oceans.has(id)
        }
        return false
    }
}
