
export const DEF_LAND = 0
export const DEF_WATER = 100
export const DEF_CONVERGE = 16
export const DEF_TRANSFORM = 4
export const DEF_DIVERGE = 1
export const IDMAP = {
    L: DEF_LAND,
    W: DEF_WATER,
    C: DEF_CONVERGE,
    D: DEF_DIVERGE,
    T: DEF_TRANSFORM,
}


export const LANDFORM = {
    PEAK: {
        priority: 0, water: false, border: '#CCC', color: '#CCC',
        steps: [
            {level: 0, type: 'PEAK'},
            {level: 1, type: 'MOUNTAIN'},
            {level: 3, type: 'PLATEAU'},
            {level: 4, type: 'PLAIN'},
        ]
    },
    MOUNTAIN: {
        water: false, height: 80, color: '#a79e86',
        steps: [
            {level: 1, type: 'MOUNTAIN'},
            {level: 3, type: 'PLATEAU'},
            {level: 4, type: 'PLAIN'},
        ]
    },
    PLATEAU: {
        water: false, height: 60, color: '#796',
        steps: [
            {level: 1, type: 'PLATEAU'},
            {level: 4, type: 'PLAIN'},
        ]
    },
    PLAIN: {
        water: false, height: 20, color: '#574',
        steps: [{level: 0, type: 'PLAIN'}]
    },
    DEPRESSION: {
        priority: 1, water: false, height: 10, color: '#352',
        steps: [
            {level: 1, type: 'DEPRESSION'},
            {level: 2, type: 'PLAIN'},
        ]
    },
    ISLAND_ARC: {
        water: false, height: 10, border: '#058', color: '#060',
        steps: [{level: 1, type: 'ISLAND_ARC'}]
    },
    SHALLOW_SEA: {
        water: true, height: 0, border: '#079', color: '#079',
        steps: [{level: 1, type: 'SHALLOW_SEA'}]
    },
    RIFT_SEA: {
        water: true, height: -10, border: '#058', color: '#069',
        steps: [{level: 1, type: 'RIFT_SEA'}]
    },
    DEEP_SEA: {
        water: true, height: -20, border: '#058', color: '#058',
        steps: [{level: 1, type: 'DEEP_SEA'}]
    },
    TRENCH: {
        water: true, height: -30, border: '#036', color: '#036',
        steps: [{level: 1, type: 'TRENCH'}]
    },
}


export const DEFORM_TABLE = [
// CONTINENTAL-CONTINENTAL ---------------------------
{key: 'LLCC', name: 'Continental collision', data: [
    {type: LANDFORM.PEAK, range: 3, chance: .5, growth: 4},
]},
{key: 'LLCT', name: 'Old mountains', data: [
    {type: LANDFORM.MOUNTAIN, range: 1, chance: .2, growth: 10},
    {type: LANDFORM.PLAIN, range: 0},
]},
{key: 'LLCD', name: 'Inner sea', data: [
    {type: LANDFORM.DEEP_SEA, range: 7, chance: .5, growth: 5},
    {type: LANDFORM.SHALLOW_SEA, range: 7, chance: .5, growth: 5}
]},
{key: 'LLDD', name: 'Rift sea', rule: 'weight', data: [
    {type: LANDFORM.DEEP_SEA, range: 6, chance: .5, growth: 5},
    {type: LANDFORM.SHALLOW_SEA, range: 7, chance: .5, growth: 5}
]},
{key: 'LLDT', name: 'Rift valley', data: [
    {type: LANDFORM.DEPRESSION, range: 1, chance: .5, growth: 8},
    {type: LANDFORM.PLAIN, range: 0},
]},
{key: 'LLTT', name: 'Transform Fault', data: [
    {type: LANDFORM.DEPRESSION, range: 1, chance: .1, growth: 10},
    {type: LANDFORM.PLAIN, range: 0}
]},


// CONTINENTAL-OCEANIC ---------------------------
{key: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {type: LANDFORM.TRENCH, range: 4, chance: .5, growth: 1},
    {type: LANDFORM.MOUNTAIN, range: [1, 5], chance: .5, growth: 2},
]},
{key: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {type: LANDFORM.TRENCH, range: 3, chance: .5, growth: 2},
    {type: LANDFORM.PLATEAU, range: [1, 4], chance: .5, growth: 2},
]},
{key: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {type: LANDFORM.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: LANDFORM.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
]},
{key: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {type: LANDFORM.RIFT_SEA, range: 2, chance: .5, growth: 10},
    {type: LANDFORM.SHALLOW_SEA, range: 3, chance: .5, growth: 8}
]},
{key: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {type: LANDFORM.ISLAND_ARC, range: 1, chance: .5, growth: 5},
    {type: LANDFORM.SHALLOW_SEA, range: 3, chance: .5, growth: 6},
]},
{key: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
    {type: LANDFORM.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: LANDFORM.SHALLOW_SEA, range: 1, chance: .5, growth: 8},
]},


// OCEANIC-OCEANIC ---------------------------
{key: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {type: LANDFORM.TRENCH, range: 1, chance: .1, growth: 5},
    {type: LANDFORM.ISLAND_ARC, range: 2, chance: .5, growth: 4},
]},
{key: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {type: LANDFORM.TRENCH, range: 2, chance: .4, growth: 2},
    {type: LANDFORM.ISLAND_ARC, range: 1, chance: .5, growth: 5},
]},
{key: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {type: LANDFORM.TRENCH, range: 10, chance: .1, growth: 10},
]},
{key: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {type: LANDFORM.RIFT_SEA, range: 2, chance: .5, growth: 10}
]},
{key: 'WWDT', name: 'Early rift', data: [
    {type: LANDFORM.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
    {type: LANDFORM.DEEP_SEA, range: 0}
]},
{key: 'WWTT', name: 'Oceanic fault', data: [
    {type: LANDFORM.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: LANDFORM.DEEP_SEA, range: 0}
]},
]
