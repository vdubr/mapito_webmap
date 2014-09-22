goog.provide('mapito.layer');

goog.require('mapito.layer.GEOJSONOptions');
goog.require('mapito.layer.GeotifOptions');
goog.require('mapito.layer.MARKERSOptions');
goog.require('mapito.layer.OSMOptions');
goog.require('mapito.layer.TiledOptions');
goog.require('mapito.layer.geojson');
goog.require('mapito.layer.geotif');
goog.require('mapito.layer.localimage');
goog.require('mapito.layer.markers');
goog.require('mapito.layer.osm');
goog.require('mapito.layer.tiled');
goog.require('mapito.layer.wms');


/**
 * @typedef {{
 *            type:mapito.layer.LayerTypes,
 *            specs:{mapito.layer.OSMOptions|mapito.layer.GEOJSONOptions|
 *              mapito.layer.WMSOptions|mapito.layer.TiledOptions|
 *              mapito.layer.GEOTIFOptions|mapito.layer.MARKERSOptions},
 *            config:{mapito.layer.Config}
 *          }}
 */
mapito.layer.LayerOptions;


/**
 * @typedef {{
 *            title: string,
 *            baselayer: boolean,
 *            visible: boolean,
 *            alpha: (number|undefined),
 *            reload: (number|undefined),
 *            tags: (Array.<string>|undefined)
 *          }}
 */
mapito.layer.Config;


/**
 * @param {mapito.layer.LayerOptions} layerOptions
 * @return {ol.layer.Base}
 */
mapito.layer.getLayer = function(layerOptions) {
  //FIXME set default layer properties
  var layerType = layerOptions.type;
  var layerSpecs = layerOptions['specs'];
  var layerConfig = layerOptions['config'];
  var layer;
  switch (layerType) {
    case mapito.layer.LayerTypes.OSM:
      //validate options
      //goog.object.remove(layerOptions, 'type');
      layer = mapito.layer.osm.getOSMLayer(
          /**@type {mapito.layer.OSMOptions}*/(layerSpecs));
      break;
    case mapito.layer.LayerTypes.GEOJSON:
      layer = mapito.layer.geojson.getGEOJSONLayer(
          /**@type {mapito.layer.GEOJSONOptions}*/(layerSpecs));
      break;
    case mapito.layer.LayerTypes.MARKERS:
      layer = mapito.layer.markers.getMARKERSLayer(
          /**@type {mapito.layer.MARKERSOptions}*/(layerSpecs));
      break;
    case mapito.layer.LayerTypes.WMS:
      layer = mapito.layer.wms.getWMSLayer(
          /**@type {mapito.layer.WMSOptions}*/(layerSpecs));
      break;
    case mapito.layer.LayerTypes.TILED:
      layer = mapito.layer.tiled.getTiledLayer(
          /**@type {mapito.layer.TiledOptions}*/(layerSpecs));
      break;
    case mapito.layer.LayerTypes.GEOTIF:
      layer = mapito.layer.geotif.getGeotifLayer(
          /**@type {mapito.layer.GeotifOptions}*/(layerSpecs));
      break;
    case mapito.layer.LayerTypes.LOCALIMAGE:
      layer = mapito.layer.localimage.getLocalimageLayer(
          /**@type {mapito.layer.LocalimageOptions}*/(layerSpecs));
      break;

  }
  /**
  * @type {mapito.layer.LayerConfig}
  * @expose
  */
  var properties = mapito.layer.getDefaultValues(layerConfig);

  layer.setProperties(properties);
  mapito.layer.setValues(layer);

  return layer;
};


/**
 * @param {ol.layer.Base} layer
 */
mapito.layer.setValues = function(layer) {

  if (layer.get('alfa')) {
    mapito.layer.setAlfa(layer);
  }

  if (layer.get('reload')) {
    mapito.layer.setReload(layer);
  }
};


/**
 * @param {ol.layer.Base} layer
 */
mapito.layer.setAlfa = function(layer) {
  window['console']['log']('setAlfa');
};


/**
 * @param {ol.layer.Base} layer
 */
mapito.layer.setReload = function(layer) {
  window['console']['log']('setreload');
};


/**
 * @param {mapito.layer.LayerConfig} layerConfig
 * @return {mapito.layer.Config}
 */
mapito.layer.getDefaultValues = function(layerConfig) {
  var title = goog.isDef(
      layerConfig['title']) ?
      layerConfig['title'] : 'Mapito layer';

  var baselayer = goog.isDef(
      layerConfig['baselayer']) ?
      layerConfig['baselayer'] : false;


  var visible = goog.isDef(
      layerConfig['visible']) ?
      layerConfig['visible'] : true;

  var alpha = goog.isDef(
      layerConfig['alpha']) ?
      layerConfig['alpha'] : undefined;

  var reload = goog.isDef(
      layerConfig['reload']) ?
      layerConfig['reload'] : undefined;

  var tags = goog.isDef(
      layerConfig['tags']) ?
      layerConfig['tags'] : undefined;

  /**
 * @type {mapito.layer.Config}
 */
  var properties = {
    title: title,
    baselayer: baselayer,
    visible: visible,
    alpha: alpha,
    reload: reload,
    tags: tags
  };

  return properties;
};


/**
 * @enum {string}
 */
mapito.layer.LayerTypes = {
  OSM: 'osm',
  GEOJSON: 'geojson',
  WMS: 'wms',
  TILED: 'tiled',
  GEOTIF: 'geotif',
  MARKERS: 'markers',
  LOCALIMAGE: 'localimage'
};
