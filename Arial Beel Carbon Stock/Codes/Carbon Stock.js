// ============================================================================
// ARIAL BEEL CARBON STOCK ESTIMATION (85.335 km2 CORE BASIN)
// ============================================================================

// 1. LOAD YOUR UPLOADED QGIS SHAPEFILE ASSET
// Replace 'YOUR_USERNAME_OR_PROJECT' with your actual GEE asset path:
var aoi_table = ee.FeatureCollection('projects/extreme-casing-358517/assets/ArialBeel85km24326').geometry();
Map.centerObject(aoi_table, 12);

// Verify area in GEE (in km2 and hectares)
var areaHa = aoi_table.area().divide(10000);
var areaKm2 = aoi_table.area().divide(1e6);
print('1. Study Area (km2):', areaKm2);
print('2. Study Area (Hectares):', areaHa);

// 2. CLOUD MASKING & SPECTRAL INDICES FOR SENTINEL-2 (10m)
function maskS2clouds(image) {
  var scl = image.select('SCL');
  var mask = scl.eq(4).or(scl.eq(5)).or(scl.eq(6)).or(scl.eq(7));
  return image.updateMask(mask).divide(10000);
}

function addIndices(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  var mndwi = image.normalizedDifference(['B3', 'B11']).rename('MNDWI');
  var bsi = image.expression(
    '((B11 + B4) - (B8 + B2)) / ((B11 + B4) + (B8 + B2))', {
      'B11': image.select('B11'), 'B4': image.select('B4'),
      'B8': image.select('B8'), 'B2': image.select('B2')
    }).rename('BSI');
  return image.addBands([ndvi, mndwi, bsi]);
}

// 3. BUILD BI-SEASONAL COMPOSITES (DRY SEASON vs. MONSOON)
var s2Dry = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi_table)
  .filterDate('2025-01-01', '2025-03-25')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskS2clouds)
  .map(addIndices)
  .median()
  .clip(aoi_table);

var s2Wet = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi_table)
  .filterDate('2025-07-15', '2025-10-15')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 35))
  .map(maskS2clouds)
  .map(addIndices)
  .median()
  .clip(aoi_table);

// Extract key seasonal indicators
var ndviDry = s2Dry.select('NDVI');
var mndwiDry = s2Dry.select('MNDWI');
var mndwiWet = s2Wet.select('MNDWI');
var bsiDry = s2Dry.select('BSI');

// 4. RULE-BASED PHENOLOGICAL LULC STRATIFICATION (10m Resolution)
// Class 1: Perennial Waterbody (Wet in both Dry & Monsoon seasons)
// Class 2: Emergent Macrophytes / Marshland (Wet/moist & high vegetation in transition)
// Class 3: Seasonal Cropland - Boro Rice/Winter Crops (Flooded in Monsoon, high NDVI in Dry)
// Class 4: Homestead Forest / Kanda Trees (High NDVI year-round, never deeply flooded)
// Class 5: Mudflats / Fallow / Built-up Margin (Low NDVI, high BSI in Dry)

var lulc = ee.Image(3) // Default: Class 3 (Seasonal Cropland / Floodplain)
  .where(bsiDry.gt(0.05).and(ndviDry.lt(0.25)), 5) // Class 5: Mudflats / Fallow
  .where(mndwiWet.gt(0.0).and(mndwiDry.gt(-0.15)).and(ndviDry.gt(0.30)), 2) // Class 2: Marsh / Macrophytes
  .where(mndwiWet.lt(0.0).and(ndviDry.gt(0.45)), 4) // Class 4: Homestead Trees / Kanda
  .where(mndwiDry.gt(0.05), 1) // Class 1: Perennial Waterbodies
  .clip(aoi_table)
  .rename('LULC');

var lulcPalette = ['#08519c', '#2ca25f', '#a1d99b', '#005a32', '#d95f0e'];
Map.addLayer(lulc, {min: 1, max: 5, palette: lulcPalette}, '1. Arial Beel Wetland Strata (10m)');

