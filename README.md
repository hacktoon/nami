# NAMI: World Generator


## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP

#### RegionMap
- Regions adjacency table

#### TectonicsMap
- Noise in non-wrapping space for plates
- Create region distance field using flood fill in border points
- Use RegionMap again to get sub regions (+ granularity)
- Create Plate register with adjacency table from region map
- Convergent
  - OO : Island Arc
  - OC : Trench + Orogeny
  - CC : Mountain

- Divergent
  - OO : Oceanic Ridge
  - CC : Rift

#### ContinentMap
- Create Continent

#### BasinMap
- determine rivers using graph

#### TerrainMap
- Build distance map from coast borders
- Property (water: bool)
- Use ScanlineFill to discover areas
- Set id's on Matrix during scanline fill

#### (MAYBE) ErosionMap
- Eliminate hard/pointy edges - smooth terrain
- discover river paths
  - Start from river mouth points, flood fill

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
- Organize model folder structure under `map/`
- Set identity point method for Direction class
- Vegetation/wildlife density: adjusted by humidity, temperature and height
- Roads
  - create junction points between route ends

### Interface
- Put all form options on sidebar
- Move sidebar to the right
- Optimize canvas rendering
  - Use offscreen canvas when `map.size <  screen.size`
  - Add tool to live-test drawing functions on console
- Add/use URL with parameters
- Store parameters in localStorage