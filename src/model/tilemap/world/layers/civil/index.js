import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/point'
import { PointSet, PointArraySet } from '/src/lib/point/set'

import { drawCity, drawCapital } from './draw'
import { buildRealms } from './fill'


const CITY_RATIO = .08


export class CivilLayer {
    // Define locations and features and their relation
    // cities, caves, ruins, dungeons
    #realmNameMap = new Map()
    #colorMap = new Map()
    #realmGrid
    #cityPoints
    #capitalPoints

    constructor(rect, layers, realmCount) {
        this.#cityPoints = this.#buildCities(rect, layers)
        this.#capitalPoints = this.#buildCapitals(this.#cityPoints, realmCount)
        this.#realmGrid = buildRealms(rect, layers, {
            capitalPoints: this.#capitalPoints,
            colorMap: this.#colorMap,
            realmNameMap: this.#realmNameMap,
        })
    }

    #buildCities(rect, layers) {
        const candidates = new PointArraySet()
        const cityPoints = new PointSet()
        Grid.fromRect(rect, point => {
            const isLand = layers.surface.isLand(point)
            const isBorder = layers.surface.isBorder(point)
            const isRiver = layers.river.has(point)
            if (isLand && (isRiver || isBorder)) {
                candidates.add(point)
            }
        })
        while (candidates.size > 0) {
            const center = candidates.random()
            // remove candidate points in a circle area
            const radius = Math.floor(rect.width * CITY_RATIO)
            Point.insideCircle(center, radius, point => {
                candidates.delete(rect.wrap(point))
            })
            cityPoints.add(center)
        }
        return cityPoints
    }

    #buildCapitals(cityPoints, realmCount) {
        const capitalPoints = new PointSet()
        let realmId = realmCount
        cityPoints.forEach(point => {
            // random city will become a capital
            if (realmId > 0)
                capitalPoints.add(point)
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
        return Math.abs(this.#realmGrid.get(point))
    }

    getTotalCities() {
        return this.#cityPoints.size
    }

    getText(point) {
        const realm = this.get(point)
        const name = this.#realmNameMap.get(realm)
        if (this.#cityPoints.has(point)) {
            const isCapital = this.#capitalPoints.has(point)
            const cap = isCapital ? 'capital' : 'city'
            return `Civil(${cap},id=${realm},realm=${name})`
        }
        return `Civil(id=${realm},realm=${name})`
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
        const realm = this.#realmGrid.get(point)
        const baseColor = this.#colorMap.get(Math.abs(realm))
        const color = realm < 0 ? baseColor.toRGBA(.1) : baseColor.toRGBA(.6)
        canvas.rect(canvasPoint, tileSize, color)
    }
}
