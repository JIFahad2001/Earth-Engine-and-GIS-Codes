# 🌍 Earth Engine & GIS Portfolio

Welcome to my geospatial analysis and remote sensing repository. This workspace contains Google Earth Engine (GEE) scripts, GIS datasets, and cartographic outputs from my environmental and spatial modeling projects.

---

## 📂 1. Arial Beel Carbon Stock Assessment

### 📖 Project Overview
This directory contains the scripts, spatial layers, and map outputs from a university assignment focused on estimating the **Total Carbon Stock** of the central **Arial Beel** wetland area. 

Using **Google Earth Engine (GEE)** and **QGIS**, spectral indices—including **NDVI** (Normalized Difference Vegetation Index) and **MNDWI** (Modified Normalized Difference Water Index)—were derived alongside 10m Land Use and Land Cover (LULC) classifications to model and map carbon density (Mg/ha) across the study region.

### 🔑 Key Highlights
* **Study Area:** Central Arial Beel (~85.34 km²)
* **Spectral Indices Used:** NDVI, MNDWI
* **Spatial Resolution:** 10 meters
* **Tools & Platforms:** Google Earth Engine (JavaScript API), QGIS

---

### 🗺️ Map Outputs

| Study Area Map | Land Use & Land Cover (LULC) | Total Carbon Stock (Mg/ha) |
| :---: | :---: | :---: |
| ![Study Area Map](./Arial%20Beel%20Carbon%20Stock/Study%20Area%20Map%20(Arial%20Beel).png) | ![LULC Map](./Arial%20Beel%20Carbon%20Stock/Land%20Use%20and%20Land%20Cover.png) | ![Carbon Stock Map](./Arial%20Beel%20Carbon%20Stock/Carbon%20Stock.png) |

*(Note: Full-resolution maps, including alternative study area layouts, are available directly inside the project folder).*

---

### 🗂️ Directory Structure

```text
Arial Beel Carbon Stock/
├── 📜 Codes/
│   └── Carbon Stock.js                                  # Google Earth Engine (GEE) script
│
├── 🗺️ GIS Files/
│   ├── Arial Beel Carbon Stock.qgz                      # Main QGIS Project File
│   ├── Arial Beel 85 km2 4326.(prj, qmd)                # Projection & metadata files
│   ├── ArialBeel85km24326.(cpg, dbf, shp, shx)          # Study area boundary shapefile (EPSG:4326)
│   ├── Core Arial Beel 85.335 km2.(cpg, dbf, prj, shp, shx) # Core boundary shapefile (85.335 km²)
│   ├── Core Arial Beel.(cpg, dbf, prj, qmd, shp, shx)   # Core Arial Beel vector layers
│   ├── Arial Beel Upzillas.gpkg                         # Upazila administrative boundaries
│   ├── Wetlands in Arial Beel Upzillas.gpkg             # Regional wetland features
│   ├── wetlands .gpkg                                   # Supplementary wetland GeoPackage
│   ├── arial_beel.osm                                   # OpenStreetMap baseline data
│   └── Map-of-Arial-Beel-Siddique-2011_W640.jpg         # Reference base map (Siddique, 2011)
│
├── 🛰️ Processed Images/
│   ├── Arial_Beel_LULC_10m.tif                          # 10m Land Use/Land Cover GeoTIFF
│   ├── Arial_Beel_LULC_10m.tif.aux.xml                  # LULC raster auxiliary metadata
│   ├── Arial_Beel_Total_Carbon_Mg_ha_10m.tif            # 10m Carbon Stock density GeoTIFF (Mg/ha)
│   └── Arial_Beel_Total_Carbon_Mg_ha_10m.tif.aux.xml    # Carbon Stock raster auxiliary metadata
│
└── 🖼️ Final Maps/ (Root Directory)
    ├── Carbon Stock.png
    ├── Land Use and Land Cover.png
    ├── Study Area Map (Arial Beel).png
    └── Study Area Map (Arial Beel) Second.png
