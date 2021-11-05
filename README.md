# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
#### TectonicsTileMap
- Refactor province algorithm
  - Separate boundaryModel from province, use it as a graph to get province key
  - Define province id by regionId => boundary key
  - Cordilleras start at plain and grow outwards to other plates
      - the trench side will grow to deep ocean
  - Continental collision start as peak and grow downwards
  - deformationMap depends on provinceMap and it levels
  - Set provinces as in https://en.wikipedia.org/wiki/Geologic_province
  - Redefine HotspotsModel as VolcanismModel
    - Hotspots step should build map of region => hasHotspot or vulcanism map
    - Hydrothermal vents on border of rifts
    - Transform peaks to volcanoes, with chance
- Fix depression/water border

#### TerrainTileMap
- Recreate erosion algorithm using regions
- Add islets (same neighbors)

#### ClimateTileMap
- Start with each row in righ colum of regions of regionTileMap
- Go left following the direction of winds based on termic zone
- Add shadow rain

#### RiverTileMap
- Start from river mouths and depression lakes and fill uphill
  - Should stop when meeting other fills

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