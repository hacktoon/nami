import { Color } from '/src/lib/color'


const TYPE_TABLE = [
    {
        id: 0,
        ratio: 0,
        name: 'Ocean',
        isLand: false,
        color: Color.fromHex('#216384'),
    },
    {
        id: 1,
        ratio: .5,
        name: 'Sea',
        isLand: false,
        color: Color.fromHex('#2878a0'),
    },
    {
        id: 2,
        ratio: .6,
        name: 'Plain',
        isLand: true,
        color: Color.fromHex('#99d966'),
    },
    {
        id: 3,
        ratio: .75,
        name: 'Plateau',
        isLand: true,
        color: Color.fromHex('#a4a05b'),
    },
    {
        id: 4,
        ratio: .85,
        name: 'Mountain',
        isLand: true,
        color: Color.fromHex('#CCC'),
    }
]


export class TerrainModel {
    constructor() {
        const entries = TYPE_TABLE.map(terrain => [terrain.id, terrain])
        this.idMap = new Map(entries)
    }

    terrainByRatio(ratio) {
        // discover terrain based on ratio value [0, 1]
        let chosen = TYPE_TABLE[0]
        for (let type of TYPE_TABLE) {
            if (ratio >= type.ratio)
                chosen = type
        }
        return chosen
    }

    fromId(id) {
        return this.idMap.get(id)
    }
}