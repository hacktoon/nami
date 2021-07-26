
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
// CONTINENTAL-CONTINENTAL ---------------------------
{id: 'LLCC', name: 'Continental collision', data: [
    {
        height: 100, border: '#CCC', color: '#CCC',
        maxLevel: 3, chance: .5, growth: 4
    }
]},

{id: 'LLCT', name: 'Old mountains', data: [
    {height: 100, color: '#584', maxLevel: 1, chance: .5, growth: 10},
    {maxLevel: 0},
]},

{id: 'LLCD', name: 'Inner sea', data: [
    {height: 100, border: '#058', color: '#058', maxLevel: 7, chance: .5, growth: 5}
]},

{id: 'LLDD', name: 'Rift sea', rule: 'weight', data: [
    {height: 100, border: '#058', color: '#058', maxLevel: 6, chance: .5, growth: 5}
]},

{id: 'LLDT', name: 'Rift valley', data: [
    {
        height: 100, border: '#061', color: '#061',
        maxLevel: 1, chance: .5, growth: 8
    },
    {maxLevel: 0},
]},

{id: 'LLTT', name: 'Transform Fault', data: [
    {height: 100, color: '#061', maxLevel: 1, chance: .1, growth: 10},
    {height: 100, maxLevel: 0, chance: .1, growth: 10}
]},


// CONTINENTAL-OCEANIC ---------------------------
{id: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {height: 50, color: '#036', maxLevel: 4, chance: .5, growth: 1},
    {height: 50, color: '#a79e86', minLevel: 1, maxLevel: 5, chance: .5, growth: 2},
]},
{id: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {height: 50, color: '#036', maxLevel: 3, chance: .5, growth: 2},
    {height: 50, color: '#584', minLevel: 2, maxLevel: 4, chance: .5, growth: 2},
]},
{id: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {height: 50, color: '#069', maxLevel: 1, chance: .5, growth: 8},
    {height: 50, border: '#058', color: '#069', maxLevel: 1, chance: .5, growth: 2},
]},
{id: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {height: 50, border: '#069', color: '#069', maxLevel: 2, chance: .5, growth: 10},
    {height: 50, border: '#069', color: '#069', maxLevel: 2, chance: .5, growth: 8}
]},
{id: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {height: 50, border: '#069', color: '#1c7816', maxLevel: 1, chance: .5, growth: 5},
    {height: 50, border: '#069', color: '#069', maxLevel: 3, chance: .5, growth: 6},
]},
{id: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [
    {height: 50, color: '#069', maxLevel: 1, chance: .5, growth: 8},
    {height: 50, border: '#069', color: '#069', maxLevel: 1, chance: .5, growth: 8},
]},


// OCEANIC-OCEANIC ---------------------------
{id: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {height: 0, border: '#036', color: '#036', maxLevel: 1, chance: .1, growth: 5},
    {height: 0, color: '#1c7816', maxLevel: 2, chance: .5, growth: 4},
]},
{id: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {height: 0, border: '#058', color: '#036', maxLevel: 2, chance: .4, growth: 2},
    {height: 0, border: '#058', color: '#1c7816', maxLevel: 1, chance: .5, growth: 5},
]},
{id: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {height: 0, border: '#036', color: '#036', maxLevel: 10, chance: .1, growth: 10},
]},
{id: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {height: 0, border: '#036', color: '#036', maxLevel: 2, chance: .5, growth: 10}
]},
{id: 'WWDT', name: 'Early rift', data: [
    {height: 0, color: '#069', maxLevel: 1, chance: .5, growth: 2},
    {maxLevel: 0}
]},
{id: 'WWTT', name: 'Oceanic fault', data: [
    {height: 0, color: '#003f6c', maxLevel: 1, chance: .5, growth: 8},
    {maxLevel: 0}
]},
]
