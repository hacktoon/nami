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
    PEAK: {water: false, color: '#AAA'},
    MOUNTAIN: {water: false, height: 80, border: '#796', color: '#918671'},
    PLATEAU: {water: false, height: 60, color: '#796'},
    PLAIN: {water: false, height: 20, color: '#574'},
    ISLAND_ARC: {water: false, height: 10, color: '#685'},
    DEPRESSION: {water: false, height: 10, color: '#352'},
    SHALLOW_SEA: {water: true, height: 0, color: '#069'},
    DEEP_SEA: {water: true, height: -20, color: '#058'},
    TRENCH: {water: true, height: -30, border: '#058', color: '#036'},
}


export const DEFORM_TABLE = [

// ==============================================
// CONTINENTAL-CONTINENTAL
// ==============================================
{key: 'LLCC', name: 'Continental collision', data: [
    {landscape: [
        {level: 0, name: 'PEAK'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 6, name: 'PLAIN'},
    ]},
]},

{key: 'LLCT', name: 'Old mountains', data: [
    {landscape: [
        {level: 0, name: 'PLATEAU'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 4, name: 'PLAIN'},
    ]},
    {landscape: [{level: 0, name: 'PLAIN'}]},
]},

{key: 'LLCD', name: 'Rift sea', data: [
    {landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 1, name: 'SHALLOW_SEA'},
        {level: 2, name: 'PLAIN'}
    ]}
]},

{key: 'LLDD', name: 'Early rift sea', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 1, name: 'SHALLOW_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'}
    ]}
]},

{key: 'LLDT', name: 'Rift valley', data: [
    {landscape: [{level: 0, name: 'PLAIN'}]},
    {landscape: [
        {level: 0, name: 'DEPRESSION'},
        {level: 1, name: 'PLAIN'},
    ]},
]},

{key: 'LLTT', name: 'Transform Fault', data: [
    {landscape: [
        {level: 0, name: 'PLATEAU'},
        {level: 1, name: 'PLAIN'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'}
    ]},
]},


// ==============================================
// CONTINENTAL-OCEANIC
// ==============================================
{key: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 1, name: 'DEEP_SEA'},
        {level: 2, name: 'SHALLOW_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'PLATEAU'},
        {level: 2, name: 'MOUNTAIN'},
        {level: 4, name: 'PLATEAU'},
        {level: 5, name: 'PLAIN'},
        {level: 7, name: 'PLATEAU'},
        {level: 8, name: 'PLAIN'},
    ]},
]},

{key: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 2, name: 'PLATEAU'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'},
    ]},
]},

{key: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 2, name: 'PLAIN'},
        {level: 4, name: 'PLATEAU'},
        {level: 5, name: 'PLAIN'},
    ]},
]},

{key: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
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
{key: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'TRENCH'}
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},

{key: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'TRENCH'}
    ]},
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},

{key: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {landscape: [{level: 0, name: 'DEEP_SEA'}]},
]},

{key: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 3, name: 'SHALLOW_SEA'},
    ]},
    {landscape: [{level: 1, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWDT', name: 'Early oceanic rift', data: [
    {landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 3, name: 'SHALLOW_SEA'},
    ]},
    {landscape: [{level: 1, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWTT', name: 'Oceanic fault', data: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 1, name: 'DEEP_SEA'}]}
]},

]
