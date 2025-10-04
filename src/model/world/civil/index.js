import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'

import { drawVillage, drawTown, drawCapital } from './draw'

import { buildModel } from './model'


// Define realms, cities and roads
export class CivilLayer {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    get(point) {
        const id = this.#model.cityGrid.get(point)
        const isCity = this.#model.cityPoints.has(point)
        const wilderness = this.#model.wildernessGrid.get(point)
        const city = isCity ? this.#model.cityMap.get(id) : undefined
        return {id, wilderness, city}
    }

    getTotalCities() {
        return this.#model.cityPoints.size
    }

    getText(point) {
        const civil = this.get(point)
        const roadDirections = this.#model.routeMaskGrid.get(point)
        const props = [
            `city=${civil.id}`,
            `wilderness=${civil.wilderness}`,
            `roads=${roadDirections.map(d=>d.name)}`
        ]
        return `Civil(${props.join(",")})`
    }

    draw(props, params) {
        const {world, tilePoint} = props
        world.biome.draw(props, params)
        if (params.get("showCityArea")) {
            this.#drawCityArea(tilePoint, props)
        }
        if (params.get("showRivers")) {
            world.river.draw(props, params)
        }
        if (params.get('showRoutes')) {
            this.#drawRoute(tilePoint, props)
        }
        if (params.get('showCities') && this.#model.cityPoints.has(tilePoint)) {
            drawTown(props)
        }
    }

    #drawCityArea(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const city = this.#model.cityMap.get(this.get(point).id)
        if (city) {
            const isWater = props.world.surface.isWater(point)
            const color = isWater
                ? Color.DARKBLUE.average(city.color.darken(200))
                : city.color
            canvas.rect(canvasPoint, tileSize, color.toRGBA())
        }
    }

    #drawRoute(point, props) {
        const {world, canvas, canvasPoint, tileSize} = props
        const roadDirections = this.#model.routeMaskGrid.getAxis(point)
        if (roadDirections.length == 0) return
        const width = 3
        const hexColor = world.surface.isWater(point) ? "#036" : "#444"
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const midpointIndex = this.#model.midpointIndexGrid.get(point)
        const midpoint = world.chunkRect.indexToPoint(midpointIndex)
        const meanderOffsetPoint = Point.multiplyScalar(midpoint, tileSize / world.chunkSize)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        // for each neighbor with a route connection
        for(let axisOffset of roadDirections) {
            // build a point for each flow that points to this point
            // create a midpoint at tile's square side
            const edgeMidPoint = [
                midCanvasPoint[0] + axisOffset[0] * midSize,
                midCanvasPoint[1] + axisOffset[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, width, hexColor)
        }
    }
}
