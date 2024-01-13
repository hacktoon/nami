import { PointSet } from '/src/lib/point/set'

import { drawCity, drawCapital } from './draw'
import { buildCities, buildRealms } from './fill'


export class CivilLayer {
    // Define realms, capitals and cities

    // map a realm id to a realm object
    #realmMap = new Map()

    #cityTypeMap = new Map()

    // map a point to a realm id
    #realmGrid
    #cityPoints
    #capitalPoints

    constructor(rect, layers, realmCount) {
        this.#cityPoints = buildCities(rect, layers)
        this.#capitalPoints = this.#buildCapitals(this.#cityPoints, realmCount)
        this.#realmGrid = buildRealms(rect, layers, {
            capitalPoints: this.#capitalPoints,
            realmMap: this.#realmMap,
        })
    }

    #buildCapitals(cityPoints, realmCount) {
        const capitalPoints = new PointSet()
        let realmId = realmCount
        cityPoints.forEach(point => {
            // random city will become a capital
            if (realmId > 0) capitalPoints.add(point)
            realmId--
        })
        return capitalPoints
    }

    isCity(point) {
        return this.#cityPoints.has(point)
    }

    isCapital(point) {
        return this.#capitalPoints.has(point)
    }

    get(point) {
        const id = Math.abs(this.#realmGrid.get(point))
        return this.#realmMap.get(id)
    }

    getTotalCities() {
        return this.#cityPoints.size
    }

    getText(point) {
        const realm = this.get(point)
        if (this.#cityPoints.has(point)) {
            const isCapital = this.#capitalPoints.has(point)
            const cap = isCapital ? 'capital' : 'city'
            return `Civil(${cap},id=${realm.id},realm=${realm.name})`
        }
        return `Civil(id=${realm.id},realm=${realm.name})`
    }

    draw(point, props) {
        if (this.isCity(point)) {
            if (this.isCapital(point)) {
                drawCapital(props)
            } else {
                drawCity(props)
            }
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
