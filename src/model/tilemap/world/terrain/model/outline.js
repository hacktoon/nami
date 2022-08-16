import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { PointSet } from '/src/lib/point/set'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const RATE = .6

const OCEAN_TYPE = {
    id: 0,
    name: 'Ocean',
    water: true,
    color: Color.fromHex('#216384'),
}

const SEA_TYPE = {
    id: 1,
    name: 'Sea',
    water: true,
    color: Color.fromHex('#2878a0'),
}

const PLAIN_TYPE = {
    id: 2,
    name: 'Plain',
    water: false,
    color: Color.fromHex('#99d966'),
}


function buildNoiseTileMap(rect, seed) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: 6,
        resolution: .8,
        scale: .02,
        seed: seed,
    })
}


function platformTileMap(rect, seed) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: 5,
        resolution: .8,
        scale: .05,
        seed: seed,
    })
}


export class OutlineModel {
    #map
    #landCount = 0
    #lowerMargins = new PointSet()
    #higherMargins = new PointSet()

    #isNoiseLand(noise) {
        return noise >= RATE
    }

    #getOutline(noiseTileMap, point) {
        let noise = noiseTileMap.getNoise(point)
        if (this.#isNoiseLand(noise)) {
            this.#landCount += 1
            // detect margins on water and land points
            for(let sidePoint of Point.adjacents(point)) {
                let sideNoise = noiseTileMap.getNoise(sidePoint)
                if (! this.#isNoiseLand(sideNoise)) {
                    this.#lowerMargins.add(sidePoint)
                    this.#higherMargins.add(point)
                }
            }
            return PLAIN_TYPE.id
        }
        return OCEAN_TYPE.id
    }

    constructor(rect, seed) {
        const noiseTileMap = buildNoiseTileMap(rect, seed)
        const platformNoiseTileMap = platformTileMap(rect, seed)
        this.#map = Matrix.fromRect(rect, point => {
            const outline = this.#getOutline(noiseTileMap, point)
            return outline
        })
    }

    get(point) {
        const id = this.#map.get(point)
        return id === OCEAN_TYPE.id ? OCEAN_TYPE : PLAIN_TYPE
    }

    get landCount() {
        return this.#landCount
    }

    isLowerMargin(point) {
        return this.#lowerMargins.has(point)
    }

    isHigherMargin(point) {
        return this.#higherMargins.has(point)
    }

    isLand(point) {
        return this.#map.get(point) === PLAIN_TYPE.id
    }

    isWater(point) {
        return this.#map.get(point) === OCEAN_TYPE.id
    }
}
