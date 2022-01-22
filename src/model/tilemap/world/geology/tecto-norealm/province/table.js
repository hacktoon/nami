
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
        {name: 'Low mountains', deformation: [1, 2]},
        {name: 'Rift', deformation: [0, 2]},
    ]},

    {key: 'LLDT', provinces: [
        {name: 'Rift', deformation: [0, 2]},
    ]},

    {key: 'LLDD', provinces: [
        {name: 'Rift Sea', deformation: [0, 5]},
    ]},

    {key: 'LLTT', provinces: [
        {name: 'Basin', deformation: [1, 8]},
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'LWCC', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Orogeny', deformation: [1, 4]},
    ]},

    {key: 'LWCT', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Orogeny', deformation: [1, 4]},
    ]},

    {key: 'LWCD', provinces: [
        {name: 'Oceanic mountains', deformation: [1, 3]},
        {name: 'Passive margin', deformation: [1, 10]},
    ]},

    {key: 'LWDD', provinces: [
        {name: 'Oceanic Rift', deformation: [0, 14]},
        {name: 'Passive margin', deformation: [1, 10]},
    ]},

    {key: 'LWDT', provinces: [
        {name: 'Oceanic Rift', deformation: [0, 14]},
        {name: 'Passive margin', deformation: [1, 10]},
    ]},

    {key: 'LWTT', provinces: [
        {name: 'Oceanic basin', deformation: [1, 14]},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'WWCC', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Island arc', deformation: [1, 4]},
    ]},

    {key: 'WWCT', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Island arc', deformation: [1, 4]},
    ]},

    {key: 'WWCD', provinces: [
        {name: 'Oceanic basin', deformation: [1, 14]},
    ]},

    {key: 'WWDD', provinces: [
        {name: 'Oceanic rift', deformation: [0, 1]},
        {name: 'Oceanic basin', deformation: [1, 14]}
    ]},

    {key: 'WWDT', provinces: [
        {name: 'Oceanic rift', deformation: [0, 1]},
    ]},

    {key: 'WWTT', provinces: [
        {name: 'Oceanic basin', deformation: [0, 14]},
        {name: 'Oceanic basin', deformation: [0, 14]}
    ]},
]
