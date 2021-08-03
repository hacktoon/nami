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
    PEAK: {water: false, height: 50, color: '#AAA'},
    MOUNTAIN: {water: false, height: 40, color: '#8b8372'},
    PLATEAU: {water: false, height: 30, color: '#996'},
    HILL: {water: false, height: 30, color: '#685'},
    PLAIN: {water: false, height: 20, color: '#574'},
    ISLAND: {water: false, height: 10, color: '#685'},
    DEPRESSION: {water: false, height: 10, color: '#352'},
    SHALLOW_SEA: {water: true, height: 0, color: '#069'},
    DEEP_SEA: {water: true, height: -20, color: '#058'},
    TRENCH: {water: true, height: -30, border: '#058', color: '#147'},
}


export const DEFORM_TABLE = [

// ==============================================
// CONTINENTAL-CONTINENTAL
// ==============================================
{key: 'LLCC', name: 'Continental collision', rule: 'weight',
boundaries: [
    {chance: .5, growth: 2, landscape: [
        {level: 0, name: 'PEAK'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 3, name: 'HILL'},
        {level: 5, name: 'PLAIN'},
    ]},
    {chance: .5, growth: 2, landscape: [
        {level: 0, name: 'MOUNTAIN'},
        {level: 1, name: 'HILL'},
        {level: 5, name: 'PLAIN'},
    ]},
]},

{key: 'LLCT', name: 'Old mountains',
boundaries: [
    {landscape: [
        {level: 0, name: 'HILL'},
        {level: 1, name: 'PLAIN'},
        {level: 2, name: 'PLATEAU'},
        {level: 3, name: 'PLAIN'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 2, name: 'HILL'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LLCD', name: 'Rift valley',
boundaries: [
    {landscape: [
        {level: 0, name: 'DEPRESSION'},
        {level: 1, name: 'PLAIN'},
        {level: 5, name: 'HILL'},
        {level: 7, name: 'PLAIN'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 4, name: 'PLATEAU'},
        {level: 7, name: 'PLAIN'},
    ]},
]},

{key: 'LLDT', name: 'Early rift sea',
boundaries: [
    {chance: .1, growth: 1, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'},
    ]},
    {chance: .1, growth: 2, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 2, name: 'PLAIN'},
        {level: 5, name: 'HILL'},
        {level: 7, name: 'PLAIN'},
    ]}
]},

{key: 'LLDD', name: 'Rift sea', rule: 'weight',
boundaries: [
    {landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 1, name: 'SHALLOW_SEA'},
        {level: 5, name: 'PLAIN'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'},
        {level: 5, name: 'HILL'},
        {level: 6, name: 'PLAIN'},
    ]}
]},

{key: 'LLTT', name: 'Transform Fault', rule: 'weight',
boundaries: [
    {landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'HILL'},
        {level: 2, name: 'PLAIN'},
    ]},
    {landscape: [
        {level: 0, name: 'HILL'},
        {level: 1, name: 'PLAIN'},
    ]},
]},


// ==============================================
// CONTINENTAL-OCEANIC
// ==============================================
{key: 'LWCC', name: 'Cordillera', rule: 'weight',
boundaries: [
    {chance: .5, growth: 1, landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 1, name: 'DEEP_SEA'},
        {level: 2, name: 'SHALLOW_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'HILL'},
        {level: 2, name: 'MOUNTAIN'},
        {level: 4, name: 'PEAK'},
        {level: 5, name: 'MOUNTAIN'},
        {level: 6, name: 'HILL'},
        {level: 7, name: 'PLAIN'},
    ]},
]},

{key: 'LWCT', name: 'Early cordillera', rule: 'weight',
boundaries: [
    {chance: .2, growth: 1, landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'HILL'},
        {level: 2, name: 'MOUNTAIN'},
        {level: 3, name: 'HILL'},
        {level: 5, name: 'PLAIN'},
    ]},
]},

{key: 'LWCD', name: 'Early passive margin', rule: 'weight',
boundaries: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'},
        {level: 4, name: 'PLATEAU'},
        {level: 5, name: 'PLAIN'},
    ]},
]},

{key: 'LWDD', name: 'Passive margin', rule: 'weight',
boundaries: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 4, name: 'PLAIN'},
        {level: 6, name: 'HILL'},
        {level: 7, name: 'PLAIN'},
    ]},
]},

{key: 'LWDT', name: 'Island arc basin', rule: 'weight',
boundaries: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 2, name: 'PLAIN'},
        {level: 4, name: 'HILL'},
        {level: 5, name: 'PLAIN'},
    ]},
]},

{key: 'LWTT', name: 'Coastal fault', rule: 'weight',
boundaries: [
    {landscape: [
        {level: 0, name: 'DEEP_SEA'}
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'},
    ]},
]},


// ==============================================
// OCEANIC-OCEANIC
// ==============================================
{key: 'WWCC', name: 'Island arc', rule: 'weight',
boundaries: [
    {chance: .5, growth: 1, landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 2, name: 'DEEP_SEA'}
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},

{key: 'WWCT', name: 'Early island arc', rule: 'weight',
boundaries: [
    {chance: .2, growth: 1, landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 2, name: 'DEEP_SEA'}
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},

{key: 'WWCD', name: 'Abyssal plains', rule: 'weight',
boundaries: [
    {landscape: [{level: 0, name: 'DEEP_SEA'}]},
]},

{key: 'WWDD', name: 'Oceanic rift', rule: 'weight',
boundaries: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 0, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWDT', name: 'Early oceanic rift',
boundaries: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 0, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWTT', name: 'Oceanic fault',
boundaries: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 1, name: 'DEEP_SEA'}]}
]},

]
