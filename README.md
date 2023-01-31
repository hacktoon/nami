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
  - adjust meander point to the direction of erosion flow
  - Stop flow on first mountain if it has only one mountain neighbor
  - Height of terrain often make waterfalls or rapids

### BiomeLayer
- Vegetation/wildlife density: function of rain x temperature

### CityMap
- Determine capitals and villages
- Start a fill to determine realm area
  - define routes

### HistoryMap
- Determine capitals and villages
- Start a fill to determine realm area
  - define routes

### RoadLayer
  - create junction points between two route points to set midpath detours
