# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP

### Interface
- Rename Diagram to PixelMap
- Introduce a chunk map viewer on sidebar
- Optimize canvas rendering
  - Use offscreen canvas
  - When map fills screen entirely, snap canvas to viewport,
    otherwise translate canvas element
- Solve `[Violation] 'input' handler` message by storing commands


### RiverLayer
  - lakes
  - adjust meander point to the direction of erosion flow
  - Stop flow on first mountain if it has only one mountain neighbor
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

