import { Matrix } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { SURFACE_RATIO, Surface } from './data'


const EMPTY = null

// Area ratios
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = .12
const MINIMUN_CONTINENT_RATIO = 1


export class SurfaceLayer {
    // Major world bodies with area and type

    #noiseLayer
    #bodyIdMatrix
    #areaMap = new Map()
    #surfaceIdMap = new Map()
    #bodyIdCount = 1

    constructor(rect, layers) {
        this.#noiseLayer = layers.noise
        // init matrix with empty cells
        this.#bodyIdMatrix = Matrix.fromRect(rect, () => EMPTY)
        // detect surface regions and area
        this.#bodyIdMatrix.forEach(point => this.#buildBody(point))
    }

    #buildBody(originPoint) {
        if (this.#bodyIdMatrix.get(originPoint) !== EMPTY)
            return
        const [type, area] = this.#detect(originPoint)
        this.#areaMap.set(this.#bodyIdCount, area)
        this.#surfaceIdMap.set(this.#bodyIdCount, type)
        this.#bodyIdCount++
    }

    #detect(originPoint) {
        const [isBelowRatio, area] = this.#fillBody(originPoint)
        const massRatio = (area * 100) / this.#bodyIdMatrix.area
        let type = Surface.CONTINENT
        // area is filled; decide type
        if (isBelowRatio) {
            if (massRatio >= MINIMUN_OCEAN_RATIO)
                type = Surface.OCEAN
            else if (massRatio >= MINIMUN_SEA_RATIO)
                type = Surface.SEA
            else
                type = Surface.CONTINENT
        } else if (massRatio < MINIMUN_CONTINENT_RATIO)
            type = Surface.ISLAND
        return [type, area]
    }

    #fillBody(originPoint) {
        let area = 0
        const isBelowRatio = this.#isBelowRatio(originPoint)
        const canFill = point => {
            const sameType = isBelowRatio === this.#isBelowRatio(point)
            return sameType && this.#bodyIdMatrix.get(point) === EMPTY
        }
        const onFill = point => {
            this.#bodyIdMatrix.set(point, this.#bodyIdCount)
            area++
        }
        const wrapPoint = point => this.#bodyIdMatrix.wrap(point)
        // belowRation is water; search all sidepoints (water fills)
        const Fill = isBelowRatio ? ScanlineFill8 : ScanlineFill
        new Fill(originPoint, {canFill, wrapPoint, onFill}).fill()
        return [isBelowRatio, area]
    }

    #isBelowRatio(point) {
        const noise = this.#noiseLayer.getOutline(point)
        return SURFACE_RATIO >= noise
    }

    get(point) {
        const bodyId = this.#bodyIdMatrix.get(point)
        return Surface.fromId(this.#surfaceIdMap.get(bodyId))
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        return `Surface(name=${surface.name}, area=${surfaceArea}%)`
    }

    isWater(point) {
        const bodyId = this.#bodyIdMatrix.get(point)
        const surfaceId = this.#surfaceIdMap.get(bodyId)
        return Surface.isWater(surfaceId)
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isOcean(point) {
        return this.get(point).id === Surface.OCEAN
    }

    getArea(point) {
        const bodyId = this.#bodyIdMatrix.get(point)
        return (this.#areaMap.get(bodyId) * 100) / this.#bodyIdMatrix.area
    }
}
