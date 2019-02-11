var worldCanvas = document.getElementById("worldCanvas"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    infoText = document.getElementById("infoText"),
    viewInput = document.getElementById('viewInput');

var getTileSize = function(){
    return Number(tilesizeInput.value)
};

var world = World.new();
    painter = WorldPainter.new(worldCanvas, getTileSize())

var getViewOption = function () {
    var input = document.getElementById("viewInput"),
        option = input.options[input.selectedIndex];
    return option.value;
};

var draw = function (world) {
    var view = getViewOption();
    return {
        world: function () {
            painter.draw(world.heightMap);
        }
    }[view]();
};

var getCanvasMousePoint = function(e, worldCanvas){
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - worldCanvas.offsetLeft,
        mouseY = e.clientY - worldCanvas.offsetTop + scrollOffset,
        x = _.parseInt(mouseX / getTileSize()),
        y = _.parseInt(mouseY / getTileSize());
    return Point.new(x, y);
};

/************ EVENT HANDLING *************************/

viewInput.addEventListener('change', draw);

generateButton.addEventListener('click', function() {
    world = World.new();
    draw(world);
});

worldCanvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, worldCanvas),
        position = "(x = "+ point.x + ", y = " + point.y + ")",
        height = world.heightMap.get(point),
        heightText = " | Height: " + height,
        terrain = " | Terrain: " + world.terrainMap[height].name;

    infoText.innerHTML = position + terrain + heightText;
});

draw(world);
