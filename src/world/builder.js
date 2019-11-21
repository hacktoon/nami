import _ from 'lodash'


export class WorldPainter {
    draw(ctx, world, tilesize) {
        world.iter((tile, point) => {
            const color = world.reliefMap.codeMap.getColor(point)
            this.drawTile(ctx, point, color, tilesize)
        })
    }

    drawTile(ctx, point, color, tilesize) {
        let x = point.x * tilesize,
            y = point.y * tilesize

        ctx.fillStyle = color
        ctx.fillRect(x, y, tilesize, tilesize)
    }
}
