# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
- Rename Diagram to PixelMap
- Rename IndexMap to RandomQueue

#### GeologyTileMap
  - rivers from plains to basins often make rapids
  - rivers from plateaus to plains often make waterfalls
  - add canyons where rivers meet a higher terrain

#### CivilTileMap
- Determine capitals and villages
- Start a fill to determine realm area
  - define routes

#### HistoryMap
- Determine capitals and villages
- Start a fill to determine realm area
  - define routes

#### Other
- Vegetation/wildlife density: function of rain x temperature
- Roads
  - create junction points between two route points to set midpath detours

### Interface
- Optimize canvas rendering
  - Use offscreen canvas
  - When map fills screen entirely, snap canvas to viewport,
    otherwise translate canvas element
- Solve `[Violation] 'input' handler` message by storing commands