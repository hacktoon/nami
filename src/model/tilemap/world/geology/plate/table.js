
export const BOUNDARY_TABLE = [
    // ==============================================
    // CONTINENTAL-CONTINENTAL
    // ==============================================
    {key: 'LLCC', name: 'Continental collision',
    data: [
        {chance: .5, growth: 2, landscape: [
            {level: 0, name: 'PEAK'},
            {level: 2, name: 'MOUNTAIN'},
            {level: 3, name: 'HILL'},
            {level: 5, name: 'PLAIN'},
        ]},
        {chance: .5, growth: 2, landscape: [
            {level: 0, name: 'MOUNTAIN'},
            {level: 2, name: 'HILL'},
            {level: 5, name: 'PLAIN'},
        ]},
    ]},
    // ==============================================
    {key: 'LLCT', name: 'Old mountains',
    data: [
        {landscape: [
            {level: 0, name: 'MOUNTAIN'},
            {level: 1, name: 'HILL'},
            {level: 2, name: 'PLAIN'},
        ]},
        {landscape: [
            {level: 0, name: 'HILL'},
            {level: 3, name: 'PLAIN'},
        ]},
    ]},
    // ==============================================
    {key: 'LLCD', name: 'Rift valley',
    data: [
        {landscape: [
            {level: 0, name: 'DEPRESSION'},
            {level: 1, name: 'PLAIN'},
            {level: 5, name: 'HILL'},
            {level: 7, name: 'PLAIN'},
        ]},
        {landscape: [
            {level: 0, name: 'PLAIN'},
            {level: 4, name: 'HILL'},
            {level: 7, name: 'PLAIN'},
        ]},
    ]},
    // ==============================================
    {key: 'LLDT', name: 'Early rift sea',
    data: [
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
    // ==============================================
    {key: 'LLDD', name: 'Rift sea',
    data: [
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
    // ==============================================
    {key: 'LLTT', name: 'Transform Fault',
    data: [
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
    data: [
        {chance: .5, growth: 3, landscape: [
            {level: 0, name: 'TRENCH'},
            {level: 2, name: 'DEEP_SEA'},
        ]},
        {landscape: [
            {level: 0, name: 'PLAIN'},
            {level: 1, name: 'PEAK'},
            {level: 3, name: 'MOUNTAIN'},
            {level: 5, name: 'HILL'},
        ]},
    ]},
    // ==============================================
    {key: 'LWCT', name: 'Early cordillera',
    data: [
        {chance: .2, growth: 1, landscape: [
            {level: 0, name: 'TRENCH'},
            {level: 1, name: 'DEEP_SEA'},
        ]},
        {landscape: [
            {level: 0, name: 'MOUNTAIN'},
            {level: 1, name: 'HILL'},
            {level: 2, name: 'PLAIN'},
        ]},
    ]},
    // ==============================================
    {key: 'LWCD', name: 'Early passive margin',
    data: [
        {landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'DEEP_SEA'},
        ]},
        {landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'PLAIN'},
            {level: 2, name: 'HILL'},
        ]},
    ]},
    // ==============================================
    {key: 'LWDD', name: 'Passive margin',
    data: [
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
    // ==============================================
    {key: 'LWDT', name: 'Island arc basin',
    data: [
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
    // ==============================================
    {key: 'LWTT', name: 'Coastal fault',
    data: [
        {landscape: [
            {level: 0, name: 'TRENCH'},
            {level: 1, name: 'DEEP_SEA'}
        ]},
        {landscape: [
            {level: 0, name: 'DEEP_SEA'},
            {level: 1, name: 'HILL'},
        ]},
    ]},


    // ==============================================
    // OCEANIC-OCEANIC
    // ==============================================
    {key: 'WWCC', name: 'Island arc',
    data: [
        {chance: .5, growth: 1, landscape: [
            {level: 0, name: 'TRENCH'},
            {level: 1, name: 'DEEP_SEA'}
        ]},
        {chance: .5, growth: 2, landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'ISLAND'},
            {level: 2, name: 'DEEP_SEA'},
        ]},
    ]},
    // ==============================================
    {key: 'WWCT', name: 'Early island arc',
    data: [
        {landscape: [{level: 0, name: 'DEEP_SEA'}]},
        {chance: .3, growth: 1, landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'ISLAND'},
            {level: 2, name: 'DEEP_SEA'},
        ]},
    ]},
    // ==============================================
    {key: 'WWCD', name: 'Abyssal plains',
    data: [
        {landscape: [{level: 0, name: 'DEEP_SEA'}]},
    ]},
    // ==============================================
    {key: 'WWDD', name: 'Oceanic rift',
    data: [
        {landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'DEEP_SEA'},
        ]},
        {landscape: [{level: 0, name: 'SHALLOW_SEA'}]}
    ]},
    // ==============================================
    {key: 'WWDT', name: 'Early oceanic rift',
    data: [
        {landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'DEEP_SEA'},
        ]},
        {landscape: [{level: 0, name: 'SHALLOW_SEA'}]}
    ]},
    // ==============================================
    {key: 'WWTT', name: 'Oceanic fault',
    data: [
        {landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'DEEP_SEA'},
        ]},
        {landscape: [{level: 1, name: 'DEEP_SEA'}]}
    ]},
]
