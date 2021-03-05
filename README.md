# NAMI: World Generator


## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP

#### TectonicsMap
- Create RegionMap 1 with plate dimensions
- Create PlateMatrix
  - For each region origin => set noise for each scanline fill
- Create RegionMap 2 with subregion dimensions
- Create Plate for each region 1
- Create Plate index
- Create Plate list
- Create plate adjacency from region map
  - Convergent
    - OO : Island Arc
    - OC : Trench + Orogeny
    - CC : Mountain

  - Divergent
    - OO : Oceanic Ridge
    - CC : Rift

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
- Create Schema inside static method `create` to use data like `region.count`
- Set identity point method for Direction class
- Vegetation/wildlife density: adjusted by humidity, temperature and height
- Roads
  - create junction points between route ends to set midpath detours

### Interface
- Put all form options on sidebar
- Move sidebar to the right
- Optimize canvas rendering
  - Use offscreen canvas when `map.size <  screen.size`
  - Add tool to live-test drawing functions on console
- Add/use URL with parameters
- Store form parameters in localStorage