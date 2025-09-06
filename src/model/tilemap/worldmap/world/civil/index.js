import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'
import { Grid } from '/src/lib/grid'

import { drawVillage, drawTown, drawCapital } from './draw'
import {
    buildCityMap,
    buildCityPoints,
    buildCitySpaces,
} from './city'


// Define realms, cities and roads
export class CivilLayer {
    #context
    #realmMap            // map a realm id to a realm object
    #cityMap             // map a point to a city object
    #cityGrid            // grid of city ids in area
    #wildernessGrid          // grid of civil wilderness
    #cityPoints
    #routeMaskGrid   // map a point to a direction bitmask
    // map a point to a point index in a chunk rect
    #midpointIndexGrid

    constructor(context) {
        const cityPoints = buildCityPoints(context)
        const cityMap = buildCityMap({...context, cityPoints})
        // build a city grid with a city id per flood area
        // build a graph connecting neighbor cities by id using fill data
        const midpointIndexGrid = Grid.fromRect(context.rect, () => null)
        const citySpaces = buildCitySpaces({...context, midpointIndexGrid, cityPoints, cityMap})
        this.#context = context
        this.#routeMaskGrid = citySpaces.routeMaskGrid
        this.#cityPoints = cityPoints
        this.#cityMap = cityMap
        this.#cityGrid = citySpaces.cityGrid
        this.#wildernessGrid = citySpaces.wildernessGrid
        this.#midpointIndexGrid = midpointIndexGrid
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

    draw(props, params) {
        const {world, tilePoint} = props
        world.surface.draw(props, params)
        if (params.get("showCityArea")) {
            this.#drawCityArea(tilePoint, props)
        }
        if (params.get("showRivers")) {
            world.river.draw(props, params)
        }
        if (params.get('showRoutes')) {
            this.#drawRoute(tilePoint, props)
        }
        if (params.get('showCities') && this.#cityPoints.has(tilePoint)) {
            drawTown(props)
        }
    }

    #drawCityArea(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const city = this.#cityMap.get(this.get(point).id)
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
        const roadDirections = this.#routeMaskGrid.getAxis(point)
        if (roadDirections.length == 0) return
        const chunkSize = this.#context.chunkSize
        const width = 3
        const hexColor = world.surface.isWater(point) ? "#036" : "#444"
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const tileRatio = tileSize / chunkSize
        const midpointIndex = this.#midpointIndexGrid.get(point)
        const midpoint = this.#context.chunkRect.indexToPoint(midpointIndex)
        const meanderOffsetPoint = Point.multiplyScalar(midpoint, tileRatio)
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
