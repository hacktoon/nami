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
    {priority: 0, chance: .5, growth: 4, steps: [
        {level: 0, name: 'PEAK'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 6, name: 'PLAIN'},
    ]},
]},

{key: 'LLCT', name: 'Old mountains', data: [
    {chance: .2, growth: 10, steps: [
        {level: 0, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 4, name: 'PLAIN'},
    ]},
    {steps: [{level: 0, name: 'PLAIN'}]},
]},

{key: 'LLCD', name: 'Inner sea', data: [
    {chance: .5, growth: 5, steps: [{level: 1, name: 'DEEP_SEA'}]},
    {chance: .5, growth: 5, steps: [{level: 1, name: 'SHALLOW_SEA'}]}
]},

{key: 'LLDD', name: 'Rift sea', rule: 'weight', data: [
    {chance: .5, growth: 5, steps: [
        {level: 0, name: 'SHALLOW_SEA'}
    ]}
]},

{key: 'LLDT', name: 'Rift valley', data: [
    {chance: .5, growth: 8, steps: [
        {level: 0, name: 'DEPRESSION'},
        {level: 2, name: 'PLAIN'},
    ]},
    {steps: [
        {level: 0, name: 'PLAIN'}
    ]},
]},

{key: 'LLTT', name: 'Transform Fault', data: [
    {chance: .1, growth: 10, steps: [
        {level: 0, name: 'DEPRESSION'},
        {level: 2, name: 'PLAIN'},
    ]},
    {steps: [
        {level: 0, name: 'PLAIN'}
    ]},
]},


// CONTINENTAL-OCEANIC ==============================================
{key: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {chance: .5, growth: 1, steps: [
        {level: 1, name: 'TRENCH'}
    ]},
    {chance: .5, growth: 2, steps: [
        {level: 0, name: 'MOUNTAIN'},
        {level: 3, name: 'PLATEAU'},
        {level: 4, name: 'PLAIN'},
    ]},
]},

{key: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {chance: .5, growth: 8, steps: [
        {level: 0, name: 'TRENCH'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {chance: .5, growth: 2, steps: [
        {level: 0, name: 'PLAIN'},
        {level: 1, name: 'MOUNTAIN'},
        {level: 2, name: 'PLAIN'},
    ]},
]},

{key: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {chance: .5, growth: 5, steps: [{level: 1, name: 'DEEP_SEA'}]},
    {chance: .5, growth: 3, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {chance: .5, growth: 10, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {chance: .5, growth: 5, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
    {chance: .5, growth: 6, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]},
]},

{key: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
    {chance: .5, growth: 8, steps: [{level: 1, name: 'DEEP_SEA'}]},
    {chance: .5, growth: 8, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]},
]},


// OCEANIC-OCEANIC ==============================================
{key: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {chance: .1, growth: 5, steps: [
        {level: 1, name: 'TRENCH'}
    ]},
    {chance: .5, growth: 4, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},
{key: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {chance: .4, growth: 2, steps: [
        {level: 1, name: 'TRENCH'}
    ]},
    {chance: .5, growth: 5, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'ISLAND_ARC'},
        {level: 2, name: 'SHALLOW_SEA'},
        {level: 3, name: 'DEEP_SEA'},
    ]},
]},
{key: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {chance: .1, growth: 10, steps: [
        {level: 1, name: 'TRENCH'}
    ]},
]},
{key: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {chance: .5, growth: 10, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]}
]},
{key: 'WWDT', name: 'Early rift', data: [
    {chance: .5, growth: 2, steps: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 3, name: 'PLAIN'},
    ]},
]},
{key: 'WWTT', name: 'Oceanic fault', data: [
    {chance: .5, growth: 8, steps: [{level: 1, name: 'DEEP_SEA'}]},
    {steps: [{level: 1, name: 'DEEP_SEA'}]}
]},
]
