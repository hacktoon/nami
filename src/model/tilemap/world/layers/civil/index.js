import { Point } from '/src/lib/point'

import { drawVillage, drawTown, drawCapital } from './draw'
import {
    buildCityRealms,
    buildCityPoints,
    buildCitySpaces,
    Capital,
    City,
    Town
} from './city'
import { buildRouteMap } from './route'
import { loadConfig } from '@babel/core/lib/config/files'


// Define realms, cities and roads
export class CivilLayer {
    #layers
    #realmMap            // map a realm id to a realm object
    #cityMap             // map a point to a city object
    #cityGrid            // grid of city ids in area
    #civilLevel          // grid of civil level
    #cityPoints
    #directionMaskGrid   // map a point to a direction bitmask

    constructor(rect, layers, realmCount) {
        const context = {rect, layers, realmCount}
        // build the citys points
        const cityPoints = buildCityPoints(context)
        // build a city grid with a city id per flood area
        // build a graph connecting neighbor cities by id using fill data
        const [cityGrid, cityGraph, civilLevel] = buildCitySpaces({...context, cityPoints})
        const [cityMap, capitalPoints] = buildCityRealms({...context, cityPoints})
        this.#directionMaskGrid = buildRouteMap({...context, cityPoints})
        this.#cityMap = cityMap
        this.#cityPoints = cityPoints
        this.#cityGrid = cityGrid
        this.#civilLevel = civilLevel
        this.#layers = layers  // used only for basin midpoint
    }

    get(point) {
        const id = this.#cityGrid.get(point)
        const isCity = this.#cityPoints.has(point)
        const level = this.#civilLevel.get(point)
        const city = isCity ? this.#cityMap.get(id) : undefined
        return {id, level, city}
    }

    getTotalCities() {
        return this.#cityPoints.size
    }

    getText(point) {
        const civil = this.get(point)
        const city = civil.city
        // const realm = civil.realm
        // const roadDirs = this.#directionMaskGrid.get(point)
        const props = [
            `city=${civil.id}`,
            `level=${civil.level}`
        ]
        // if (roadDirs) {
        //     props.push(`roads=${roadDirs.map(d => d.name)}`)
        // }
        if (city) {
            const type = City.parse(city.type).name.toLowerCase()
            props.push(`${city.name} ${type}`)
        }
        return `Civil(${props.join(",")})`
    }

    draw(point, props) {
        if (this.#cityPoints.has(point)) {
            const civil = this.get(point)
            const city = civil.city
            if (city.type === Capital.id) {
                drawCapital(props)
            } else if (city.type === Town.id) {
                drawTown(props)
            } else {
                drawVillage(props)
            }
        } else {
            this.drawRoad(point, props)
        }
    }

    drawCivil(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const city = this.#cityMap.get(this.get(point).id)
        const isWater = this.#layers.surface.isWater(point)
        const color = isWater ? city.color.alpha(.2) : city.color.alpha(.8)
        canvas.rect(canvasPoint, tileSize, color.toRGBA())
    }

    drawRoad(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const width = 3
        const hexColor = "#444"
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const [fx, fy] = this.#layers.basin.getMidpoint(point)
        const meanderOffsetPoint = Point.multiplyScalar([fx, fy], tileSize)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        const roadDirections = this.#directionMaskGrid.get(point)
        // for each neighbor with a route connection
        for(let axisOffset of roadDirections.map(d => d.axis)) {
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
