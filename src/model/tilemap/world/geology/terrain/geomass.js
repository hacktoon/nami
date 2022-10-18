import { Matrix } from '/src/lib/matrix'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'

import {
    WATER,
    OCEAN, SEA, LAKE,
    CONTINENT, ISLAND
} from '../data'


const EMPTY = null
// percentages
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = 0.2
const MINIMUN_CONTINENT_RATIO = 2


export class GeomassMap {
    // Geomasses are islands, continents, oceans, seas and lakes
    #rect
    #idCount = 1
    #idMatrix
    #areaMap = new Map()
    #typeMap = new Map()

    constructor(rect) {
        this.#idMatrix = Matrix.fromRect(rect, () => EMPTY)
        this.#rect = rect
    }

    detect(startPoint, geotype, getType) {
        if (this.#idMatrix.get(startPoint) !== EMPTY)
            return
        let area = 0
        const canFill = point => {
            const sameType = geotype === getType(point)
            return sameType && this.#idMatrix.get(point) === EMPTY
        }
        const onFill = point => {
            this.#idMatrix.set(point, this.#idCount)
            area++
        }
        const wrapPoint = point => this.#rect.wrap(point)
        const methods = {canFill, wrapPoint, onFill}
        new ScanlineFill8(startPoint, methods).fill()

        const geomass = this.#buildGeomassType(geotype, area)
        this.#areaMap.set(this.#idCount, area)
        this.#typeMap.set(this.#idCount, geomass)
        this.#idCount++
    }

    #buildGeomassType(geotype, area) {
        const massRatio = (area * 100) / this.#rect.area
        if (geotype === WATER) {
            if (massRatio >= MINIMUN_OCEAN_RATIO) return OCEAN
            if (massRatio >= MINIMUN_SEA_RATIO) return SEA
            return LAKE
        }
        // land
        if (massRatio >= MINIMUN_CONTINENT_RATIO) return CONTINENT
        return ISLAND
    }

    getType(point) {
        const id = this.#idMatrix.get(point)
        return this.#typeMap.get(id)
    }

    getArea(point) {
        const id = this.#idMatrix.get(point)

        return (this.#areaMap.get(id) * 100) / this.#rect.area
    }

}
