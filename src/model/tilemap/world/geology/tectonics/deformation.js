const DEFORMATIONS = {
    SUMMIT: {
        name: 'SUMMIT', water: false, height: 7, color: '#DDD',
    },
    PEAK: {
        name: 'PEAK', water: false, height: 6, color: '#AAA',
    },
    MOUNTAIN: {
        name: 'MOUNTAIN', water: false, height: 5, color: '#8b8372',
    },
    HILL: {
        name: 'HILL', water: false, height: 4, color: '#585',
    },
    PLAIN: {
        name: 'PLAIN', water: false, height: 3, color: '#574',
    },
    HOTSPOT_GEYSER: {
        name: 'HOTSPOT_GEYSER', water: false, height: 4, color: '#884',
    },
    ISLAND: {
        name: 'ISLAND', water: false, height: 3, color: '#574',
    },
    HOTSPOT_ISLAND: {
        name: 'HOTSPOT_ISLAND', water: false, height: 3, color: '#463',
    },
    DEPRESSION: {
        name: 'DEPRESSION', water: false, height: 2, color: '#4f664c'
    },
    SHALLOW_SEA: {
        name: 'SHALLOW_SEA', water: true, height: 2, color: '#069',
    },
    DEEP_SEA: {
        name: 'DEEP_SEA', water: true, height: 1, color: '#058',
    },
    TRENCH: {
        name: 'TRENCH', water: true, height: 0, color: '#147'
    },
}


export class Deformation {
    static get(name) {
        return DEFORMATIONS[name]
    }

    static getOceanicHotspot() {
        return DEFORMATIONS['HOTSPOT_ISLAND']
    }

    static getContinentalHotspot() {
        return DEFORMATIONS['HOTSPOT_GEYSER']
    }
}