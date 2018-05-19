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

    grid.map(function(value, point){
        ctx.beginPath();

        if (value < world.waterLevel){
            ctx.fillStyle = "#005fca";
        }

        if (value < world.waterLevel - 20){
            ctx.fillStyle = "#0052AF";
        }

        if (value > world.waterLevel) {
            ctx.fillStyle = "#009000";
        }

        if (value > world.waterLevel + 20) {
            ctx.fillStyle = "#009c00";
        }

        if (value >= world.waterLevel + 47){
            ctx.fillStyle = "#BBB";
        }

        if (value >= world.waterLevel + 48){
            ctx.fillStyle = "#DDD";
        }

        if (value == world.waterLevel + 49){
            ctx.fillStyle = "#FFF";
        }

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
    return HeightMap(GRID_WIDTH, GRID_HEIGHT, MIN_HEIGHT, MAX_HEIGHT, world.roughness);
};

generateButton.addEventListener('click', function() {
    world.roughness = Number(roughnessInput.value);
    world.grid = generateHeightMap();
    draw(mapCtx, world.grid);
});

smoothButton.addEventListener('click', function() {
    smoothHeightMap(world.grid);
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