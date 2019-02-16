var Tile = (function () {
    var _Tile = function (point) {
        var self = this;

        this.id = point.hash();
        this.point = point;
        this.height = 0;
        this.plate = undefined;
        this.terrain = undefined;
        this.biome = undefined;

        this.isPlateEdge = false;
    };

    return {
        new: function (point) {
            var tile = new _Tile(point);
            return tile;
        }
    };
})();
