
export class TectonicsTable {
    static PLATE_CONTINENTAL = 0
    static PLATE_OCEANIC = 100
    static DIR_CONVERGE = 1
    static DIR_TRANSFORM = 4
    static DIR_DIVERGE = 16
    static INT_MAP = {
        L: TectonicsTable.PLATE_CONTINENTAL,
        W: TectonicsTable.PLATE_OCEANIC,
        C: TectonicsTable.DIR_CONVERGE,
        D: TectonicsTable.DIR_DIVERGE,
        T: TectonicsTable.DIR_TRANSFORM,
    }

    static FEAT_PEAK = 0
    static FEAT_MOUNTAIN = 1
    static FEAT_HILL = 2
    static FEAT_PLAIN = 3
    static FEAT_DEPRESSION = 4
    static FEAT_ARCHIPELAGO = 5
    static FEAT_SHALLOW_WATER = 6
    static FEAT_DEEP_WATER = 7
    static FEAT_TRENCH = 8
    static FEATS = [
        TectonicsTable.FEAT_PEAK,
        TectonicsTable.FEAT_MOUNTAIN,
        TectonicsTable.FEAT_HILL,
        TectonicsTable.FEAT_PLAIN,
        TectonicsTable.FEAT_DEPRESSION,
        TectonicsTable.FEAT_SHALLOW_WATER,
        TectonicsTable.FEAT_DEEP_WATER,
        TectonicsTable.FEAT_TRENCH,
    ]

    #map = new Map()

    constructor() {
        // convert the boundary to a sum of its char int codes
        // Ex: LLCC = 0011 = 0 + 0 + 1 + 1 = 2
        const intMap = TectonicsTable.INT_MAP
        TECTONICS_TABLE.map(row => {
            const ints = Array.from(row.boundary).map(ch => intMap[ch])
            const id = ints.reduce((a, b) => a + b, 0)
            const provinces = row.provinces
            const heavier = provinces[0]
            const lighter = provinces.length > 1 ? provinces[1] : heavier
            this.#map.set(id, {...row, provinces: [heavier, lighter]})
        })
    }

    getBoundary(boundaryId) {
        return this.#map.get(boundaryId)
    }
}


const TECTONICS_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {boundary: 'LLCC', provinces: [
        {name: 'Orogeny',
            granularity: 0,
            features: [[0, .5], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Orogeny',
            granularity: 1,
            features: [[0, .4], TectonicsTable.FEAT_HILL]
        },
    ]},

    {boundary: 'LLCT', provinces: [
        {name: 'Low mountains',
            granularity: 1,
            features: [[.1, .3], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Low mountains',
            granularity: 0,
            features: [[0, .1], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LLCD', provinces: [
        {name: 'Low mountains',
            granularity: 2,
            features: [[.1, .3], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Rift',
            granularity: 0,
            features: [[0, .2], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LLDT', provinces: [
        {name: 'Rift',
            granularity: 0,
            features: [[0, .2], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LLDD', provinces: [
        {name: 'Rift Sea',
            granularity: 0,
            features: [[0, .5], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LLTT', provinces: [
        {name: 'Low mountains',
            granularity: 0,
            features: [[0, .2], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Low mountains',
            granularity: 0,
            features: [[.1, .2], TectonicsTable.FEAT_PEAK]
        },
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [[.1, .4], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Orogeny',
            granularity: 0,
            features: [[.1, .5], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LWCT', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [[.1, .3], TectonicsTable.FEAT_PEAK]
        },
        {name: ' Small orogeny',
            granularity: 0,
            features: [[.1, .6], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LWCD', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [[0, .2], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Passive margin',
            granularity: 0,
            features: [[0, .2], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LWDD', provinces: [
        {name: 'Oceanic Rift',
            granularity: 0,
            features: [[0, .5], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Passive margin',
            granularity: 0,
            features: [[0, .3], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LWDT', provinces: [
        {name: 'Oceanic Rift',
            granularity: 0,
            features: [[0, .4], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Passive margin',
            granularity: 2,
            features: [[0, .4], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'LWTT', provinces: [
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [[.1, .3], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Island arc basin',
            granularity: 0,
            features: [[.1, .3], TectonicsTable.FEAT_PEAK]
        },
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [[.1, .3], TectonicsTable.FEAT_TRENCH]
        },
        {name: 'Island arc',
            granularity: 0,
            features: [[.2, .5], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'WWCT', provinces: [
        {name: 'Shallow oceanic trench',
            granularity: 0,
            features: [[0, .1], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Early island arc',
            granularity: 1,
            features: [[.06, .15], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'WWCD', provinces: [
        {name: 'Oceanic basin',
            granularity: 0,
            features: [[.1, .6], TectonicsTable.FEAT_PEAK]
        },
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [[.1, .3], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'WWDD', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [[0, .3], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'WWDT', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [[0, .2], TectonicsTable.FEAT_PEAK]
        },
    ]},

    {boundary: 'WWTT', provinces: [
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [[.1, .4], TectonicsTable.FEAT_PEAK]
        },
    ]},
]
