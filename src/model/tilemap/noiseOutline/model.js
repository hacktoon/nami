import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { PointSet } from '/src/lib/point/set'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const LOWER_OUTLINE = {
    id: 0,
    name: 'Low',
    color: Color.fromHex('#333'),
}

const HIGHER_OUTLINE = {
    id: 1,
    name: 'High',
    color: Color.fromHex('#DDD'),
}


function buildNoiseTileMap(rect, seed, params) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: params.get('octaves'),
        resolution: params.get('resolution'),
        scale: params.get('scale'),
        seed: seed,
    })
}


export class OutlineModel {
    #map
    #highCount = 0
    #lowerMargins = new PointSet()
    #higherMargins = new PointSet()

    constructor(rect, seed, params) {
        const noiseTileMap = buildNoiseTileMap(rect, seed, params)
        const ratio = params.get('ratio')
        this.#map = Matrix.fromRect(rect, point => {
            let noise = noiseTileMap.getNoise(point)
            if (noise >= ratio) {
                this.#highCount += 1
                // detect margins on water and land points
                for(let sidePoint of Point.adjacents(point)) {
                    let sideNoise = noiseTileMap.getNoise(sidePoint)
                    if (sideNoise < ratio) {
                        this.#lowerMargins.add(sidePoint)
                        this.#higherMargins.add(point)
                    }
                }
                return HIGHER_OUTLINE.id
            }
            return LOWER_OUTLINE.id
        })
    }

    get(point) {
        const id = this.#map.get(point)
        return id === LOWER_OUTLINE.id ? LOWER_OUTLINE : HIGHER_OUTLINE
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

    isHigher(point) {
        return this.#map.get(point) === HIGHER_OUTLINE.id
    }

    isLower(point) {
        return this.#map.get(point) === LOWER_OUTLINE.id
    }
}
