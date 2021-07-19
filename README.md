# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
#### GeologyTileMap
- Deform is applied with a sequence of geology types
  (peaks 10% -> mountains 10% -> none 10% -> plateaus)
  (peaks 0% -> mountains 40% -> none 10% -> plateaus)
- Define heights
  - trench, high sea, continental platform
  - plains, plateaus, mountains, peaks
- Discover river paths
  - Start from river mouth points, flood fill

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