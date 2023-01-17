import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/point/set'
import { Point } from '/src/lib/point'


export function buildSurveyFlowMap(context) {
    const fillMap = new PointSet()
    const fill = new SurveyFill()
    const origins = context.reliefLayer.landBorders
    fill.start(origins, {...context, fillMap})
    return origins
}


export class SurveyFill extends ConcurrentFill {
    getNeighbors(fill, relSource) {
        return Point.adjacents(relSource)
    }

    canFill(fill, relTarget) {
        const {rect, fillMap, reliefLayer} = fill.context
        const target = rect.wrap(relTarget)
        const relief = reliefLayer.get(target)
        return ! relief.water && ! fillMap.has(target)
    }

    // onInitFill(fill, relTarget, relSource, neighbors) {

    // }

    onFill(fill, relTarget, relSource, neighbors) {
        const {rect, fillMap, riverSources, rainLayer} = fill.context
        const target = rect.wrap(relTarget)
        const rain = rainLayer.get(relTarget)
        for(let neighbor of neighbors) {
            // source direction is == neighbor?
            // break, not a source
        }
        riverSources.add(target)

        fillMap.add(target)
    }
}
