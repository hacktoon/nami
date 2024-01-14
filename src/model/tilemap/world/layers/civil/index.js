import { drawVillage, drawTown, drawCapital } from './draw'
import { buildCityMap, buildRealms } from './fill'
import {
    City,
    Capital,
    Town,
} from './data'


export class CivilLayer {
    // Define realms, capitals and cities

    // map a realm id to a realm object
    #realmMap = new Map()
    // map a point to a city object
    #cityMap

    // map a point to a realm id
    #realmGrid

    constructor(rect, layers, realmCount) {
        this.#cityMap = buildCityMap(rect, layers, realmCount)
        this.#realmGrid = buildRealms({
            rect,
            layers,
            cityMap: this.#cityMap,
            realmMap: this.#realmMap,
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
