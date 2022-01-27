
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
        BOUNDARY_TABLE.map(boundary => {
            const ints = Array.from(boundary.code).map(char => {
                // convert each char to its integer value
                return TectonicsTable.BOUNDARY_CODE[char]
            })
            const id = ints.reduce((a, b) => a + b, 0)
            const provinces = boundary.provinces
            const heavier = provinces[0]
            const lighter = provinces.length > 1 ? provinces[1] : heavier
            this.#map.set(id, {...boundary, provinces: [
                heavier, lighter
            ]})
        })
    }

    getBoundary(boundaryId) {
        return this.#map.get(boundaryId)
    }

    getFeature(featureId) {
        return FEATURE_TABLE[featureId]
    }
}


export class Feature {
    static MOUNTAIN = 0
    static PLATFORM = 1
    static HILL = 2
    static PLAIN = 3
    static DEPRESSION = 4
    static RIFT_SEA = 5
    static ISLAND_ARC = 6
    static SEAMOUNT = 7
    static OCEANIC_RIDGE = 8
    static OCEANIC_PLAIN = 9
    static TRENCH = 10
}


const FEATURE_TABLE = {
    [Feature.MOUNTAIN]: {name: 'Mountain', color: '#AAA'},
    [Feature.PLATFORM]: {name: 'Platform', color: '#8b8372'},
    [Feature.HILL]: {name: 'Hill', color: '#585'},
    [Feature.PLAIN]: {name: 'Plain', color: '#574'},
    [Feature.DEPRESSION]: {name: 'Depression', color: '#4f664c'},
    [Feature.RIFT_SEA]: {name: 'Rift sea', color: '#07A'},
    [Feature.ISLAND_ARC]: {name: 'Island arc', color: '#574'},
    [Feature.SEAMOUNT]: {name: 'Seamount', color: '#069'},
    [Feature.OCEANIC_RIDGE]: {name: 'Oceanic ridge', color: '#07A'},
    [Feature.OCEANIC_PLAIN]: {name: 'Oceanic plain', color: '#058'},
    [Feature.TRENCH]: {name: 'Trench', color: '#147'},
}


const BOUNDARY_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {code: 'LLCC', border: true, provinces: [
        {feature: Feature.MOUNTAIN, border: true, range: [0, .5]},
        {feature: Feature.MOUNTAIN, border: true, range: [0, .4]},
    ]},

    {code: 'LLCT', provinces: [
        {feature: Feature.PLATFORM, range: [.1, .3]},
        {feature: Feature.HILL, range: [.1, .1]},
    ]},

    {code: 'LLCD', provinces: [
        {feature: Feature.HILL, range: [.1, .3]},
        {feature: Feature.DEPRESSION, range: [0, .2]},
    ]},

    {code: 'LLDT', provinces: [
        {feature: Feature.RIFT_SEA, range: [0, .5]},
        {feature: Feature.HILL, range: [.2, .4]},
    ]},

    {code: 'LLDD', provinces: [
        {feature: Feature.RIFT_SEA, range: [0, .5]},
        {feature: Feature.RIFT_SEA, range: [0, .6]},
    ]},

    {code: 'LLTT', provinces: [
        {feature: Feature.HILL, range: [.1, .3]},
        {feature: Feature.HILL, range: [.1, .2]},
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {code: 'LWCC', provinces: [
        {feature: Feature.TRENCH, range: [.1, .2]},
        {feature: Feature.MOUNTAIN, range: [.1, .5]},
    ]},

    {code: 'LWCT', provinces: [
        {feature: Feature.TRENCH, range: [.1, .2]},
        {feature: Feature.HILL, range: [.1, .4]},
    ]},

    {code: 'LWCD', provinces: [
        {feature: Feature.OCEANIC_RIDGE, range: [0, .2]},
        {feature: Feature.RIFT_SEA, range: [0, .5]},
    ]},

    {code: 'LWDD', provinces: [
        {feature: Feature.ISLAND_ARC, range: [.1, .2]},
        {feature: Feature.HILL, range: [.1, .4]},
    ]},

    {code: 'LWDT', provinces: [
        {feature: Feature.OCEANIC_RIDGE, range: [.1, .4]},
        {feature: Feature.HILL, range: [.1, .2]},
    ]},

    {code: 'LWTT', provinces: [
        {feature: Feature.ISLAND_ARC, range: [.2, .3]},
        {feature: Feature.RIFT_SEA, range: [.2, .5]},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {code: 'WWCC', provinces: [
        {feature: Feature.TRENCH, range: [.1, .3]},
        {feature: Feature.ISLAND_ARC, range: [.1, .5]},
    ]},

    {code: 'WWCT', provinces: [
        {feature: Feature.ISLAND_ARC, range: [0, .1]},
        {feature: Feature.SEAMOUNT, range: [.1, .3]},
    ]},

    {code: 'WWCD', provinces: [
        {feature: Feature.ISLAND_ARC, range: [.1, .5]},
        {feature: Feature.OCEANIC_PLAIN, range: [.1, .3]},
    ]},

    {code: 'WWDD', provinces: [
        {feature: Feature.OCEANIC_RIDGE, range: [0, .3]},
    ]},

    {code: 'WWDT', provinces: [
        {feature: Feature.TRENCH, range: [0, .2]},
        {feature: Feature.SEAMOUNT, range: [0, .2]},
    ]},

    {code: 'WWTT', provinces: [
        {feature: Feature.SEAMOUNT, range: [.1, .4]},
    ]},
]
