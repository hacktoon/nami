import { Color } from '/src/lib/color'


export const WATER_OUTLINE = {
    id: 0, name: 'Water', color: Color.fromHex('#2878A0')
}
export const LAND_OUTLINE = {
    id: 1, name: 'Land', color: Color.fromHex('#AAD966')
}


const TYPE_TABLE = [
    {
        id: 0,
        ratio: 0,
        name: 'Ocean',
        color: Color.fromHex('#216384'),
    },
    {
        id: 1,
        ratio: .3,
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
        ratio: .7,
        name: 'Plateau',
        color: Color.fromHex('#666'),
    },
    {
        id: 4,
        ratio: .8,
        name: 'Mountain',
        color: Color.fromHex('#CCC'),
    }
]


export class TerrainModel {
    constructor() {
        const entries = TYPE_TABLE.map(climate => [climate.id, climate])
        this.idMap = new Map(entries)
    }

    terrainIdByRatio(ratio) {
        // discover zone based on ratio value [0, 1]
        let item = TYPE_TABLE[0].id
        for (let type of TYPE_TABLE) {
            if (ratio >= type.ratio)
                item = type.id
        }
        return item
    }

    fromId(id) {
        return this.idMap.get(id)
    }
}