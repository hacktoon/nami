import { drawVillage, drawTown, drawCapital } from './draw'
import { buildRealmGrid, buildRealmMap } from './realm'
import { buildCityPoints, buildCityMap } from './city'
import { buildRouteMap } from './route'
import { City, Capital, Town } from './data'


// Define realms, cities and roads
export class CivilLayer {
    #realmGrid  // map a point to a realm id
    #realmMap   // map a realm id to a realm object
    #cityMap    // map a point to a city object
    #routeMap   // map a point to a route object

    constructor(rect, layers, realmCount) {
        const [cityPoints, capitalPoints] = buildCityPoints(rect, layers, realmCount)
        this.#cityMap = buildCityMap(capitalPoints, cityPoints)
        this.#realmMap = buildRealmMap(capitalPoints)
        this.#realmGrid = buildRealmGrid({rect, layers, capitalPoints})
        this.#routeMap = buildRouteMap({
            rect, layers, capitalPoints, cityPoints,
            cityMap: this.#cityMap,
        })
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
        return this.#realmMap.get(id)
    }

    getTotalCities() {
        return this.#cityMap.size
    }

    getText(point) {
        const realm = this.get(point)
        const props = [`realm=${realm.name}(${realm.id})`]
        if (this.#cityMap.has(point)) {
            const city = this.#cityMap.get(point)
            const type = City.parse(city.type).name.toLowerCase()
            props.push(`city="${city.name} ${type}", population=${city.population}`)
        }
        return `Civil(${props.join(",")})`
    }

    draw(point, props) {
        if (! this.isCity(point))
            return
        if (this.isCapital(point)) {
            drawCapital(props)
        } else if (this.isTown(point)) {
            drawTown(props)
        } else {
            drawVillage(props)
        }
    }

    drawRealm(point, props) {
        const {canvas, canvasPoint, tileSize} = props
        const id = this.#realmGrid.get(point)
        const realm = this.#realmMap.get(Math.abs(id))
        const color = id < 0 ? realm.color.alpha(.1) : realm.color.alpha(.6)
        canvas.rect(canvasPoint, tileSize, color.toRGBA())
    }
}
