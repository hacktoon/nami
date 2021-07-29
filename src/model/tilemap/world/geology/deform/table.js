
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

// DEFINE GEOLOGY TYPES
export const GEO_TYPES = {
    PEAK: {
        border: '#CCC', color: '#CCC', steps: [
            {max: .2, height: 100, color: '#CCC'},
            {max: .6, height: 100, color: '#a79e86'},
        ]
    },
    MOUNTAIN: {
        height: 80, color: '#a79e86',
    },
    PLATEAU: {
        height: 60, color: '#796',
    },
    DEPRESSION: {
        height: 10, color: '#352',
    },
    PLAIN: {
        height: 20, color: '#574',
    },
    ISLAND_ARC: {
        height: 20, border: '#058', color: '#060',
    },
    SHALLOW_SEA: {
        height: 0, border: '#058', color: '#069',
    },
    DEEP_SEA: {
        height: -10, border: '#058', color: '#058',
    },
    RIFT_SEA: {
        height: -20, border: '#058', color: '#069',
    },
    ABYSSAL_SEA: {
        height: -30, border: '#036', color: '#036',
    },
}



export const DEFORM_TABLE = [
// CONTINENTAL-CONTINENTAL ---------------------------
{key: 'LLCC', name: 'Continental collision', data: [
    {type: GEO_TYPES.PEAK, priority: 0, range: 3, chance: .5, growth: 4}
]},

{key: 'LLCT', name: 'Old mountains', data: [
    {type: GEO_TYPES.MOUNTAIN, range: 1, chance: .2, growth: 10},
    {type: GEO_TYPES.PLAIN, range: 0},
]},

{key: 'LLCD', name: 'Inner sea', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 7, chance: .5, growth: 5},
    {type: GEO_TYPES.SHALLOW_SEA, range: 7, chance: .5, growth: 5}
]},

{key: 'LLDD', name: 'Rift sea', rule: 'weight', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 6, chance: .5, growth: 5},
    {type: GEO_TYPES.SHALLOW_SEA, range: 7, chance: .5, growth: 5}
]},

{key: 'LLDT', name: 'Rift valley', data: [
    {type: GEO_TYPES.DEPRESSION, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.PLAIN, range: 0},
]},

{key: 'LLTT', name: 'Transform Fault', data: [
    {type: GEO_TYPES.DEPRESSION, range: 1, chance: .1, growth: 10},
    {type: GEO_TYPES.PLAIN, range: 0}
]},


// CONTINENTAL-OCEANIC ---------------------------
{key: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {type: GEO_TYPES.ABYSSAL_SEA, range: 4, chance: .5, growth: 1},
    {type: GEO_TYPES.MOUNTAIN, range: [1, 5], chance: .5, growth: 2},
]},
{key: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {type: GEO_TYPES.ABYSSAL_SEA, range: 3, chance: .5, growth: 2},
    {type: GEO_TYPES.PLATEAU, range: [1, 4], chance: .5, growth: 2},
]},
{key: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
]},
{key: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {type: GEO_TYPES.RIFT_SEA, range: 2, chance: .5, growth: 10},
    {type: GEO_TYPES.SHALLOW_SEA, range: 3, chance: .5, growth: 8}
]},
{key: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {type: GEO_TYPES.ISLAND_ARC, range: 1, chance: .5, growth: 5},
    {type: GEO_TYPES.SHALLOW_SEA, range: 3, chance: .5, growth: 6},
]},
{key: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.SHALLOW_SEA, range: 1, chance: .5, growth: 8},
]},


// OCEANIC-OCEANIC ---------------------------
{key: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {type: GEO_TYPES.ABYSSAL_SEA, range: 1, chance: .1, growth: 5},
    {type: GEO_TYPES.ISLAND_ARC, range: 2, chance: .5, growth: 4},
]},
{key: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {type: GEO_TYPES.ABYSSAL_SEA, range: 2, chance: .4, growth: 2},
    {type: GEO_TYPES.ISLAND_ARC, range: 1, chance: .5, growth: 5},
]},
{key: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {type: GEO_TYPES.ABYSSAL_SEA, range: 10, chance: .1, growth: 10},
]},
{key: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {type: GEO_TYPES.RIFT_SEA, range: 2, chance: .5, growth: 10}
]},
{key: 'WWDT', name: 'Early rift', data: [
    {type: GEO_TYPES.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
    {type: GEO_TYPES.DEEP_SEA, range: 0}
]},
{key: 'WWTT', name: 'Oceanic fault', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.DEEP_SEA, range: 0}
]},
]
