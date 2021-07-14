
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
        height: 100, border: '#EEE', color: '#CCC',
        energy: 4, chance: .5, growth: 2
    }
]},

{id: 'LLCT', name: 'Old mountains', data: [
    {height: 100, color: '#749750', energy: 1, chance: .5, growth: 10},
    {height: 100, energy: 0},
]},

{id: 'LLCD', name: 'Inner sea', data: [
    {height: 100, border: '#058', color: '#058', energy: 7, chance: .5, growth: 7},
]},

{id: 'LLDD', name: 'Rift sea', rule: 'weight', data: [
    {height: 100, border: '#058', color: '#058', energy: 6, chance: .5, growth: 6}
]},

{id: 'LLDT', name: 'Rift valley', data: [
    {
        height: 100, border: '#065e06', color: '#065e06', energy: 1, chance: .5, growth: 8
    },
    {energy: 0},
]},

{id: 'LLTT', name: 'Transform Fault', data: [
    {height: 100, color: '#749750', energy: 1, chance: .1, growth: 10},
    {height: 100, energy: 0, chance: .1, growth: 10}
]},


// CONTINENTAL-OCEANIC ---------------------------
{id: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    {height: 50, color: '#036', energy: 2, chance: .5, growth: 1},
    {height: 50, color: '#a79e86', energy: 5, chance: .5, growth: 2, depth: 1},
]},
{id: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    {height: 50, color: '#036', energy: 1, chance: .5, growth: 5},
    {height: 50, color: '#749750', energy: 3, chance: .5, growth: 2, depth: 2},
]},
{id: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {height: 50, color: '#069', energy: 1, chance: .5, growth: 8},
    {height: 50, border: '#058', color: '#069', energy: 1, chance: .5, growth: 2},
]},
{id: 'LWDD', name: 'Passive margin', rule: 'weight', data: [
    {height: 50, border: '#069', color: '#069', energy: 2, chance: .5, growth: 10},
    {height: 50, border: '#069', color: '#069', energy: 2, chance: .5, growth: 8}
]},
{id: 'LWDT', name: 'Island arc basin', rule: 'weight', data: [
    {height: 50, border: '#069', color: '#065e06', energy: 1, chance: .5, growth: 5},
    {height: 50, border: '#069', color: '#069', energy: 3, chance: .5, growth: 6},
]},
{id: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [  // break regions
    {height: 50, color: '#069', energy: 1, chance: .5, growth: 8},
    {height: 50, border: '#069', color: '#069', energy: 1, chance: .5, growth: 8},
]},


// OCEANIC-OCEANIC ---------------------------
{id: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {height: 0, border: '#036', color: '#036', energy: 1, chance: .1, growth: 5},
    {height: 0, color: '#1fa184', energy: 2, chance: .5, growth: 4},
]},
{id: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {height: 0, border: '#069', color: '#036', energy: 2, chance: .4, growth: 2, depth: 1},
    {height: 0, color: '#1fa184', energy: 1, chance: .5, growth: 5},
]},
{id: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {height: 0, border: '#036', color: '#036', energy: 10, chance: .1, growth: 10},
]},
{id: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {height: 0, border: '#047', color: '#047', energy: 1, chance: .1, growth: 2}
]},
{id: 'WWDT', name: 'Early rift', data: [
    {height: 0, color: '#069', energy: 1, chance: .5, growth: 2},
]},
{id: 'WWTT', name: 'Oceanic fault', data: [
    {height: 0, color: '#003f6c', energy: 1, chance: .5, growth: 8},
    {energy: 0}
]},
]
