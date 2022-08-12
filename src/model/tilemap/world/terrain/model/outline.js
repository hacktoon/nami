import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { PointSet } from '/src/lib/point/set'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const WATER_OUTLINE = {
    id: 0,
    name: 'Water',
    ratio: 0,
    color: Color.fromHex('#216384'),
}

const LAND_OUTLINE = {
    id: 1,
    name: 'Land',
    ratio: .6,
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


export class OutlineModel {
    #map
    #highCount = 0
    #lowerMargins = new PointSet()
    #higherMargins = new PointSet()

    #isNoiseLand(noise) {
        return noise >= LAND_OUTLINE.ratio
    }

    constructor(rect, seed) {
        const noiseTileMap = buildNoiseTileMap(rect, seed)
        this.#map = Matrix.fromRect(rect, point => {
            let noise = noiseTileMap.getNoise(point)
            if (this.#isNoiseLand(noise)) {
                this.#highCount += 1
                // detect margins on water and land points
                for(let sidePoint of Point.adjacents(point)) {
                    let sideNoise = noiseTileMap.getNoise(sidePoint)
                    if (! this.#isNoiseLand(sideNoise)) {
                        this.#lowerMargins.add(sidePoint)
                        this.#higherMargins.add(point)
                    }
                }
                return LAND_OUTLINE.id
            }
            return WATER_OUTLINE.id
        })
    }

    get(point) {
        const id = this.#map.get(point)
        return id === WATER_OUTLINE.id ? WATER_OUTLINE : LAND_OUTLINE
    }

    get highCount() {
        return this.#highCount
    }

    isLowerMargin(point) {
        return this.#lowerMargins.has(point)
    }

    isHigherMargin(point) {
        return this.#higherMargins.has(point)
    }

    isLand(point) {
        return this.#map.get(point) === LAND_OUTLINE.id
    }

    isWater(point) {
        return this.#map.get(point) === WATER_OUTLINE.id
    }
}
