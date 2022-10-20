import { Matrix } from '/src/lib/matrix'
import { PointMap } from '/src/lib/matrix'
import { ScanlineFill, ScanlineFill8 } from '/src/lib/floodfill/scanline'

import { WATER, LAND, Geotype } from './data'


const EMPTY = null
// percentages
const MINIMUN_OCEAN_RATIO = 2
const MINIMUN_SEA_RATIO = 0.2
const MINIMUN_CONTINENT_RATIO = 2


export class GeotypeLayer {
    // Geotypes are islands, continents, oceans, seas and lakes
    #rect
    #noiseMap
    #idMatrix
    #idCount = 1
    #areaMap = new Map()
    #typeMap = new Map()

    constructor(noiseMap, ratio) {
        this.#noiseMap = noiseMap
        this.#rect = noiseMap.rect
        this.#idMatrix = Matrix.fromRect(this.#rect, () => EMPTY)
        this.#idMatrix.forEach(point => {
            const type = this.#getType(point, ratio)
            this.#detectType(point, type, ratio)
        })
    }

    #getType(point, ratio) {
        const noise = this.#noiseMap.getNoise(point)
        return noise < ratio ? WATER : LAND
    }

    #detectType(point, geotype, ratio) {
        if (this.#idMatrix.get(point) !== EMPTY)
            return
        let area = 0
        const canFill = pt => {
            const sameType = geotype === this.#getType(pt, ratio)
            return sameType && this.#idMatrix.get(pt) === EMPTY
        }
        const onFill = pt => {
            this.#idMatrix.set(pt, this.#idCount)
            area++
        }
        const wrapPoint = pt => this.#rect.wrap(pt)
        const Fill = geotype === LAND ? ScanlineFill : ScanlineFill8
        new Fill(point, {canFill, wrapPoint, onFill}).fill()

        const massRatio = (area * 100) / this.#rect.area
        const type = this.#buildType(geotype, massRatio)
        this.#areaMap.set(this.#idCount, area)
        this.#typeMap.set(this.#idCount, type)
        this.#idCount++
    }

    #buildType(geotype, massRatio) {
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
