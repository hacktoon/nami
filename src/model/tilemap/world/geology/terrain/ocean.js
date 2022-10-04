import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'
import { PairMap } from '/src/lib/map'


const MINIMUN_OCEAN_RATIO = 1  // 1%


export class OceanMap {
    constructor(rect) {
        this.rect = rect
        this.pointOceanMap = new PairMap()
        this.areaMap = new Map()
        this.idMap = new Set()
        this.buildId = 1
    }

    detect(startPoint, isType) {
        let area = 0
        const canFill = point => {
            return isType(point) && ! this.pointOceanMap.has(...point)
        }
        const onFill = point => {
            this.pointOceanMap.set(...point, this.buildId)
            area++
        }
        const wrapPoint = point => this.rect.wrap(point)
        if (! canFill(startPoint))
            return
        new ScanlineFill8(startPoint, {canFill, wrapPoint, onFill}).fill()
        this.areaMap.set(this.buildId, area)
        const ratio = Math.round((area * 100) / this.rect.area)
        if (ratio >= MINIMUN_OCEAN_RATIO) {
            this.idMap.add(this.buildId)
        }
        this.buildId++
    }

    isOcean(point) {
        const wrappedPoint = this.rect.wrap(point)
        if (this.pointOceanMap.has(...wrappedPoint)) {
            const id = this.pointOceanMap.get(...wrappedPoint)
            return this.idMap.has(id)
        }
        return false
    }
}
