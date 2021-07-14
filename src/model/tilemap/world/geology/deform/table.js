
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
{id: 'LLCC', name: 'Collision between continents', data: [
    {
        height: 100, border: '#EEE', color: '#CCC',
        energy: 3, chance: .5, growth: 2
    }
]},
{id: 'LLCT', name: 'Old orogeny', rule: 'weight', data: [
    {height: 100, color: '#749750', energy: 1, chance: .5, growth: 10},
    {height: 100, energy: 0, chance: .4, growth: 5},
]},
{id: 'LLCD', name: 'Intra ocean', data: [
    {height: 100, border: '#058', color: '#058', energy: 7, chance: .5, growth: 7}
]},
{id: 'LLDD', name: 'Early rift sea', rule: 'weight', data: [
    {height: 100, border: '#047', color: '#058', energy: 6, chance: .5, growth: 6},
]},
{id: 'LLDT', name: 'Rift valley', data: [
    {height: 100, border: '#065e06', color: '#065e06', energy: 2, chance: .5, growth: 5},
]},
{id: 'LLTT', name: 'Transform Fault', data: [
    {height: 100, color: '#9aae6d', energy: 1, chance: .1, growth: 10},
    {height: 100, color: '#9aae6d', energy: 0, chance: .1, growth: 10}
]},


// CONTINENTAL-OCEANIC ---------------------------
{id: 'LWCC', name: 'Cordillera', rule: 'weight', data: [
    // trench
    {height: 50, color: '#025', energy: 1, chance: .5, growth: 1},
    // mountains
    {height: 50, color: '#a79e86', energy: 5, chance: .6, growth: 2, depth: 1},
]},
{id: 'LWCT', name: 'Early cordillera', rule: 'weight', data: [
    // trench
    {height: 50, color: '#025', energy: 1, chance: .5, growth: 5},
    // mountains
    {height: 50, color: '#a4ce84', energy: 3, chance: .5, growth: 4, depth: 1},
]},
{id: 'LWCD', name: 'Early passive margin', rule: 'weight', data: [
    {height: 50, color: '#069', energy: 1, chance: .5, growth: 8},
    {height: 50, border: '#058', color: '#069', energy: 1, chance: .5, growth: 2},
]},
{id: 'LWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {height: 50, border: '#069', color: '#069', energy: 1, chance: .5, growth: 2}
]},
{id: 'LWDT', name: 'Back-arc basin', rule: 'weight', data: [
    {height: 50, border: '#069', color: '#065e06', energy: 1, chance: .5, growth: 5},
    {height: 50, border: '#069', color: '#069', energy: 1, chance: .5, growth: 5},
]},
{id: 'LWTT', name: 'Coastal fault', rule: 'weight', data: [  // break regions
    {height: 50, color: '#069', energy: 1, chance: .5, growth: 8},
    {height: 50, border: '#069', color: '#069', energy: 1, chance: .5, growth: 8},
]},


// OCEANIC-OCEANIC ---------------------------
{id: 'WWCC', name: 'Island arc', rule: 'weight', data: [
    {height: 0, border: '#036', color: '#025', energy: 1, chance: .1, growth: 5},
    {height: 0, color: '#1fa184', energy: 2, chance: .5, growth: 4},
]},
{id: 'WWCT', name: 'Early island arc', rule: 'weight', data: [
    {height: 0, border: '#069', color: '#025', energy: 2, chance: .4, growth: 2, depth: 1},
    {height: 0, color: '#1fa184', energy: 1, chance: .5, growth: 5},
]},
{id: 'WWCD', name: 'Abyssal plains', rule: 'weight', data: [
    {height: 0, border: '#036', color: '#036', energy: 10, chance: .1, growth: 10},
]},
{id: 'WWDD', name: 'Oceanic rift', rule: 'weight', data: [
    {height: 0, border: '#069', color: '#047', energy: 1, chance: .1, growth: 2}
]},
{id: 'WWDT', name: 'Early rift', data: [
    {height: 0, color: '#069', energy: 1, chance: .5, growth: 2},
]},
{id: 'WWTT', name: 'Oceanic fault', data: [
    {height: 0, color: '#003f6c', energy: 1, chance: .5, growth: 8}
]},
]
