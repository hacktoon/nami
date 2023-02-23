# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## PLANNING

### General
- Rename Diagram to PixelMap
- Introduce a chunk map viewer on sidebar
- Optimize canvas rendering
  - Use offscreen canvas
  - When map fills screen entirely, snap canvas to viewport,
    otherwise translate canvas element
- Solve `[Violation] 'input' handler` message by storing commands

- Matrix/Grid
  - Convert to single array
  - Rename PointSet to GridPointSet to abstract Rect in adjancents
  - [x, y] -> idx
  - create a wrappedAdjacents similar to
      Point.adjacents(parentPoint)
    that receives a rect


### WorldTileMap
  - Create ContinentLayer (maybe)
    - Use 32x32 tilemap with regionMap borders for separating landmasses
    - border points get a grained island noise

### HydrologyLayer
  - River that start on small seas can't go much further
  - Height of terrain often make waterfalls or rapids

### BiomeLayer
- Snow Mountain biome?

### TopologyLayer
- Determine capitals and villages
- Start a fill to determine realm area

### RoadLayer
  - connect sites inside a radius
  - create junction points between two route points to set midpath detours
    - follow road and calc nearest junction start


### HistoryMap
- Determine capitals and villages
- Start a fill to determine realm area


## INSPIRATIONS
- https://twitter.com/datassette/status/1624394179185938432

