
export const BOUNDARY_TABLE = [
    // ==============================================
    // CONTINENTAL-CONTINENTAL
    // ==============================================
    {key: 'LLCC', name: 'Continental collision',
    data: [
        {landscape: ['PEAK', 'MOUNTAIN', 'HILL', 'PLAIN']},
        {landscape: ['MOUNTAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LLCT', name: 'Old mountains',
    data: [
        {landscape: ['MOUNTAIN', 'HILL', 'PLAIN']},
        {landscape: ['HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LLCD', name: 'Rift valley',
    data: [
        {landscape: ['DEPRESSION', 'PLAIN', 'HILL', 'PLAIN']},
        {landscape: ['PLAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LLDT', name: 'Early rift sea',
    data: [
        {landscape: ['SHALLOW_SEA', 'PLAIN']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']}
    ]},
    // ==============================================
    {key: 'LLDD', name: 'Rift sea',
    data: [
        {landscape: ['DEEP_SEA', 'SHALLOW_SEA', 'PLAIN']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']}
    ]},
    // ==============================================
    {key: 'LLTT', name: 'Transform Fault',
    data: [
        {landscape: ['PLAIN', 'HILL', 'PLAIN']}
    ]},


    // ==============================================
    // CONTINENTAL-OCEANIC
    // ==============================================
    {key: 'LWCC', name: 'Cordillera',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['PLAIN', 'PEAK', 'MOUNTAIN', 'HILL']},
    ]},
    // ==============================================
    {key: 'LWCT', name: 'Early cordillera',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['PLAIN', 'MOUNTAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LWCD', name: 'Early passive margin',
    data: [
        {landscape: ['SHALLOW_SEA', 'DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LWDD', name: 'Passive margin',
    data: [
        {landscape: ['SHALLOW_SEA', 'DEEP_SEA',]},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN',]},
    ]},
    // ==============================================
    {key: 'LWDT', name: 'Island arc basin',
    data: [
        {landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LWTT', name: 'Coastal fault',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['DEEP_SEA', 'PLAIN', 'HILL']},
    ]},


    // ==============================================
    // OCEANIC-OCEANIC
    // ==============================================
    {key: 'WWCC', name: 'Island arc',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA']},
    ]},
    // ==============================================
    {key: 'WWCT', name: 'Early island arc',
    data: [
        {landscape: ['DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA',]},
    ]},
    // ==============================================
    {key: 'WWCD', name: 'Abyssal plains',
    data: [
        {landscape: ['DEEP_SEA']},
    ]},
    // ==============================================
    {key: 'WWDD', name: 'Oceanic rift',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA',]},
        {landscape: ['DEEP_SEA']}
    ]},
    // ==============================================
    {key: 'WWDT', name: 'Early oceanic rift',
    data: [
        {landscape: ['DEEP_SEA']},
    ]},
    // ==============================================
    {key: 'WWTT', name: 'Oceanic fault',
    data: [
        {landscape: ['SHALLOW_SEA', 'DEEP_SEA']},
        {landscape: ['DEEP_SEA']}
    ]},
]
