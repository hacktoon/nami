import { Matrix } from '/src/lib/matrix'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'


const MINIMUN_OCEAN_RATIO = 1  // 1%


export class GeomassMap {
    // Geomasses are islands, continents, oceans, seas and lakes
    #idCount = 1
    #matrix
    #rect
    #areaMap = new Map()

    constructor(rect) {
        this.#matrix = Matrix.fromRect(rect, () => null)
        this.#rect = rect
    }

    detect(startPoint, type, getType) {
        let area = 0
        if (this.#matrix.get(startPoint) !== null)
            return
        const canFill = point => {
            return getType(point) && ! this.#matrix.has(point)
        }
        const onFill = point => {
            this.#matrix.set(point, this.#idCount)
            area++
        }
        const wrapPoint = point => this.#rect.wrap(point)
        const methods = {canFill, wrapPoint, onFill}
        new ScanlineFill8(startPoint, methods).fill()

        const ratio = Math.round((area * 100) / this.#rect.area)
        if (ratio >= MINIMUN_OCEAN_RATIO) {
            this.#areaMap.set(this.#idCount, area)
        }
        this.#idCount++
    }

    isOcean(point) {
        const wrappedPoint = this.#rect.wrap(point)
        if (this.#matrix.has(...wrappedPoint)) {
            const id = this.#matrix.get(...wrappedPoint)
            return this.#areaMap.has(id)
        }
        return false
    }
}
