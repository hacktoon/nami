
export const PROVINCE_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {key: 'LLCC', data: [
        {name: 'Orogeny', landscape: [[.1, .7]]},
        {name: 'Low mountains'},
    ]},

    {key: 'LLCT', data: [
        {name: 'Low mountains', border: true},
        {name: 'Platform', border: true},
    ]},

    {key: 'LLCD', data: [
        {name: 'Low mountains'},
        {name: 'Rift'},
    ]},

    {key: 'LLDT', data: [
        {name: 'Rift'},
        {name: 'Rift'}
    ]},

    {key: 'LLDD', data: [
        {name: 'Rift Sea'},
        {name: 'Rift Sea'}
    ]},

    {key: 'LLTT', data: [
        {name: 'Basin'},
        {name: 'Basin'}
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'LWCC', data: [
        {name: 'Oceanic trench'},
        {name: 'Orogeny'},
    ]},

    {key: 'LWCT', data: [
        {name: 'Oceanic trench'},
        {name: 'Orogeny'},
    ]},

    {key: 'LWCD', data: [
        {name: 'Oceanic mountains'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWDD', data: [
        {name: 'Oceanic Rift'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWDT', data: [
        {name: 'Oceanic Rift'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWTT', data: [
        {name: 'Oceanic basin'},
        {name: 'Oceanic basin'},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'WWCC', data: [
        {name: 'Oceanic trench'},
        {name: 'Island arc'},
    ]},

    {key: 'WWCT', data: [
        {name: 'Oceanic trench'},
        {name: 'Island arc'},
    ]},

    {key: 'WWCD', data: [
        {name: 'Oceanic basin'},
    ]},

    {key: 'WWDD', data: [
        {name: 'Oceanic rift'},
        {name: 'Oceanic basin'}
    ]},

    {key: 'WWDT', data: [
        {name: 'Oceanic rift'},
    ]},

    {key: 'WWTT', data: [
        {name: 'Oceanic basin'},
        {name: 'Oceanic basin'}
    ]},
]
