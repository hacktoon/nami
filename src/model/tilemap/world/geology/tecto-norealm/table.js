export class FeatureTable {
    static PEAK = 0
    static MOUNTAIN = 1
    static HILL = 2
    static PLAIN = 3
    static DEPRESSION = 4
    static ARCHIPELAGO = 5
    static RIDGE = 6
    static SHALLOW_WATER = 7
    static DEEP_WATER = 8
    static TRENCH = 9
}


export class TectonicsTable {
    static PLATE_CONTINENTAL = 0
    static PLATE_OCEANIC = 100
    static DIR_CONVERGE = 1
    static DIR_TRANSFORM = 4
    static DIR_DIVERGE = 16
    static BOUNDARY_CODE = {
        L: TectonicsTable.PLATE_CONTINENTAL,
        W: TectonicsTable.PLATE_OCEANIC,
        C: TectonicsTable.DIR_CONVERGE,
        D: TectonicsTable.DIR_DIVERGE,
        T: TectonicsTable.DIR_TRANSFORM,
    }

    #map = new Map()

    constructor() {
        // convert the boundary to a sum of its char int codes
        // Ex: LLCC = 0011 = 0 + 0 + 1 + 1 = 2
        TECTONICS_TABLE.map(row => {
            const ints = Array.from(row.boundary).map(ch => {
                // convert each letter to its integer value
                return TectonicsTable.BOUNDARY_CODE[ch]
            })
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
            border: false, // avoid putting features on border
            features: [[0, .5], FeatureTable.PEAK]
        },
        {name: 'Orogeny',
            granularity: 1,
            features: [[0, .4], FeatureTable.MOUNTAIN]
        },
    ]},

    {boundary: 'LLCT', provinces: [
        {name: 'Low mountains',
            granularity: 1,
            features: [[.1, .3], FeatureTable.MOUNTAIN]
        },
        {name: 'Low mountains',
            granularity: 0,
            features: [[0, .1], FeatureTable.MOUNTAIN]
        },
    ]},

    {boundary: 'LLCD', provinces: [
        {name: 'Low mountains',
            granularity: 2,
            features: [[.1, .3], FeatureTable.MOUNTAIN]
        },
        {name: 'Rift',
            granularity: 0,
            features: [[0, .2], FeatureTable.DEPRESSION]
        },
    ]},

    {boundary: 'LLDT', provinces: [
        {name: 'Rift',
            granularity: 0,
            features: [[0, .2], FeatureTable.DEPRESSION]
        },
    ]},

    {boundary: 'LLDD', provinces: [
        {name: 'Rift Sea',
            granularity: 0,
            features: [[0, .5], FeatureTable.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LLTT', provinces: [
        {name: 'Low mountains',
            granularity: 0,
            features: [[0, .2], FeatureTable.MOUNTAIN]
        },
        {name: 'Low mountains',
            granularity: 0,
            features: [[.1, .2], FeatureTable.MOUNTAIN]
        },
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [[.1, .2], FeatureTable.TRENCH]
        },
        {name: 'Orogeny',
            granularity: 0,
            features: [[.1, .5], FeatureTable.PEAK]
        },
    ]},

    {boundary: 'LWCT', provinces: [
        {name: 'Early oceanic trench',
            granularity: 0,
            features: [[.1, .2], FeatureTable.TRENCH]
        },
        {name: 'Early orogeny',
            granularity: 0,
            features: [[.1, .4], FeatureTable.PEAK]
        },
    ]},

    {boundary: 'LWCD', provinces: [
        {name: 'Early oceanic ridge',
            granularity: 0,
            features: [[0, .2], FeatureTable.RIDGE]
        },
        {name: 'Passive margin',
            granularity: 0,
            features: [[0, .3], FeatureTable.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LWDD', provinces: [
        {name: 'Oceanic ridge',
            granularity: 0,
            features: [[0, .5], FeatureTable.RIDGE]
        },
        {name: 'Passive margin',
            granularity: 0,
            features: [[0, .4], FeatureTable.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LWDT', provinces: [
        {name: 'Oceanic Ridge',
            granularity: 0,
            features: [[0, .4], FeatureTable.RIDGE]
        },
        {name: 'Passive margin',
            granularity: 2,
            features: [[0, .5], FeatureTable.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LWTT', provinces: [
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [[.1, .3], FeatureTable.PEAK]
        },
        {name: 'Island arc basin',
            granularity: 0,
            features: [[.1, .4], FeatureTable.ARCHIPELAGO]
        },
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [[.1, .3], FeatureTable.TRENCH]
        },
        {name: 'Island arc',
            granularity: 0,
            features: [[.2, .5], FeatureTable.ARCHIPELAGO]
        },
    ]},

    {boundary: 'WWCT', provinces: [
        {name: 'Early oceanic trench',
            granularity: 0,
            features: [[0, .1], FeatureTable.TRENCH]
        },
        {name: 'Early island arc',
            granularity: 1,
            features: [[.06, .15], FeatureTable.PEAK]
        },
    ]},

    {boundary: 'WWCD', provinces: [
        {name: 'Oceanic basin',
            granularity: 0,
            features: [[.1, .6], FeatureTable.PEAK]
        },
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [[.1, .3], FeatureTable.PEAK]
        },
    ]},

    {boundary: 'WWDD', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [[0, .3], FeatureTable.PEAK]
        },
    ]},

    {boundary: 'WWDT', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [[0, .2], FeatureTable.PEAK]
        },
    ]},

    {boundary: 'WWTT', provinces: [
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [[.1, .4], FeatureTable.PEAK]
        },
    ]},
]
