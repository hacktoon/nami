import { Matrix } from '/src/lib/matrix'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { WATER, LAND, Geotype } from './data'


const EMPTY = null
// percentages
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = 0.2
const MINIMUN_CONTINENT_RATIO = 2


export class GeotypeLayer {
    // Geotypes are islands, continents, oceans, seas and lakes
    #rect
    #idMatrix
    #idCount = 1
    #areaMap = new Map()
    #typeMap = new Map()

    constructor(noiseMap, ratio) {
        this.#rect = noiseMap.rect
        const getType = point => {
            const noise = noiseMap.getNoise(point)
            return noise < ratio ? WATER : LAND
        }
        this.#idMatrix = Matrix.fromRect(this.#rect, () => EMPTY)
        this.#idMatrix.forEach(point => {
            const type = getType(point)
            this.#detect(point, type, getType)
        })
    }

    #detect(point, geotype, getType) {
        if (this.#idMatrix.get(point) !== EMPTY)
            return
        let area = 0
        const canFill = pt => {
            const sameType = geotype === getType(pt)
            return sameType && this.#idMatrix.get(pt) === EMPTY
        }
        const onFill = pt => {
            this.#idMatrix.set(pt, this.#idCount)
            area++
        }
        const wrapPoint = pt => this.#rect.wrap(pt)
        const fill = new ScanlineFill8(point, {canFill, wrapPoint, onFill})
        fill.fill()

        const type = this.#buildType(geotype, area)
        this.#areaMap.set(this.#idCount, area)
        this.#typeMap.set(this.#idCount, type)
        this.#idCount++
    }

    #buildType(geotype, area) {
        const massRatio = (area * 100) / this.#rect.area
        if (geotype === WATER) {
            if (massRatio >= MINIMUN_OCEAN_RATIO)
                return Geotype.OCEAN
            if (massRatio >= MINIMUN_SEA_RATIO)
                return Geotype.SEA
            return Geotype.LAKE
        }
        // land
        if (massRatio >= MINIMUN_CONTINENT_RATIO)
            return Geotype.CONTINENT
        return Geotype.ISLAND
    }

    get(point) {
        const id = this.#idMatrix.get(point)
        return Geotype.fromId(this.#typeMap.get(id))
    }

    isWater(point) {
        return this.get(point).water
    }

    getArea(point) {
        const id = this.#idMatrix.get(point)
        return (this.#areaMap.get(id) * 100) / this.#rect.area
    }
}
