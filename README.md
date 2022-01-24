# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
- Rename Diagram to PixelMap

#### TectonicsTileMap
- passive margins features only at ends  [80 -> 100%: SHALLOW_WATERS ]
- each province uses noise to set land dependent on type of province,
    only on borders and inner regions (not bordered by other provinces)
    - reset boundary name to each plate side on BOUNDARY_TABLE
- Refactor province algorithm
  - Set provinces as in https://en.wikipedia.org/wiki/Geologic_province
    - Set "sea type" to water regions on passive margins and rift seas
    - Define continents on this step
  - deformationMap depends on provinceMap and it levels
  - Redefine HotspotsModel as VolcanismModel
    - Hotspots step should build map of region => hasHotspot or volcanism map
    - Hydrothermal vents on border of rifts
    - Transform peaks to volcanoes, with chance

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