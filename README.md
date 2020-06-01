# NAMI: World Generator


## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP

### Model

#### RegionMap
- Build regions adjacency table
- Store borders for each plate neighborhood

#### TectonicsMap
- Convergent
  - OO : Oceanic -><- Oceanic
  - OC : Oceanic -><- Continental
  - CC : Continental -><- Continental

- Divergent
  - OO : Oceanic <--> Oceanic
  - CC : Continental <--> Continental

- create ridges separately in tectonics map, using total and start point of border points
- Iterate over region growth borders to distribute hills, cenotes, ravines, lakes, etc
- First 2-3 layers are always land (cratons)

#### TerrainMap
- Build vector map
  - Align subregions points to other regions plates that collide
- Build distance map from coast borders
- Property (water: bool)
- Use ScanlineFill to discover areas
- Set id's on Grid during scanline fill

#### (MAYBE) ErosionMap
- Eliminate hard/pointy edges - smooth terrain
- discover river paths
- Start from highest points, flood fill

#### OceanMap
- Decide it's type when finished, set type on object WaterBody
- Types: 0:none, 1:river, 2:lake, 3:sea, 5:ocean
  - WaterBody
    - Reference point - where fill started, used to scanline again for searches

#### TemperatureMap
- Use two opposite points on regionMap
- Value range: -50:50

#### WindMap
- Value range: 0:10, varies according to month

#### RainMap
- Value range: 0:10, varies according to month and windmap

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
