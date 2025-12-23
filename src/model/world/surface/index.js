import { buildSurfaceModel } from './model'
import {
    Surface,
    LakeSurface,
    SeaSurface,
    OceanSurface,
    IslandSurface,
    ContinentSurface
} from './type'


// Major world bodies with surface area and type
export class SurfaceLayer {
    #model

    constructor(context) {
        this.#model = buildSurfaceModel(context)
    }

    get(point) {
        const bodyId = this.#model.body.get(point)
        return Surface.parse(this.#model.bodyType.get(bodyId))
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        const type = surface.isWater ? 'W' : 'L'
        return `Surface(${surface.name}(${type}), area=${surfaceArea})`
    }

    getArea(point) {
        const bodyId = this.#model.body.get(point)
        return this.#model.bodyArea.get(bodyId)
    }

    getWaterArea() {
        const area = (this.#model.waterArea * 100) / this.#model.body.area
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
        return this.#model.border.has(point)
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
