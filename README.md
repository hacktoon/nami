# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
- Rename Diagram to PixelMap

#### TectonicsTileMap
- CONTINENTS
  - put islands on ocean-ocean borders
  - isolated continent: surrounded by water on all provinces

- PROVINCES
  - make type: continental shelf for submerged provinces
  - each province may be a basin, uplift?
  - central province may be a plateau, sea or hills
  - Use as inspiration: https://en.wikipedia.org/wiki/Geologic_province

- FEATURES
  - start concurrent fill for each border point inside and outside of features
  - set feature's noise for each fill level from center

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