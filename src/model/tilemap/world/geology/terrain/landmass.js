import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'
import { PairMap } from '/src/lib/map'
import { Terrain } from './schema'


const MINIMUN_OCEAN_RATIO = 1  // 1%


export class LandmassLayer {
    constructor(rect) {
        this.waterBodyMap = new PairMap()
        this.rect = rect
        this.areaMap = new Map()
        this.oceans = new Set()
    }

    detectOcean(detectType, landmassId, startPoint) {
        let area = 0
        const canFill = point => {
            const isWater = Terrain.isWater(detectType(point))
            return isWater && ! this.waterBodyMap.has(...point)
        }
        const onFill = point => {
            this.waterBodyMap.set(...point, landmassId)
            area++
        }
        const wrapPoint = point => this.rect.wrap(point)
        if (canFill(startPoint)) {
            new ScanlineFill8(startPoint, {canFill, wrapPoint, onFill}).fill()
            this.areaMap.set(landmassId, area)
            const ratio = Math.round((area * 100) / this.rect.area)
            if (ratio >= MINIMUN_OCEAN_RATIO) {
                this.oceans.add(landmassId)
            }
            return true
        }
        return false
    }

    isOcean(point) {
        const wrappedPoint = this.rect.wrap(point)
        if (this.waterBodyMap.has(...wrappedPoint)) {
            const id = this.waterBodyMap.get(...wrappedPoint)
            return this.oceans.has(id)
        }
        return false
    }
}
