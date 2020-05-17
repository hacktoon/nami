
export default class WorldPainter {
    drawHeightMap(world, tilesize) {
        world.iter((tile, point) => {
            const color = world.reliefMap.codeMap.getColor(point)
            this.drawTile(ctx, point, color, tilesize)
        })
    }

    drawRelief(world, tilesize) {
        world.iter((tile, point) => {
            const color = world.reliefMap.getColor(point)
            this.drawTile(ctx, point, color, tilesize)
        })
    }

    drawHeat(world, tilesize) {
        world.iter((tile, point) => {
            const color = world.heatMap.getColor(tile.point)
            this.drawTile(ctx, point, color, tilesize)
        })
    }

    drawMoisture(world, tilesize) {
        world.iter((tile, point) => {
            const color = world.moistureMap.getColor(tile.point)
            this.drawTile(ctx, point, color, tilesize)
        })
    }

    drawWater(world, tilesize) {
        world.iter((tile, point) => {
            const color = world.waterMap.getColor(point)
            this.drawTile(ctx, point, color, tilesize)
        })
    }

    drawLandmass(world, tilesize) {
        let defaultColor = "#444"
        world.iter((tile, point) => {
            const color = tile.landmass ? tile.landmass.color : defaultColor
            this.drawTile(ctx, point, color, tilesize)
        })
    }

    drawBiome(world, tilesize) {
        world.iter((tile, point) => {
            const color = tile.debug ? "red" : tile.biome.color
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
