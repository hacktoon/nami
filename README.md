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


### ErosionLayer
  - Mark flow start/end points
    - Use bitmasking to represent erosion path/shape
    - Pseudocode
      - If it receives flow, mark center
      -
  - Add carving where flows meet a higher terrain


### RiverLayer
  - Height of terrain often make waterfalls|rapids
  - River data:
    4 neighbors and its directions
  - get neighbors, follow
  -

### CityMap
- Determine capitals and villages
- Start a fill to determine realm area
  - define routes

### HistoryMap
- Determine capitals and villages
- Start a fill to determine realm area
  - define routes

### Other
- Vegetation/wildlife density: function of rain x temperature
- Roads
  - create junction points between two route points to set midpath detours
