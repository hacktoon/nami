# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
#### GeologyTileMap
- add features to border/color properties of landforms
  - i.e. volcanoes to peaks, with chance
  - hydrothermal vents on border of rifts
- erosion
  - pick origin points of each region, in order of landform height
    peak -> mountain -> hill -> plain -> shallow -> deep
  - save points in a array for each landform
    - apply neighbor rules

- avoid a plate having repeated boundary types
  - pick another (try rotating boundary types)
- build heightMatrix


#### ClimateTileMap
- Start with each row in righ colum of regions of TemperatureTileMap
- Go left/right as following the direction of winds based on termic zone
- Shadow rain: if wind meets high land, build rain

#### CivilTileMap
- Generate large point distribution
- Select those next to rivers, sea and resourceful regions, but not above
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