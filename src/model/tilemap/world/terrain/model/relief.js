import { Color } from '/src/lib/color'
import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'


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


function buildNoiseTileMap(rect, seed) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: 5,
        resolution: .8,
        scale: .05,
        seed: seed,
    })
}


export class ReliefModel {
    #map

    constructor(rect, seed) {
        const noiseTileMap = buildNoiseTileMap(rect, seed)
        this.#map = Matrix.fromRect(rect, point => {
            const noise = noiseTileMap.get(point)
            // discover terrain based on ratio value [0, 1]
            let chosen = RELIEF_TABLE[0]
            for (let type of RELIEF_TABLE) {
                chosen = noise >= type.ratio ? type : chosen
            }
            return chosen
        })
    }

    get(point) {
        const id = this.#map.get(point)
        return id === WATER_OUTLINE.id ? WATER_OUTLINE : LAND_OUTLINE
    }
}
