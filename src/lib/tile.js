export default class Tile {
    constructor (point) {
        this.id = point.hash();
        this.point = point;
        this.heat = undefined;
        this.rain = undefined;
        this.elevation = undefined;
        this.biome = undefined;
    }
};
