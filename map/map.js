var mapCanvas = document.getElementById("canvas"),
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
    heightMap: undefined,
    stats: {
        highland: []
    }
};

var heightmapColorMap = [
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

var moistureColorMap = [
    {range: '0:15', color: "tomato"},
    {range: '16:25', color: "darkorange"},
    {range: '26:35', color: "mediumseagreen"},
    {range: '36:50', color: "mediumaquamarine"}
];


var draw = function(ctx, grid, opts){
    var opts = opts || {};

    grid.map(function(currentValue, point){
        opts.colorMap.forEach(function(item, index) {
            var range = Range.parse(item.range);
            if (range.contains(currentValue)){
                ctx.fillStyle = item.color;
            }
        });
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};

var drawMap = function(ctx, world){
    world.heightMap.map(function(currentValue, point){
        heightmapColorMap.forEach(function(item, index) {
            var range = Range.parse(item.range);
            if (range.contains(currentValue)){
                ctx.fillStyle = item.color;
            }

            if (world.moistureMap.get(point) <= 15 && currentValue > world.waterLevel + 20){
                ctx.fillStyle = "PaleGoldenRod";
            }
        });
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};

var generateRivers = function(world) {
    var grid = world.heightMap,
        sproutPoint = _.sample(world.stats.highland);
        headPoint = sproutPoint;

    while(grid.get(headPoint) > world.waterLevel){
        var neighbours = grid.directNeighbours(headPoint);
        grid.set(headPoint, -5);
        headPoint = _.minBy(neighbours, function(p) { return grid.get(p); });
    }
};

var stats = function(world) {
    world.heightMap.map(function(height, point) {
        if (height > world.heightRange.end - 10){
            world.stats.highland.push(point);
        }
    });
};

var generate = function(world) {
    var heightMap = HeightMap(world.size, world.heightRange, world.roughness),
        moistureMap = HeightMap(world.size, Range.new(0, 50), 0.8)

    world.heightMap = GridFilter.smooth(heightMap);
    world.moistureMap = GridFilter.smooth(moistureMap);

    //stats(world);
    //generateRivers(world);
    drawMap(mapCtx, world);
};

generateButton.addEventListener('click', function() {
    world.roughness = Number(roughnessInput.value);
    generate(world);
});

mapViewInput.addEventListener('change', function(e) {
    var mapView = e.target.selectedOptions[0].value;
    if (mapView === 'moisture'){
        draw(mapCtx, world.moistureMap, {colorMap: moistureColorMap});
    } else {
        drawMap(mapCtx, world);
    }
});

roughnessInput.value = world.roughness;

mapCanvas.width = world.size * TILESIZE;
mapCanvas.height = world.size * TILESIZE;

generate(world);