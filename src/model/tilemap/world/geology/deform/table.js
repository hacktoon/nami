import { LANDFORMS } from './landform'

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


export const DEFORM_TABLE = [
// CONTINENTAL-CONTINENTAL ==============================================
{key: 'LLCC', name: 'Continental collision', data: [
    {priority: 0, chance: .5, growth: 4, landscape: [
        {level: 0, name: 'PEAK'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 6, name: 'PLAIN'},
    ]},
]},

{key: 'LLCT', name: 'Old mountains', data: [
    {chance: .2, growth: 10, landscape: [
        {level: 0, name: 'PLATEAU'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 4, name: 'PLAIN'},
    ]},
    {landscape: [{level: 0, name: 'PLAIN'}]},
]},

{key: 'LLCD', name: 'Rift sea', data: [
    {chance: .5, growth: 5, landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 1, name: 'SHALLOW_SEA'},
        {level: 2, name: 'PLAIN'}
    ]}
]},

{key: 'LLDD', name: 'Early rift sea', rule: 'weight', data: [
    {chance: .5, growth: 5, landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 1, name: 'SHALLOW_SEA'},
    ]},
    {chance: .5, growth: 5, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'}
    ]}
]},

{key: 'LLDT', name: 'Rift valley', data: [
    {chance: .5, growth: 8, landscape: [
        {level: 0, name: 'DEPRESSION'},
        {level: 1, name: 'PLAIN'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'}
    ]},
]},

{key: 'LLTT', name: 'Transform Fault', data: [
    {chance: .1, growth: 10, landscape: [
        {level: 0, name: 'PLATEAU'},
        {level: 1, name: 'PLAIN'},
    ]},
    {landscape: [
        {level: 0, name: 'PLAIN'}
    ]},
]},


// CONTINENTAL-OCEANIC ==============================================
{key: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {chance: .5, growth: 1, landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 1, name: 'DEEP_SEA'},
        {level: 2, name: 'SHALLOW_SEA'},
    ]},
    {chance: .8, growth: 3, landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'PLATEAU'},
        {level: 2, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 4, name: 'PLAIN'},
    ]},
]},

{key: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {chance: .5, growth: 8, landscape: [
        {level: 0, name: 'TRENCH'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {chance: .2, growth: 4, landscape: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 2, name: 'PLATEAU'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {chance: .5, growth: 5, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {chance: .5, growth: 3, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'},
    ]},
]},

{key: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {chance: .5, growth: 10, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
    {chance: .5, growth: 8, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {chance: .9, growth: 10, landscape: [
        {level: 0, name: 'ISLAND_ARC'},
        {level: 1, name: 'SHALLOW_SEA'},
        {level: 2, name: 'DEEP_SEA'},
    ]},
    {chance: .5, growth: 2, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 2, name: 'PLAIN'},
        {level: 4, name: 'PLATEAU'},
        {level: 5, name: 'PLAIN'},
    ]},
]},

{key: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
    {chance: .5, growth: 8, landscape: [
        {level: 0, name: 'DEEP_SEA'}
    ]},
    {chance: .5, growth: 8, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'PLAIN'},
    ]},
]},


// OCEANIC-OCEANIC ==============================================
{key: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {chance: .1, growth: 2, landscape: [
        {level: 0, name: 'TRENCH'}
    ]},
    {chance: .5, growth: 4, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},
{key: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {chance: .1, growth: 3, landscape: [
        {level: 0, name: 'TRENCH'}
    ]},
    {chance: .5, growth: 5, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},

{key: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {chance: .1, growth: 10, landscape: [{level: 0, name: 'DEEP_SEA'}]},
]},

{key: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {chance: .5, growth: 5, landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 3, name: 'SHALLOW_SEA'},
    ]},
    {chance: .1, growth: 5, landscape: [{level: 1, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWDT', name: 'Early oceanic rift', data: [
    {chance: .2, growth: 10, landscape: [
        {level: 0, name: 'DEEP_SEA'},
        {level: 3, name: 'SHALLOW_SEA'},
    ]},
    {chance: .1, growth: 5, landscape: [{level: 1, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWTT', name: 'Oceanic fault', data: [
    {chance: .5, growth: 8, landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 1, name: 'DEEP_SEA'}]}
]},

]