// 5. MAP CARBON POOLS PER PIXEL (Units: Mg C / ha)
// Pool A: Aboveground Biomass Carbon (C_AGB)
var c_agb = lulc.remap([1, 2, 3, 4, 5], [1.5, 8.5, 4.2, 45.0, 1.0]).rename('C_AGB');

// Pool B: Belowground Biomass Carbon (C_BGB)
var c_bgb = lulc.remap([1, 2, 3, 4, 5], [0.5, 3.4, 1.1, 11.7, 0.2]).rename('C_BGB');

// Pool C: Soil Organic Carbon (C_SOC, 0-30 cm depth)
var c_soc = lulc.remap([1, 2, 3, 4, 5], [85.0, 110.0, 68.0, 62.0, 50.0]).rename('C_SOC');

// Pool D: Dead Organic Matter Carbon (C_Dead)
var c_dead = lulc.remap([1, 2, 3, 4, 5], [0.0, 1.2, 0.5, 2.3, 0.0]).rename('C_Dead');

// Total Carbon Density (Mg C / ha)
var totalCarbonDensity = c_agb.add(c_bgb).add(c_soc).add(c_dead).rename('Total_C_Mg_ha');

Map.addLayer(totalCarbonDensity, {
  min: 50, max: 125,
  palette: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494']
}, '2. Total Carbon Density (Mg C/ha)');

// 6. CONVERT DENSITY (Mg C/ha) TO ACTUAL MASS PER PIXEL (Mg C / pixel)
// Using pixelArea() in m2 divided by 10,000 m2/ha ensures exact aerial integration
var pixelAreaHa = ee.Image.pixelArea().divide(10000);
var totalCarbonMassPerPixel = totalCarbonDensity.multiply(pixelAreaHa).rename('Total_Carbon_Mg');

// 7. SUM TOTAL CARBON STOCK ACROSS YOUR 85.335 km2 POLYGON
var stats = totalCarbonMassPerPixel.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoi_table,
  scale: 10,
  maxPixels: 1e10
});

var totalMgC = ee.Number(stats.get('Total_Carbon_Mg'));
var totalCO2e = totalMgC.multiply(44).divide(12); // Convert C to CO2 equivalent

print('3. Total Carbon Stock (Mg C / Metric Tons):', totalMgC);
print('4. Total CO2 Equivalent (tCO2e):', totalCO2e);

// 8. EXPORT RASTERS TO GOOGLE DRIVE FOR FINAL MAPPING IN QGIS
Export.image.toDrive({
  image: totalCarbonDensity.toFloat(),
  description: 'Arial_Beel_Total_Carbon_Mg_ha_10m',
  folder: 'GEE_Arial_Beel',
  region: aoi_table,
  scale: 10,
  crs: 'EPSG:32646',
  maxPixels: 1e10
});

Export.image.toDrive({
  image: lulc.toByte(),
  description: 'Arial_Beel_LULC_10m',
  folder: 'GEE_Arial_Beel',
  region: aoi_table,
  scale: 10,
  crs: 'EPSG:32646',
  maxPixels: 1e10
});
// ============================================================================
// 8. CALCULATE AREA (HA) & CARBON STOCK (Mg C) PER LULC CLASS FOR REPORT TABLE
// ============================================================================
var areaAndCarbonImage = pixelAreaHa.rename('Area_Ha')
  .addBands(totalCarbonMassPerPixel.rename('Carbon_Mg'))
  .addBands(lulc.rename('Class'));

var classStats = areaAndCarbonImage.reduceRegion({
  reducer: ee.Reducer.sum().repeat(2).group({
    groupField: 2,
    groupName: 'LULC_Class'
  }),
  geometry: aoi_table,
  scale: 10,
  maxPixels: 1e10
});

print('5. Breakdown by LULC Class (1=Water, 2=Marsh, 3=Cropland, 4=Trees, 5=Mudflat):', classStats);