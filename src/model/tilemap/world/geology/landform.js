
export const LANDFORMS = {
    PEAK: {
        name: 'PEAK', water: false, height: 5, color: '#AAA',
        erosion: 'MOUNTAIN'
    },
    MOUNTAIN: {
        name: 'MOUNTAIN', water: false, height: 4, color: '#8b8372',
        erosion: 'HILL'
    },
    PLATEAU: {
        name: 'PLATEAU', water: false, height: 3, color: '#996',
        erosion: 'PLAIN'
    },
    HILL: {
        name: 'HILL', water: false, height: 3, color: '#685',
        erosion: 'PLAIN'
    },
    PLAIN: {
        name: 'PLAIN', water: false, height: 2, color: '#574'
    },
    ISLAND: {
        name: 'ISLAND', water: false, height: 0, color: '#685'
    },
    DEPRESSION: {
        name: 'DEPRESSION', water: false, height: 0, color: '#352'
    },
    SHALLOW_SEA: {
        name: 'SHALLOW_SEA', water: true, height: -1, color: '#069'
    },
    DEEP_SEA: {
        name: 'DEEP_SEA', water: true, height: -2, color: '#058',
        erosion: 'TRENCH'
    },
    TRENCH: {
        name: 'TRENCH', water: true, height: -3, border: '#058', color: '#147'
    },
}


export class Landform {
    static isHigherEqualThan(ld1, ld2) {
        return ld1.height >= ld2.height
    }
}