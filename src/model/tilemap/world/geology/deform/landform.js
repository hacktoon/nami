
export const LANDFORMS = {
    PEAK: {water: false, border: '#CCC', color: '#CCC'},
    MOUNTAIN: {water: false, height: 80, color: '#a79e86'},
    PLATEAU: {water: false, height: 60, color: '#796'},
    PLAIN: {water: false, height: 20, color: '#574'},
    DEPRESSION: {water: false, height: 10, color: '#352'},
    ISLAND_ARC: {water: false, height: 10, border: '#058', color: '#574'},
    PASSIVE_MARGIN: {water: false, height: 0, border: '#079', color: '#079'},
    SHALLOW_SEA: {water: true, height: 0, border: '#079', color: '#079'},
    RIFT_SEA: {water: true, height: -10, border: '#058', color: '#069'},
    DEEP_SEA: {water: true, height: -20, border: '#058', color: '#058'},
    TRENCH: {water: true, height: -30, border: '#058', color: '#036'},
}
