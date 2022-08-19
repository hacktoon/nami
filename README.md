# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
- Rename Diagram to PixelMap
- Rename IndexMap to RandomQueue

#### TerrainTileMap

  - start from shore and build distance field


#### CivilTileMap
- Determine capitals and villages
- Start a fill to determine realm area
  - define routes

#### Other
- Vegetation/wildlife density: adjusted by humidity, temperature and height
- Roads
  - create junction points between two route points to set midpath detours

### Interface
- Optimize canvas rendering
  - Use offscreen canvas
  - When map fills screen entirely, snap canvas to viewport,
    otherwise translate canvas element
- Solve `[Violation] 'input' handler` message by storing commands