class Tile {
    constructor (point) {
        this.id = point.hash();
        this.point = point;
        this.height = 0;
        this.plate = undefined;
        this.terrain = undefined;
        this.biome = undefined;

        this.isPlateEdge = false;
    }
};
