
export const BOUNDARY_TABLE = [
    // ==============================================
    // CONTINENTAL-CONTINENTAL
    // ==============================================
    {key: 'LLCC', name: 'Continental collision',
    data: [
        {landscape: [
            {level: 0, name: 'PEAK'},
            {level: 1, name: 'MOUNTAIN'},
            {level: 3, name: 'HILL'},
            {level: 5, name: 'PLAIN'},
        ]},
        {landscape: [
            {level: 0, name: 'MOUNTAIN'},
            {level: 2, name: 'HILL'},
            {level: 4, name: 'PLAIN'},
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
        {landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'PLAIN'},
        ]},
        {landscape: [
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
        ]}
    ]},


    // ==============================================
    // CONTINENTAL-OCEANIC
    // ==============================================
    {key: 'LWCC', name: 'Cordillera',
    data: [
        {landscape: [
            {level: 0, name: 'TRENCH'},
            {level: 1, name: 'DEEP_SEA'},
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
        {landscape: [
            {level: 0, name: 'TRENCH'},
            {level: 1, name: 'DEEP_SEA'},
        ]},
        {landscape: [
            {level: 0, name: 'PLAIN'},
            {level: 1, name: 'MOUNTAIN'},
            {level: 3, name: 'HILL'},
            {level: 4, name: 'PLAIN'},
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
            {level: 4, name: 'PLAIN'},
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
            {level: 1, name: 'PLAIN'},
            {level: 3, name: 'HILL'},
        ]},
    ]},


    // ==============================================
    // OCEANIC-OCEANIC
    // ==============================================
    {key: 'WWCC', name: 'Island arc',
    data: [
        {landscape: [
            {level: 0, name: 'TRENCH'},
            {level: 1, name: 'DEEP_SEA'}
        ]},
        {landscape: [
            {level: 0, name: 'SHALLOW_SEA'},
            {level: 1, name: 'ISLAND'},
            {level: 2, name: 'DEEP_SEA'},
        ]},
    ]},
    // ==============================================
    {key: 'WWCT', name: 'Early island arc',
    data: [
        {landscape: [{level: 0, name: 'DEEP_SEA'}]},
        {landscape: [
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
            {level: 0, name: 'TRENCH'},
            {level: 1, name: 'DEEP_SEA'},
        ]},
        {landscape: [
            {level: 0, name: 'DEEP_SEA'}
        ]}
    ]},
    // ==============================================
    {key: 'WWDT', name: 'Early oceanic rift',
    data: [
        {landscape: [{level: 0, name: 'DEEP_SEA'}]},
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
