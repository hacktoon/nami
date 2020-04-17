# NAMI: World Generator


## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP


### Model

#### RegionMap
- Use FloodFill to discover region borders
- Make FloodFill a composable function
  - create rules and call `floodFill(rules)`

#### TectonicsMap
- Build regions adjacency table
- Start geologic deformation in plate borders
- For each point, draw a (asc|desc)ending height line opposed to the plate direction
  - Line size is defined by plate speed
- Height deformation line is defined by a list of constants
  - Ex: convergent subduction starts on lowest water level and rises [0, 1, 2, 3]

#### TerrainMap
- Build distance map from coast borders

#### LandMap
- Use ScanlineFill to discover areas
- Set id's on Grid during scanline fill

#### WaterMap
- Decide it's type when finished, set type on object WaterBody
- Types: 0:none, 1:river, 2:lake, 3:sea, 5:ocean
  - WaterBody
    - Reference point - where fill started, used to scanline again for searches

#### Other
- Vegetation/wildlife density: adjusted by humidity, temperature and height
- Cities
  - Use disc point allocation on grid
- Roads
  - create junction points between route ends


### Interface
- Optimize canvas rendering
  - Use offscreen canvas when `map.size <  screen.size`
  - Add tool to live-test drawing functions on console
- Build Menu component using model metadata
  - Maps class attribute to a Field, setup the event handlers
  - Inherit from Model abstract class
    - Method `Model.metadata()`
