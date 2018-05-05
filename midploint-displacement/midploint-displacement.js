

var ITERATIONS = 7,
    CANVAS_WIDTH = 450,
    CANVAS_HEIGHT = 300,
    MAX_NUM = 10,
    MIN_NUM = 1;

var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;


var drawLine = function(ctx) {
    ctx.beginPath();
    ctx.lineStyle = "black";
    ctx.moveTo(0, CANVAS_HEIGHT/2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT/2);
    ctx.stroke();
};

var midpoint = function(pointA, pointB) {
    return (pointA + pointB) / 2 + Random.choice([-1, 0, 1]);
};

var draw = function(){
    var points = [];
    for(var i = 0; i < ITERATIONS; i++){
        var point;
        drawLine(ctx);
    }
};

draw();