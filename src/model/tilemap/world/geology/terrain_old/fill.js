import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/point/set'


// class TerrainFloodFill extends ConcurrentFillUnit {
//     setValue(ref, point, level) {
//         const wrappedPoint = ref.context.rect.wrap(point)
//         ref.context.basinMap.set(...wrappedPoint, ref.id)
//     }

//     isEmpty(ref, sidePoint) {

//     }

//     isPhaseEmpty(ref, sidePoint) {
//         return this.isEmpty(ref, sidePoint)
//     }

//     getNeighbors(ref, originPoint) {
//         return Point.adjacents(originPoint)
//     }

//     checkNeighbor(ref, sidePoint, centerPoint) {

//     }

// }


// class ErosionConcurrentFill extends ConcurrentFill {
//     constructor(origins, context, phases) {
//         super(origins, TerrainFloodFill, context, phases)
//     }

//     getChance(ref, origin) { return .2 }
//     getGrowth(ref, origin) { return 3 }
// }