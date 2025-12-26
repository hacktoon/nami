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
        const borderId = this.#model.borderType.get(point)
        return {
            type: Surface.parse(this.#model.bodyType.get(bodyId)),
            borderType: Surface.parse(borderId),
        }
    }

    getText(point) {
        const surface = this.get(point)
        const surfaceArea = this.getArea(point)
        const attrs = [
            `${surface.type.name}`,
            `area=${surfaceArea}`,
            `border=${surface.borderType.name}`,
        ].join(', ')
        return `Surface(${attrs})`
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
        return this.get(point).type.isWater
    }

    isLand(point) {
        return ! this.isWater(point)
    }

    isBorder(point) {
        return this.#model.borderType.get(point) != Surface.id
    }

    isLake(point) {
        return this.get(point).type.id == LakeSurface.id
    }

    isOcean(point) {
        return this.get(point).type.id == OceanSurface.id
    }

    isSea(point) {
        return this.get(point).type.id == SeaSurface.id
    }

    isIsland(point) {
        return this.get(point).type.id == IslandSurface.id
    }

    isContinent(point) {
        return this.get(point).type.id == ContinentSurface.id
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        const surface = this.get(tilePoint)
        let color = surface.type.color
        if (this.isBorder(tilePoint)) {
            color = color.darken(20)
        }
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
