import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { PointSet } from '/src/lib/point/set'
import { NoiseTileMap } from '/src/model/tilemap/noise'


export const WATER_OUTLINE = {
    id: 0,
    name: 'Water',
    ratio: 0,
    color: Color.fromHex('#216384'),
}
export const LAND_OUTLINE = {
    id: 1,
    name: 'Land',
    ratio: .6,
    color: Color.fromHex('#99d966'),
}


const RELIEF_TABLE = [
    {
        id: 0,
        ratio: 0,
        name: 'Ocean',
        color: Color.fromHex('#216384'),
    },
    {
        id: 1,
        ratio: .5,
        name: 'Sea',
        color: Color.fromHex('#2878a0'),
    },
    {
        id: 2,
        ratio: .6,
        name: 'Plain',
        color: Color.fromHex('#99d966'),
    },
    {
        id: 3,
        ratio: .75,
        name: 'Plateau',
        color: Color.fromHex('#a4a05b'),
    },
    {
        id: 4,
        ratio: .85,
        name: 'Mountain',
        color: Color.fromHex('#CCC'),
    }
]


function buildOutlineNoiseTileMap(rect, seed) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: 6,
        resolution: .8,
        scale: .02,
        seed: seed,
    })
}


function buildReliefNoiseTileMap(rect, seed) {
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
    #waterMargins = new PointSet()
    #landMargins = new PointSet()

    #isNoiseLand(noise) {
        return noise >= LAND_OUTLINE.ratio
    }

    constructor(rect, seed) {
        const noiseTileMap = buildOutlineNoiseTileMap(rect, seed)
        this.#map = Matrix.fromRect(rect, point => {
            let noise = noiseTileMap.getNoise(point)
            if (this.#isNoiseLand(noise)) {
                this.#landCount += 1
                // detect margins on water and land points
                for(let sidePoint of Point.adjacents(point)) {
                    let sideNoise = noiseTileMap.getNoise(sidePoint)
                    if (! this.#isNoiseLand(sideNoise)) {
                        this.#waterMargins.add(sidePoint)
                        this.#landMargins.add(point)
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

    static landCount() {
        return this.#landCount
    }

    isWaterMargin(point) {
        return this.#waterMargins.has(point)
    }

    isLandMargin(point) {
        return this.#landMargins.has(point)
    }

    isLand(point) {
        return this.#map.get(point) === LAND_OUTLINE.id
    }

    isWater(point) {
        return this.#map.get(point) === WATER_OUTLINE.id
    }
}


// terrainByRatio(ratio) {
//     // discover terrain based on ratio value [0, 1]
//     let chosen = RELIEF_TABLE[0]
//     for (let type of RELIEF_TABLE) {
//         if (ratio >= type.ratio)
//             chosen = type
//     }
//     return chosen
// }

// fromId(id) {
//     return this.idMap.get(id)
// }
