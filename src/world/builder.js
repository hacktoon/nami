import _ from 'lodash'

import { Random } from '../lib/base'

import World from '.'
import { ReliefMap } from './geo/relief'
import { WaterMap } from './geo/water'
import { HeatMap } from './atm/heat'
import { MoistureMap } from './atm/moisture'
import { BiomeMap } from './bio/biome'


export function buildWorld(config) {
    let defaultConfig = {size: 257, roughness: 8, seed: (+new Date())}
    let {size, roughness, seed} = config || defaultConfig;
    Random.seed = seed
    const world = new World(seed, size)
    const reliefMap = new ReliefMap(size, roughness)
    world.reliefMap = reliefMap
    window.currentWorld = world
    console.log(`buildWorld(${world.name}, ${world.seed} ${config})`);

    return world
}

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
