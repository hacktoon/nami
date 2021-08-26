
export const BOUNDARY_TABLE = [
// ==============================================
// CONTINENTAL-CONTINENTAL
// ==============================================
{key: 'LLCC', name: 'Continental collision',
borders: [
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
borders: [
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
borders: [
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
borders: [
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

{key: 'LLDD', name: 'Rift sea',
borders: [
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

{key: 'LLTT', name: 'Transform Fault',
borders: [
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
{key: 'LWCC', name: 'Cordillera',
borders: [
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

{key: 'LWCT', name: 'Early cordillera',
borders: [
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

{key: 'LWCD', name: 'Early passive margin',
borders: [
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

{key: 'LWDD', name: 'Passive margin',
borders: [
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

{key: 'LWDT', name: 'Island arc basin',
borders: [
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

{key: 'LWTT', name: 'Coastal fault',
borders: [
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
{key: 'WWCC', name: 'Island arc',
borders: [
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

{key: 'WWCT', name: 'Early island arc',
borders: [
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

{key: 'WWCD', name: 'Abyssal plains',
borders: [
    {landscape: [{level: 0, name: 'DEEP_SEA'}]},
]},

{key: 'WWDD', name: 'Oceanic rift',
borders: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 0, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWDT', name: 'Early oceanic rift',
borders: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 0, name: 'SHALLOW_SEA'}]}
]},

{key: 'WWTT', name: 'Oceanic fault',
borders: [
    {landscape: [
        {level: 0, name: 'SHALLOW_SEA'},
        {level: 1, name: 'DEEP_SEA'},
    ]},
    {landscape: [{level: 1, name: 'DEEP_SEA'}]}
]},

]
