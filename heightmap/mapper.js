var infoPanel = document.getElementById("info"),
    mapCanvas = document.getElementById("canvas"),
    mapCtx = mapCanvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    waterlevelInput = document.getElementById("waterlevel"),
    roughnessInput = document.getElementById("roughness"),
    smoothButton = document.getElementById("smooth");

var TILESIZE = 2,
    GRID_WIDTH = 256,
    GRID_HEIGHT = 256;

var MIN_HEIGHT = 0,
    MAX_HEIGHT = 100;


var world = {
    waterLevel: 50,
    roughness: 1.5,
    grid: undefined
};

var draw = function(ctx, grid){
    var copies = ['q1', 'q2', 'q3', 'q4'];

    canvas.width = grid.width * TILESIZE;
    canvas.height = grid.height * TILESIZE;

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
        ctx.beginPath();

        colorMap.forEach(function(item, index) {
            var range = Range.parse(item.range);
            if (range.contains(currentHeight)){
                ctx.fillStyle = item.color;

            }
        });

        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });

    var mapImage = ctx.getImageData(0, 0, mapCanvas.width, mapCanvas.height);

    copies.forEach(function(id, index){
        var canvas = document.getElementById(id),
            copyCtx = canvas.getContext("2d");
        canvas.width = grid.width * TILESIZE/2;
        canvas.height = grid.height * TILESIZE/2;
        copyCtx.drawImage(mapCanvas, 0, 0, canvas.width, canvas.height);
    });
};

var generateHeightMap = function() {
    var heightMap = HeightMap(GRID_WIDTH, GRID_HEIGHT, MIN_HEIGHT, MAX_HEIGHT, world.roughness);
    return smoothHeightMap(heightMap);
};

generateButton.addEventListener('click', function() {
    world.roughness = Number(roughnessInput.value);
    world.grid = generateHeightMap();
    draw(mapCtx, world.grid);
});

smoothButton.addEventListener('click', function() {
    world.grid = smoothHeightMap(world.grid);
    draw(mapCtx, world.grid);
});

waterlevelInput.addEventListener('change', function(){
    world.waterLevel = Number(waterlevelInput.value);
    draw(mapCtx, world.grid);
});

waterlevelInput.value = world.waterLevel;
roughnessInput.value = world.roughness;

world.grid = generateHeightMap();
draw(mapCtx, world.grid);