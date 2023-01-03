# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
- Rename Diagram to PixelMap
- Rename IndexMap to RandomQueue

#### GeologyTileMap
  - ContinentLayer
    - composed by 1 or 2 subcontinents
  - terrain
  - SubContinentLayer
    - if land, connected to another land by bridge
  - Height of terrain often make waterfalls|rapids
  - Add canyons where rivers meet a higher terrain
  - a mountain can be adjacent to sea, make each world tile render itself based on neighbors

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