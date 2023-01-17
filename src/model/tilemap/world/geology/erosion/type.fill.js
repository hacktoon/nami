import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'


export function buildTypeMap(context) {
    const fill = new TypeFill()
    const origins = context.reliefLayer.landBorders
    fill.start(origins, context)
    return origins
}


export class TypeFill extends ConcurrentFill {
    getNeighbors(fill, relSource) {
        return Point.adjacents(relSource)
    }

    canFill(fill, relTarget, relSource) {
        const {rect, typeMap, reliefLayer} = fill.context
        const target = rect.wrap(relTarget)
        const relief = reliefLayer.get(target)
        return ! relief.water && ! typeMap.has(target)
    }

    onFill(fill, relTarget, relSource) {
        const {rect, typeMap} = fill.context
        const target = rect.wrap(relTarget)
        typeMap.set(target, 1)
    }
}
