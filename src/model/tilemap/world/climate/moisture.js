import { Matrix } from '/lib/base/matrix'
import { HeightTileMap } from '/lib/heightmap'

export const VERY_DRY = 0
export const DRY = 1
export const SEASONAL = 2
export const WET = 3
export const VERY_WET = 4

const MOISTURE_TABLE = [
    { id: 0, height: 0,   color: "#ffa100", name: "Very dry" },
    { id: 1, height: 30,  color: "#ffe600", name: "Dry" },
    { id: 2, height: 90,  color: "#aaff60", name: "Seasonal" },
    { id: 3, height: 150, color: "#60ffca", name: "Wet" },
    { id: 4, height: 210, color: "#0080ff", name: "Very wet" }
]


export class MoistureMap {
    constructor(size, roughness) {
        this.matrix = new Matrix(size, size)
        this.size = size

        this._buildMap(size, roughness)
    }

    _buildMap(size, roughness) {
        new HeightTileMap(size, roughness, (height, point) => {
            let moisture = this._buildMoisture(height)
            this.matrix.set(point, moisture)
        })
    }

    _buildMoisture(height) {
        let id
        for (let reference of MOISTURE_TABLE) {
            if (height >= reference.height) {
                id = reference.id
            } else {
                break
            }
        }
        return id
    }

    isVeryDry(point) { return this.get(point) == VERY_DRY }

    isDry(point) { return this.get(point) == DRY }

    isSeasonal(point) { return this.get(point) == SEASONAL }

    isWet(point) { return this.get(point) == WET }

    isVeryWet(point) { return this.get(point) == VERY_WET }

    get(point) {
        return this.matrix.get(point)
    }

    getName(point) {
        const id = this.get(point)
        return MOISTURE_TABLE[id].name
    }

    getColor(point) {
        const id = this.get(point)
        return MOISTURE_TABLE[id].color
    }
}
