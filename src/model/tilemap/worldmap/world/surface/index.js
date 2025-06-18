import { buildSurfaceGrid } from './model'
import {
    Surface,
    OceanSurface,
    SeaSurface,
    ContinentSurface,
    IslandSurface,
    LakeSurface
} from './type'


// Major world bodies with surface area and type
export class SurfaceLayer {
    // stores surface body id for each point
    #grid
    // maps a body id to its surface type
    #bodyTypeMap = new Map()
    // maps a body id to its surface area
    #bodyAreaMap = new Map()
    #waterArea = 0

    constructor(context) {
        this.#grid = buildSurfaceGrid({
            ...context,
            bodyTypeMap: this.#bodyTypeMap,
            bodyAreaMap: this.#bodyAreaMap,
            waterArea: this.#waterArea,
        })
    }

    get(point) {
        // negative bodyId's are surface borders
        const bodyId = Math.abs(this.#grid.get(point))
        return Surface.parse(this.#bodyTypeMap.get(bodyId))
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        const type = surface.isWater ? 'W' : 'L'
        return `Surface(${surface.name}(${type}), area=${surfaceArea})`
    }

    getArea(point) {
        const bodyId = Math.abs(this.#grid.get(point))
        return this.#bodyAreaMap.get(bodyId)
    }

    getWaterArea() {
        const area = (this.#waterArea * 100) / this.#grid.area
        return area.toFixed(1)
    }

    isWater(point) {
        return this.get(point).isWater
    }

    isLake(point) {
        return this.get(point).id == LakeSurface.id
    }

    isOcean(point) {
        return this.get(point).id == OceanSurface.id
    }

    isSea(point) {
        return this.get(point).id == SeaSurface.id
    }

    isIsland(point) {
        return this.get(point).id == IslandSurface.id
    }

    isContinent(point) {
        return this.get(point).id == ContinentSurface.id
    }

    isLand(point) {
        return ! this.get(point).isWater
    }

    isBorder(point) {
        // negative bodyId's are surface borders
        return this.#grid.get(point) < 0
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        let color = this.get(tilePoint).color
        if (this.isBorder(tilePoint)) {
            color = color.darken(20)
        }
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
