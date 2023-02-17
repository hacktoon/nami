# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP

### Inspirations
- https://twitter.com/datassette/status/1624394179185938432

### Interface
- Rename Diagram to PixelMap
- Introduce a chunk map viewer on sidebar
- Optimize canvas rendering
  - Use offscreen canvas
  - When map fills screen entirely, snap canvas to viewport,
    otherwise translate canvas element
- Solve `[Violation] 'input' handler` message by storing commands

### WorldTileMap
  - Use 64x64


### Matrix/Grid
  - Convert to single array
  - Rename PointSet to GridPointSet to abstract Rect in adjancents
  - [x, y] -> idx
  - create a wrappedAdjacents similar to
      Point.adjacents(parentPoint)
    that receives a rect



### HydroLayer
  - Height of terrain often make waterfalls or rapids

### BiomeLayer
- Snow Mountain biome?

### SiteLayer
- Determine capitals and villages
- Start a fill to determine realm area

### RoadLayer
  - connect sites inside a radius
  - create junction points between two route points to set midpath detours
    - follow road and calc nearest junction start


### HistoryMap
- Determine capitals and villages
- Start a fill to determine realm area

