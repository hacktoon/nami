var mapCanvas = document.getElementById("canvas"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    roughnessInput = document.getElementById("roughness"),
    mapViewInput = document.getElementById("map-view"),
    infoPanel = document.getElementById("info");

var TILESIZE = 4;

var world = {
    size: 128,
    heightRange: Range.new(0, 100),
    roughness: 3,
    waterLevel: 40,
    heightMap: undefined,
    stats: {
        highland: []
    }
};

var heightmapColorMap = [
    {range: '0:40', color: "#0052AF"},
    {range: '41:50', color: "#005FCA"},
    {range: '51:60', color: "#008900"},
    {range: '61:70', color: "#009000"},
    {range: '71:80', color: "#009C00"},
    {range: '81:90', color: "#00A600"},
    {range: '91:94', color: "#00ab00"},
    {range: '95:96', color: "#00af00"},
    {range: '97:98', color: "#00be00"},
    {range: '99:100', color: "#00d000"},
];

var moistureColorMap = [
    {range: '0:35', color: RandomColor()},
    {range: '36:55', color: RandomColor()},
    {range: '56:85', color: RandomColor()},
    {range: '86:100', color: RandomColor()}
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
        for (var i=0; i< heightmapColorMap.length; i++){
            var item = heightmapColorMap[i],
                range = Range.parse(item.range);

            // if (world.moistureMap.get(point) <= 35 && currentValue > world.waterLevel){
            //     ctx.fillStyle = "PaleGoldenRod";
            //     break;
            // }
            if (range.contains(currentValue)){
                ctx.fillStyle = item.color;
            }

        };
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};


var erode = function(world) {
    var edges = world.tiles.atWaterLevel;
};


var generateRivers = function(world) {
    var grid = world.heightMap,
        sproutPoint = _.sample(world.stats.highland);
        headPoint = sproutPoint;

    while(grid.get(headPoint) > world.waterLevel){
        var neighbours = Point.neighborHood(headPoint, 'axials');
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
        moistureMap = HeightMap(world.size, world.heightRange, world.roughness);

    world.heightMap = GridFilter.average(heightMap);
    world.moistureMap = GridFilter.average(moistureMap);

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

mapCanvas.addEventListener('mousemove', function(e) {
    var x = _.parseInt((e.clientX - mapCanvas.offsetLeft) / TILESIZE),
        y = _.parseInt((e.clientY - mapCanvas.offsetTop) / TILESIZE);
        point = Point.new(x, y),
        height = world.heightMap.get(point),
        moisture = world.moistureMap.get(point);
    var text = "(x: "+ x + ", y: " + y + ")<br/>" + "Height: " + height + ",  Moisture: " + moisture;
    infoPanel.innerHTML = text;
});

roughnessInput.value = world.roughness;

mapCanvas.width = world.size * TILESIZE;
mapCanvas.height = world.size * TILESIZE;

generate(world);