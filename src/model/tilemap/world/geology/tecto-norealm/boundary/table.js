
export const BOUNDARY_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {key: 'LLCC', data: [
        {name: 'High mountains'},
        {name: 'Low mountains'},
    ]},

    {key: 'LLCT', data: [
        {name: 'Low mountains'},
        {name: 'Platform'},
    ]},

    {key: 'LLCD', data: [
        {name: 'Low mountains'},
        {name: 'Rift'},
    ]},

    {key: 'LLDT', name: 'Early rift sea', data: [
        {name: 'Rift'},
        {name: 'Rift'}
    ]},

    {key: 'LLDD', name: 'Rift sea', data: [
        {name: 'Rift'},
        {name: 'Rift'}
    ]},

    {key: 'LLTT', name: 'Transform Fault', data: [
        {name: 'Basin'},
        {name: 'Basin'}
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'LWCC', name: 'Cordillera', data: [
        {name: 'Oceanic trench'},
        {name: 'Orogeny'},
    ]},

    {key: 'LWCT', name: 'Early cordillera', data: [
        {name: 'Oceanic trench'},
        {name: 'Orogeny'},
    ]},

    {key: 'LWCD', name: 'Early passive margin', data: [
        {name: 'Oceanic mountains'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWDD', name: 'Passive margin', data: [
        {name: 'Oceanic Rift'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWDT', name: 'Island arc basin', data: [
        {name: 'Island arc'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWTT', name: 'Coastal fault', data: [
        {name: 'Oceanic basin'},
        {name: 'Oceanic basin'},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'WWCC', name: 'Island arc', data: [
        {name: 'Oceanic trench'},
        {name: 'Island arc'},
    ]},

    {key: 'WWCT', name: 'Early island arc', data: [
        {name: 'Island arc'},
        {name: 'Island arc'},
    ]},

    {key: 'WWCD', name: 'Abyssal plains', data: [
        {name: 'Oceanic basin'},
    ]},

    {key: 'WWDD', name: 'Oceanic rift', data: [
        {name: 'Oceanic rift'},
        {name: 'Oceanic basin'}
    ]},

    {key: 'WWDT', name: 'Early oceanic rift', data: [
        {name: 'Oceanic rift'},
    ]},

    {key: 'WWTT', name: 'Oceanic fault', data: [
        {name: 'Oceanic basin'},
        {name: 'Oceanic basin'}
    ]},
]
