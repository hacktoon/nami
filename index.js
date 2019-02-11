var canvas = document.getElementById("surface"),
    canvasCtx = canvas.getContext("2d"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    infoPanel = document.getElementById("info"),
    viewInput = document.getElementById('viewInput');

var getTileSize = function(){
    return Number(tilesizeInput.value)
};

var world = World.new();

var getViewOption = function () {
    var input = document.querySelector("#viewInput"),
        option = input.options[input.selectedIndex];
    return option.value;
};

var draw = function () {
    var view = getViewOption();
    return {
        surface: function () {
            drawMap(canvasCtx, world.heightMap);
        }
    }[view]();
};

viewInput.addEventListener('change', draw);

generateButton.addEventListener('click', function() {
    world = World.new();
    draw();
});

var getCanvasMousePoint = function(e, canvas){
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - canvas.offsetLeft,
        mouseY = e.clientY - canvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSize()),
        y = _.parseInt(mouseY / getTileSize());
    return Point.new(x, y);
};

canvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, canvas),
        position = "(x = "+ point.x + ", y = " + point.y + ")",
        height = world.heightMap.get(point),
        heightText = " | Height: " + height,
        terrain = " | Terrain: " + world.terrainMap[height].name;

    infoPanel.innerHTML = position + terrain + heightText;
});

draw();
