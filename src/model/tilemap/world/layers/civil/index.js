import { Point } from '/src/lib/point'

import { drawVillage, drawTown, drawCapital } from './draw'
import { buildRealmGrid, buildRealmMap } from './realm'
import {
    buildCityPoints,
    buildCityMap,
    buildCityGrid,
    Capital,
    City,
    Town
} from './city'
import { buildRouteMap } from './route'


// Define realms, cities and roads
export class CivilLayer {
    #realmGrid  // map a point to a realm id
    #realmMap   // map a realm id to a realm object
    #cityMap    // map a point to a city object
    #cityGrid    // map a point to a city object
    #directionMaskGrid   // map a point to a direction bitmask

    constructor(rect, layers, realmCount) {
        const context = {rect, layers, realmCount}
        const [cityPoints, capitalPoints] = buildCityPoints(context)
        const cityMap = buildCityMap(capitalPoints, cityPoints)
        this.#cityGrid = buildCityGrid({...context, capitalPoints, cityPoints})
        this.#realmMap = buildRealmMap(capitalPoints)
        this.#realmGrid = buildRealmGrid({...context, capitalPoints})
        this.#directionMaskGrid = buildRouteMap({
            ...context, capitalPoints, cityPoints
        })
        this.#cityMap = cityMap
        this.layers = layers  // used only for basin midpoint
    }

    isCity(point) {
        return this.#cityMap.has(point)
    }

    isCapital(point) {
        return this.#cityMap.get(point).type === Capital.id
    }

    isTown(point) {
        return this.#cityMap.get(point).type === Town.id
    }

    get(point) {
        const id = Math.abs(this.#realmGrid.get(point))
        return {
            realm: this.#realmMap.get(id),
            city: this.#cityGrid.get(point),
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
            // `realm=${realm.name}(${realm.id})`,
            `city=${civil.city}`
        ]
        // if (roadDirs) {
        //     props.push(`roads=${roadDirs.map(d => d.name)}`)
        // }
        if (this.#cityMap.has(point)) {
            const city = this.#cityMap.get(point)
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
        const id = this.#realmGrid.get(point)
        const realm = this.#realmMap.get(Math.abs(id))
        const color = id < 0 ? realm.color.alpha(.1) : realm.color.alpha(.6)
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
