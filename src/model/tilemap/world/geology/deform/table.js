
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


export const LANDFORMS = {
    PEAK: {
        priority: 0, water: false, border: '#CCC', color: '#CCC',
        steps: [
            {level: 0, name: 'PEAK'},
            {level: 1, name: 'MOUNTAIN'},
            {level: 3, name: 'PLATEAU'},
            {level: 4, name: 'PLAIN'},
        ]
    },
    MOUNTAIN: {
        water: false, height: 80, color: '#a79e86',
        steps: [
            {level: 1, name: 'MOUNTAIN'},
            {level: 3, name: 'PLATEAU'},
            {level: 4, name: 'PLAIN'},
        ]
    },
    PLATEAU: {
        water: false, height: 60, color: '#796',
        steps: [
            {level: 1, name: 'PLATEAU'},
            {level: 4, name: 'PLAIN'},
        ]
    },
    PLAIN: {
        water: false, height: 20, color: '#574',
        steps: [{level: 0, name: 'PLAIN'}]
    },
    DEPRESSION: {
        priority: 1, water: false, height: 10, color: '#352',
        steps: [
            {level: 1, name: 'DEPRESSION'},
            {level: 2, name: 'PLAIN'},
        ]
    },
    ISLAND_ARC: {
        water: false, height: 10, border: '#058', color: '#060',
        steps: [{level: 1, name: 'ISLAND_ARC'}]
    },
    SHALLOW_SEA: {
        water: true, height: 0, border: '#079', color: '#079',
        steps: [{level: 1, name: 'SHALLOW_SEA'}]
    },
    RIFT_SEA: {
        water: true, height: -10, border: '#058', color: '#069',
        steps: [{level: 1, name: 'RIFT_SEA'}]
    },
    DEEP_SEA: {
        water: true, height: -20, border: '#058', color: '#058',
        steps: [{level: 1, name: 'DEEP_SEA'}]
    },
    TRENCH: {
        water: true, height: -30, border: '#036', color: '#036',
        steps: [{level: 1, name: 'TRENCH'}]
    },
}


export const DEFORM_TABLE = [
// CONTINENTAL-CONTINENTAL ---------------------------
{key: 'LLCC', name: 'Continental collision', data: [
    {type: LANDFORMS.PEAK, range: 3, chance: .5, growth: 4},
]},
{key: 'LLCT', name: 'Old mountains', data: [
    {type: LANDFORMS.MOUNTAIN, range: 1, chance: .2, growth: 10},
    {type: LANDFORMS.PLAIN, range: 0},
]},
{key: 'LLCD', name: 'Inner sea', data: [
    {type: LANDFORMS.DEEP_SEA, range: 7, chance: .5, growth: 5},
    {type: LANDFORMS.SHALLOW_SEA, range: 7, chance: .5, growth: 5}
]},
{key: 'LLDD', name: 'Rift sea', rule: 'weight', data: [
    {type: LANDFORMS.DEEP_SEA, range: 6, chance: .5, growth: 5},
    {type: LANDFORMS.SHALLOW_SEA, range: 7, chance: .5, growth: 5}
]},
{key: 'LLDT', name: 'Rift valley', data: [
    {type: LANDFORMS.DEPRESSION, range: 1, chance: .5, growth: 8},
    {type: LANDFORMS.PLAIN, range: 0},
]},
{key: 'LLTT', name: 'Transform Fault', data: [
    {type: LANDFORMS.DEPRESSION, range: 1, chance: .1, growth: 10},
    {type: LANDFORMS.PLAIN, range: 0}
]},


// CONTINENTAL-OCEANIC ---------------------------
{key: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {type: LANDFORMS.TRENCH, range: 4, chance: .5, growth: 1},
    {type: LANDFORMS.MOUNTAIN, range: [1, 5], chance: .5, growth: 2},
]},
{key: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {type: LANDFORMS.TRENCH, range: 3, chance: .5, growth: 2},
    {type: LANDFORMS.PLATEAU, range: [1, 4], chance: .5, growth: 2},
]},
{key: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {type: LANDFORMS.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: LANDFORMS.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
]},
{key: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {type: LANDFORMS.RIFT_SEA, range: 2, chance: .5, growth: 10},
    {type: LANDFORMS.SHALLOW_SEA, range: 3, chance: .5, growth: 8}
]},
{key: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {type: LANDFORMS.ISLAND_ARC, range: 1, chance: .5, growth: 5},
    {type: LANDFORMS.SHALLOW_SEA, range: 3, chance: .5, growth: 6},
]},
{key: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
    {type: LANDFORMS.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: LANDFORMS.SHALLOW_SEA, range: 1, chance: .5, growth: 8},
]},


// OCEANIC-OCEANIC ---------------------------
{key: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {type: LANDFORMS.TRENCH, range: 1, chance: .1, growth: 5},
    {type: LANDFORMS.ISLAND_ARC, range: 2, chance: .5, growth: 4},
]},
{key: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {type: LANDFORMS.TRENCH, range: 2, chance: .4, growth: 2},
    {type: LANDFORMS.ISLAND_ARC, range: 1, chance: .5, growth: 5},
]},
{key: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {type: LANDFORMS.TRENCH, range: 10, chance: .1, growth: 10},
]},
{key: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {type: LANDFORMS.RIFT_SEA, range: 2, chance: .5, growth: 10}
]},
{key: 'WWDT', name: 'Early rift', data: [
    {type: LANDFORMS.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
    {type: LANDFORMS.DEEP_SEA, range: 0}
]},
{key: 'WWTT', name: 'Oceanic fault', data: [
    {type: LANDFORMS.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: LANDFORMS.DEEP_SEA, range: 0}
]},
]
