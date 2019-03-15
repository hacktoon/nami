class Tile {
    constructor (point) {
        this.id = point.hash();
        this.point = point;
        this.heat = undefined;
        this.rain = undefined;
        this.terrain = undefined;
        this.biome = undefined;
    }
};
