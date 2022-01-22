
export const PROVINCE_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {boundary: 'LLCC', provinces: [
        {name: 'Orogeny', deformation: [0, 8]},
        {name: 'Low mountains', deformation: [0, 4]},
    ]},

    {boundary: 'LLCT', provinces: [
        {name: 'Low mountains', deformation: [0, 3]},
        {name: 'Platform', deformation: [0, 2]},
    ]},

    {boundary: 'LLCD', provinces: [
        {name: 'Low mountains', deformation: [1, 2]},
        {name: 'Rift', deformation: [0, 2]},
    ]},

    {boundary: 'LLDT', provinces: [
        {name: 'Rift', deformation: [0, 2]},
    ]},

    {boundary: 'LLDD', provinces: [
        {name: 'Rift Sea', deformation: [0, 5]},
    ]},

    {boundary: 'LLTT', provinces: [
        {name: 'Basin', deformation: [1, 8]},
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Orogeny', deformation: [1, 4]},
    ]},

    {boundary: 'LWCT', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Orogeny', deformation: [1, 4]},
    ]},

    {boundary: 'LWCD', provinces: [
        {name: 'Oceanic mountains', deformation: [1, 3]},
        {name: 'Passive margin', deformation: [1, 10]},
    ]},

    {boundary: 'LWDD', provinces: [
        {name: 'Oceanic Rift', deformation: [1, 2]},
        {name: 'Passive margin', deformation: [1, 10]},
    ]},

    {boundary: 'LWDT', provinces: [
        {name: 'Oceanic Rift', deformation: [1, 2]},
        {name: 'Passive margin', deformation: [1, 10]},
    ]},

    {boundary: 'LWTT', provinces: [
        {name: 'Oceanic basin', deformation: [1, 14]},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Island arc', deformation: [2, 5]},
    ]},

    {boundary: 'WWCT', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Island arc', deformation: [2, 4]},
    ]},

    {boundary: 'WWCD', provinces: [
        {name: 'Oceanic basin', deformation: [1, 14]},
    ]},

    {boundary: 'WWDD', provinces: [
        {name: 'Oceanic rift', deformation: [1, 2]},
        {name: 'Oceanic basin', deformation: [1, 14]}
    ]},

    {boundary: 'WWDT', provinces: [
        {name: 'Oceanic rift', deformation: [1, 2]},
    ]},

    {boundary: 'WWTT', provinces: [
        {name: 'Oceanic basin', deformation: [0, 14]},
        {name: 'Oceanic basin', deformation: [0, 14]}
    ]},
]
