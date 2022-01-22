
export const PROVINCE_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {key: 'LLCC', provinces: [
        {name: 'Orogeny', deformation: [0, 8]},
        {name: 'Low mountains', deformation: [0, 2]},
    ]},

    {key: 'LLCT', provinces: [
        {name: 'Low mountains', deformation: [0, 3]},
        {name: 'Platform', deformation: [0, 2]},
    ]},

    {key: 'LLCD', provinces: [
        {name: 'Low mountains'},
        {name: 'Rift'},
    ]},

    {key: 'LLDT', provinces: [
        {name: 'Rift'},
        {name: 'Rift'}
    ]},

    {key: 'LLDD', provinces: [
        {name: 'Rift Sea'},
        {name: 'Rift Sea'}
    ]},

    {key: 'LLTT', provinces: [
        {name: 'Basin'},
        {name: 'Basin'}
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'LWCC', provinces: [
        {name: 'Oceanic trench'},
        {name: 'Orogeny', deformation: [1, 4]},
    ]},

    {key: 'LWCT', provinces: [
        {name: 'Oceanic trench'},
        {name: 'Orogeny', deformation: [1, 4]},
    ]},

    {key: 'LWCD', provinces: [
        {name: 'Oceanic mountains'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWDD', provinces: [
        {name: 'Oceanic Rift'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWDT', provinces: [
        {name: 'Oceanic Rift'},
        {name: 'Passive margin'},
    ]},

    {key: 'LWTT', provinces: [
        {name: 'Oceanic basin'},
        {name: 'Oceanic basin'},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'WWCC', provinces: [
        {name: 'Oceanic trench'},
        {name: 'Island arc'},
    ]},

    {key: 'WWCT', provinces: [
        {name: 'Oceanic trench'},
        {name: 'Island arc'},
    ]},

    {key: 'WWCD', provinces: [
        {name: 'Oceanic basin'},
    ]},

    {key: 'WWDD', provinces: [
        {name: 'Oceanic rift'},
        {name: 'Oceanic basin'}
    ]},

    {key: 'WWDT', provinces: [
        {name: 'Oceanic rift'},
    ]},

    {key: 'WWTT', provinces: [
        {name: 'Oceanic basin'},
        {name: 'Oceanic basin'}
    ]},
]
