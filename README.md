# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
#### GeologyTileMap
- Refactor boundary algorithm
  [] Use boundary stress to build landforms after
  [] Remove Landform class, use ids
  [] Remove Boundary class, use ids
  [] Boundary table must define its own data instead of using landform
- Restart erosion algorithm using regions
- Add islets again
- Fix depression/water border
- Add features to border/color properties of landforms
  - i.e. volcanoes to peaks, with chance
  - hydrothermal vents on border of rifts

#### ClimateTileMap
- Start with each row in righ colum of regions of regionTileMap
- Go left following the direction of winds based on termic zone
- Add shadow rain

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