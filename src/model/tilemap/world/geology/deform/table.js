
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
    'PEAK': {
        height: 100, border: '#CCC', color: '#CCC',
    },

    'MOUNTAIN': {
        height: 80, color: '#a79e86',
    },

    'PLATEAU': {
        height: 60, color: '#796',
    },

    'DEPRESSION': {
        height: 10, color: '#352',
    },

    'PLAIN': {
        height: 20, color: '#574',
    },

    'ISLAND_ARC': {
        height: 20, border: '#058', color: '#060',
    },

    'SHALLOW_SEA': {
        height: 0, border: '#058', color: '#069',
    },

    'DEEP_SEA': {
        height: -10, border: '#058', color: '#058',
    },

    'RIFT_SEA': {
        height: -20, border: '#058', color: '#069',
    },

    'TRENCH': {
        height: -30, border: '#036', color: '#036',
    },
}



export const DEFORM_TABLE = [
// CONTINENTAL-CONTINENTAL ---------------------------
{id: 'LLCC', name: 'Continental collision', data: [
    {type: GEO_TYPES.PEAK, range: 3, chance: .5, growth: 4}
]},

{id: 'LLCT', name: 'Old mountains', data: [
    {type: GEO_TYPES.MOUNTAIN, range: 1, chance: .2, growth: 10},
    {type: GEO_TYPES.PLAIN, range: 0},
]},

{id: 'LLCD', name: 'Inner sea', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 7, chance: .5, growth: 5},
    {type: GEO_TYPES.SHALLOW_SEA, range: 7, chance: .5, growth: 5}
]},

{id: 'LLDD', name: 'Rift sea', rule: 'weight', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 6, chance: .5, growth: 5}
]},

{id: 'LLDT', name: 'Rift valley', data: [
    {type: GEO_TYPES.DEPRESSION, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.PLAIN, range: 0},
]},

{id: 'LLTT', name: 'Transform Fault', data: [
    {type: GEO_TYPES.DEPRESSION, range: 1, chance: .1, growth: 10},
    {type: GEO_TYPES.PLAIN, range: 0}
]},


// CONTINENTAL-OCEANIC ---------------------------
{id: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {type: GEO_TYPES.TRENCH, range: 4, chance: .5, growth: 1},
    {type: GEO_TYPES.MOUNTAIN, range: [1, 5], chance: .5, growth: 2},
]},
{id: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {type: GEO_TYPES.TRENCH, range: 3, chance: .5, growth: 2},
    {type: GEO_TYPES.PLATEAU, range: [1, 4], chance: .5, growth: 2},
]},
{id: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
]},
{id: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {type: GEO_TYPES.RIFT_SEA, range: 2, chance: .5, growth: 10},
    {type: GEO_TYPES.SHALLOW_SEA, range: 3, chance: .5, growth: 8}
]},
{id: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {type: GEO_TYPES.ISLAND_ARC, range: 1, chance: .5, growth: 5},
    {type: GEO_TYPES.SHALLOW_SEA, range: 3, chance: .5, growth: 6},
]},
{id: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.SHALLOW_SEA, range: 1, chance: .5, growth: 8},
]},


// OCEANIC-OCEANIC ---------------------------
{id: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {type: GEO_TYPES.TRENCH, range: 1, chance: .1, growth: 5},
    {type: GEO_TYPES.ISLAND_ARC, range: 2, chance: .5, growth: 4},
]},
{id: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {type: GEO_TYPES.TRENCH, range: 2, chance: .4, growth: 2},
    {type: GEO_TYPES.ISLAND_ARC, range: 1, chance: .5, growth: 5},
]},
{id: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {type: GEO_TYPES.TRENCH, range: 10, chance: .1, growth: 10},
]},
{id: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {type: GEO_TYPES.RIFT_SEA, range: 2, chance: .5, growth: 10}
]},
{id: 'WWDT', name: 'Early rift', data: [
    {type: GEO_TYPES.SHALLOW_SEA, range: 1, chance: .5, growth: 2},
    {type: GEO_TYPES.DEEP_SEA, range: 0}
]},
{id: 'WWTT', name: 'Oceanic fault', data: [
    {type: GEO_TYPES.DEEP_SEA, range: 1, chance: .5, growth: 8},
    {type: GEO_TYPES.DEEP_SEA, range: 0}
]},
]
