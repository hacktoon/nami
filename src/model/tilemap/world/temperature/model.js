import { Color } from '/src/lib/color'
import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const TYPES = [
    {
        id: 5,
        name: 'Frozen',
        ratio: .85,
        color: Color.fromHex('#edffff'),
    },
    {
        id: 4,
        name: 'Cold',
        ratio: .7,
        color: Color.fromHex('#c4fdff'),
    },
    {
        id: 3,
        name: 'Cool',
        ratio: .55,
        color: Color.fromHex('#99d966'),
    },
    {
        id: 2,
        name: 'Warm',
        ratio: .35,
        color: Color.fromHex('#ffc600'),
    },
    {
        id: 1,
        name: 'Hot',
        ratio: 0,
        color: Color.fromHex('#ff4444'),
    }
]

function buildNoiseTileMap(rect, seed) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: 6,
        resolution: .7,
        scale: .02,
        seed: seed,
    })
}

export class TemperatureModel {
    #typeMap
    #map

    constructor(rect, seed) {
        const entries = TYPES.map(type => [type.id, type])
        const noiseMap = buildNoiseTileMap(rect, seed)
        this.#map = new Map(entries)
        this.#typeMap = Matrix.fromRect(rect, point => {
            const noise = noiseMap.getNoise(point)
            for (let type of TYPES) {
                if (noise >= type.ratio)
                    return type.id
            }
            return TYPES[TYPES.length - 1].id
        })
    }

    get(point) {
        const id = this.#typeMap.get(point)
        return this.#map.get(id)
    }
}
