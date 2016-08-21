goog.provide('mapito.layer');
goog.provide('mapito.layer.Events');
goog.provide('mapito.layer.LayerOptions');
goog.provide('mapito.layer.LayerTypes');

goog.require('goog.object');
goog.require('mapito.layer.GEOJSONOptions');
goog.require('mapito.layer.GeotifOptions');
goog.require('mapito.layer.MARKERSOptions');
goog.require('mapito.layer.OSMOptions');
goog.require('mapito.layer.TOPOJSONOptions');
goog.require('mapito.layer.TiledOptions');
goog.require('mapito.layer.geojson');
goog.require('mapito.layer.geotif');
goog.require('mapito.layer.localimage');
goog.require('mapito.layer.markers');
goog.require('mapito.layer.osm');
goog.require('mapito.layer.tiled');
goog.require('mapito.layer.topojson');
goog.require('mapito.layer.wms');


/**
 * @enum {string}
 * @api stable
 */
mapito.layer.Events = {
  FEATURECLICK: 'feature:click',
  LAYERLOADEND: 'layer:loadEnd'
};


/**
 * @api stable
 * @typedef {{
 *            type:mapito.layer.LayerTypes,
 *            specs:(mapito.layer.OSMOptions|mapito.layer.GEOJSONOptions|
 *              mapito.layer.WMSOptions|mapito.layer.TiledOptions|
 *              mapito.layer.GeotifOptions|mapito.layer.MARKERSOptions|
 *              mapito.layer.TOPOJSONOptions),
 *            config:mapito.layer.LayerConfig
 *          }}
 */
mapito.layer.LayerOptions;


/**
 * @api stable
 * @typedef {{
 *            title: (string|undefined),
 *            baselayer: (boolean|undefined),
 *            visible: (boolean|undefined),
 *            reload: (number|undefined),
 *            tags: (Array.<string>|undefined),
 *            events: (Array.<mapito.layer.Events>|undefined),
 *            id: (number|string|undefined)
 *          }}
 */
mapito.layer.LayerConfig;


/**
 * @enum {string}
 * @api stable
 */
mapito.layer.ConfigEnum = {
  TITILE: 'title',
  BASELAYER: 'baselayer',
  VISIBLE: 'visible',
  RELOAD: 'reload',
  TAGS: 'tags',
  EVENTED: 'events',
  ID: 'id'
};


/**
 * @param {mapito.layer.LayerOptions} layerOptions
 * @return {ol.layer.Layer|undefined}
 * @api stable
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
    case mapito.layer.LayerTypes.TOPOJSON:
      layer = mapito.layer.topojson.getTOPOJSONLayer(
          /**@type {mapito.layer.TOPOJSONOptions}*/(layerSpecs));
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


  if (layer) {
    /**
    * @type {mapito.layer.LayerConfig}
    */
    var properties = mapito.layer.getDefaultValues(layerConfig);

    layer.setProperties(properties);
    layer.set('layerType_', layerType);
    layer.set('layerSpecs_', layerSpecs);

    mapito.layer.setValues(layer);

    return layer;
  }else {
    window['console']['log']('layer is not defined for config: ', layerConfig);
    return undefined;
  }
};


/**
 * Get extent of features included in vector layer
 * @param {ol.layer.Vector} layer
 * @return {?ol.Extent}
 * @api stable
 */
mapito.layer.getVectorExtent = function(layer) {
  if (layer instanceof ol.layer.Vector) {
    return layer.getSource().getExtent();
  } else {
    return null;
  }
};


/**
 * @param {ol.layer.Base} layer
 * @return {mapito.layer.LayerConfig}
 * @api stable
 */
mapito.layer.getLayerConfig = function(layer) {

  var layerConfig = {};
  var value, keyVal;
  goog.object.forEach(mapito.layer.ConfigEnum, function(keyVal) {
    value = layer.get(keyVal);
    layerConfig[keyVal] = value;
  });

  return layerConfig;
};


/**
 * @param {ol.layer.Layer} layer
 * @api stable
 */
mapito.layer.setValues = function(layer) {

  if (layer.get('reload')) {
    mapito.layer.setReload(layer);
  }
};


/**
 * @param {ol.layer.Layer} layer
 */
mapito.layer.setReload = function(layer) {
  window['console']['log']('setreload');
};


/**
 * @param {mapito.layer.LayerConfig} layerConfig
 * @return {mapito.layer.LayerConfig}
 * @api stable
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

  var reload = goog.isDef(
      layerConfig['reload']) ?
      layerConfig['reload'] : undefined;

  var tags = goog.isDef(
      layerConfig['tags']) ?
      layerConfig['tags'] : undefined;

  var events = goog.isDef(
      layerConfig['events']) ?
      layerConfig['events'] : undefined;

  var id = goog.isDef(
      layerConfig['id']) ?
      layerConfig['id'] : goog.getUid(layerConfig).toString();

  /**
   * @type {mapito.layer.LayerConfig}
   */
  var properties = {
    title: title,
    baselayer: baselayer,
    visible: visible,
    reload: reload,
    tags: tags,
    'events': events,
    id: id
  };

  return properties;
};


/**
 * @param {Array.<mapito.layer.Events>} events
 * @return {Array.<ol.interaction.Interaction>}
 */


/**
 * @enum {string}
 * @api stable
 */
mapito.layer.LayerTypes = {
  OSM: 'osm',
  GEOJSON: 'geojson',
  TOPOJSON: 'topojson',
  WMS: 'wms',
  TILED: 'tiled',
  GEOTIF: 'geotif',
  MARKERS: 'markers',
  LOCALIMAGE: 'localimage'
};

goog.exportSymbol('mapito.layer.getVectorExtent', mapito.layer.getVectorExtent);
