import { Point } from '/src/lib/point'

import { drawVillage, drawTown, drawCapital } from './draw'
import {
    buildCityMap,
    buildCityPoints,
    buildCitySpaces,
    City,
} from './city'


// Define realms, cities and roads
export class CivilLayer {
    #zoneRect
    #layers
    #realmMap            // map a realm id to a realm object
    #cityMap             // map a point to a city object
    #cityGrid            // grid of city ids in area
    #wildernessGrid          // grid of civil wilderness
    #cityPoints
    #routeMaskGrid   // map a point to a direction bitmask

    constructor(rect, layers, zoneRect, realmCount) {
        const context = {rect, layers, realmCount}
        // build the citys points
        const cityPoints = buildCityPoints(context)
        const cityMap = buildCityMap({...context, cityPoints})
        // build a city grid with a city id per flood area
        // build a graph connecting neighbor cities by id using fill data
        const citySpaces = buildCitySpaces({...context, cityPoints, cityMap})
        this.#zoneRect = zoneRect
        this.#routeMaskGrid = citySpaces.routeMaskGrid
        this.#cityPoints = cityPoints
        this.#cityMap = cityMap
        this.#cityGrid = citySpaces.cityGrid
        this.#wildernessGrid = citySpaces.wildernessGrid
        this.#layers = layers  // used only for basin midpoint
    }

    get(point) {
        const id = this.#cityGrid.get(point)
        const isCity = this.#cityPoints.has(point)
        const wilderness = this.#wildernessGrid.get(point)
        const city = isCity ? this.#cityMap.get(id) : undefined
        return {id, wilderness, city}
    }

    getTotalCities() {
        return this.#cityPoints.size
    }

    getText(point) {
        const civil = this.get(point)
        const roadDirections = this.#routeMaskGrid.get(point)
        const props = [
            `city=${civil.id}`,
            `wilderness=${civil.wilderness}`,
            `roads=${roadDirections.map(d=>d.name)}`
        ]
        return `Civil(${props.join(",")})`
    }

    drawCityArea(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const city = this.#cityMap.get(this.get(point).id)
        if (city) {
            const isWater = this.#layers.surface.isWater(point)
            const color = isWater ? city.color.alpha(.2) : city.color.alpha(.8)
            canvas.rect(canvasPoint, tileSize, color.toRGBA())
        }
    }

    drawCity(point, props) {
        if (this.#cityPoints.has(point)) {
            drawTown(props)
        }
    }

    drawRoute(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const width = 3
        const hexColor = this.#layers.surface.isWater(point) ? "#069" : "#444"
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const [fx, fy] = this.#layers.basin.getMidpoint(point)
        const meanderOffsetPoint = Point.multiplyScalar([fx, fy], tileSize / this.#zoneRect.width)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        const roadDirections = this.#routeMaskGrid.getAxis(point)
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
