var mapCanvas = document.getElementById("heightmap-canvas"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    mapViewInput = document.getElementById("map-view");

var TILESIZE = 2;

var world = {
    size: 256,
    heightRange: Range.new(0, 100),
    roughness: 1.5,
    waterLevel: 40,
    grid: undefined,
    stats: {
        highland: []
    }
};

var draw = function(ctx, grid, opts){
    var opts = opts || {};

    mapCanvas.width = grid.width * TILESIZE;
    mapCanvas.height = grid.height * TILESIZE;

    var colorMap = [
        {range: '0:30', color: "#0052AF"},
        {range: '31:40', color: "#005FCA"},
        {range: '41:50', color: "#008900"},
        {range: '51:60', color: "#009000"},
        {range: '61:70', color: "#009C00"},
        {range: '71:80', color: "#00A600"},
        {range: '81:84', color: "#00ab00"},
        {range: '85:95', color: "#00af00"},
        {range: '96:98', color: "#00be00"},
        {range: '99:100', color: "#00d000"},
    ];

    grid.map(function(currentHeight, point){
        colorMap.forEach(function(item, index) {
            var range = Range.parse(item.range);
            if (range.contains(currentHeight)){
                ctx.fillStyle = item.color;
            }
            if (currentHeight == -5){
                ctx.fillStyle = "red";
            }
        });
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};

var generateRivers = function(world) {
    var grid = world.grid,
        sproutPoint = _.sample(world.stats.highland);
        headPoint = sproutPoint;

    while(grid.get(headPoint) > world.waterLevel){
        var neighbours = grid.directNeighbours(headPoint);
        grid.set(headPoint, -5);
        headPoint = _.minBy(neighbours, function(p) { return grid.get(p); });
    }
};

var stats = function(world) {
    world.grid.map(function(height, point) {
        if (height > world.heightRange.end - 10){
            world.stats.highland.push(point);
        }
    });
};

var generate = function(world) {
    var heightMap = HeightMap(world.size, world.heightRange, world.roughness);
    var moistureMap = HeightMap(world.size, Range.new(0, 10), 1);

    world.grid = GridFilter.smooth(heightMap);

    stats(world);
    generateRivers(world);
    draw(mapCtx, world.grid);
};

generateButton.addEventListener('click', function() {
    world.roughness = Number(roughnessInput.value);
    generate(world);
});

mapViewInput.addEventListener('change', function(e) {
    var mapView = e.target.selectedOptions[0].value;
});

roughnessInput.value = world.roughness;

generate(world);