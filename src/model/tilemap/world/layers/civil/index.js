import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'

import { drawVillage, drawTown, drawCapital } from './draw'
import { buildRealmGrid, buildRealmMap } from './realm'
import {
    buildCityMap,
    buildCityGrid,
    Capital,
    City,
    Town
} from './city'
import { buildRouteMap } from './route'


// Define realms, cities and roads
export class CivilLayer {
    #realmMap            // map a realm id to a realm object
    #cityMap             // map a point to a city object
    #cityGrid            // map a point to a city object
    #directionMaskGrid   // map a point to a direction bitmask

    constructor(rect, layers, realmCount) {
        const context = {rect, layers, realmCount}
        const [cityMap, cityPoints] = buildCityMap(context)
        // build a grid filling each cell with a city id
        this.#cityGrid = buildCityGrid({...context, cityPoints})
        // this.#realmMap = buildRealmMap(capitalPoints)
        this.#directionMaskGrid = buildRouteMap({
            ...context, cityPoints
        })
        this.#cityMap = cityMap
        this.layers = layers  // used only for basin midpoint
    }

    isCity(point) {
        return this.#cityGrid.get(point) < 0
    }

    isCapital(point) {
        const id = this.get(point).id
        return this.isCity(point) && this.#cityMap.get(id).type === Capital.id
    }

    isTown(point) {
        const id = this.get(point).id
        return this.isCity(point) && this.#cityMap.get(id).type === Town.id
    }

    get(point) {
        const id = Math.abs(this.#cityGrid.get(point))
        return {
            id,
        }
    }

    getTotalCities() {
        return this.#cityMap.size
    }

    getText(point) {
        const civil = this.get(point)
        // const realm = civil.realm
        const roadDirs = this.#directionMaskGrid.get(point)
        const props = [
            `city=${civil.id}`
        ]
        // if (roadDirs) {
        //     props.push(`roads=${roadDirs.map(d => d.name)}`)
        // }
        if (this.isCity(point)) {
            const city = this.#cityMap.get(civil.id)
            const type = City.parse(city.type).name.toLowerCase()
            props.push(`city="${city.name} ${type}"`)
        }
        return `Civil(${props.join(",")})`
    }

    draw(point, props) {
        if (this.isCity(point)) {
            if (this.isCapital(point)) {
                drawCapital(props)
            } else if (this.isTown(point)) {
                drawTown(props)
            } else {
                drawVillage(props)
            }
        } else {
            this.drawRoad(point, props)
        }
    }

    drawRealm(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const city = this.#cityMap.get(this.get(point).id)
        const isWater = this.layers.surface.isWater(point)
        const color = isWater ? city.color.alpha(.1) : city.color.alpha(.8)
        canvas.rect(canvasPoint, tileSize, color.toRGBA())
    }

    drawRoad(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const width = 3
        const hexColor = "#444"
        const midSize = Math.round(tileSize / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        // calc meander offset point on canvas
        const [fx, fy] = this.layers.basin.getMidpoint(point)
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
