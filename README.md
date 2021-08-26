# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)

## NOTES
- RegionGroupTileMap may not be necessary
  - Unify into region map layers
  - base layer: regions
  - next layers: group1, group2, etc

## ROADMAP
#### GeologyTileMap
- Mark slope type (water)
- pointy tiles may turn into river deltas
- Fix depression - water border
- Set hotspots on landformMatrix after basins
- Add features to border/color properties of landforms
  - i.e. volcanoes to peaks, with chance
  - hydrothermal vents on border of rifts

- Build heightMatrix or landformMatrix?


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