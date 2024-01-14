import { drawVillage, drawTown, drawCapital } from './draw'
import { buildCityMap, buildRealms } from './fill'
import {
    Capital,
    Town,
    Village
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
            rect, layers,
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

    isVillage(point) {
        return this.#cityMap.get(point).type === Village.id
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
        if (this.#cityMap.has(point)) {
            const cap = this.isCapital(point) ? 'capital' : 'city'
            return `Civil(${cap},id=${realm.id},realm=${realm.name})`
        }
        return `Civil(id=${realm.id},realm=${realm.name})`
    }

    draw(point, props) {
        if (! this.isCity(point))
            return
        if (this.isCapital(point)) {
            drawCapital(props)
        } else if (this.isVillage(point)) {
            drawVillage(props)
        } else {
            drawTown(props)
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
