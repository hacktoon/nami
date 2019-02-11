var surfaceCanvas = document.getElementById("surfaceCanvas"),
    generateButton = document.getElementById("generateButton"),
    tilesizeInput = document.getElementById("tilesizeInput"),
    infoPanel = document.getElementById("info"),
    viewInput = document.getElementById('viewInput');

var getTileSize = function(){
    return Number(tilesizeInput.value)
};

var world = World.new();
    painter = SurfacePainter.new(surfaceCanvas, getTileSize())

var getViewOption = function () {
    var input = document.getElementById("viewInput"),
        option = input.options[input.selectedIndex];
    return option.value;
};

var draw = function (world) {
    var view = getViewOption();
    return {
        surface: function () {
            painter.draw(world.heightMap);
        }
    }[view]();
};

var getCanvasMousePoint = function(e, surfaceCanvas){
    var scrollOffset = window.pageYOffset || document.documentElement.scrollTop,
        mouseX = e.clientX - surfaceCanvas.offsetLeft,
        mouseY = e.clientY - surfaceCanvas.offsetTop + scrollOffset,
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

surfaceCanvas.addEventListener('mousemove', function(e) {
    var point = getCanvasMousePoint(e, surfaceCanvas),
        position = "(x = "+ point.x + ", y = " + point.y + ")",
        height = world.heightMap.get(point),
        heightText = " | Height: " + height,
        terrain = " | Terrain: " + world.terrainMap[height].name;

    infoPanel.innerHTML = position + terrain + heightText;
});

draw(world);
