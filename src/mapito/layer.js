goog.provide('mapito.layer');
goog.provide('mapito.layer.Events');
goog.provide('mapito.layer.LayerOptions');

goog.require('goog.array');
goog.require('goog.object');
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
goog.require('ol.events.condition');
goog.require('ol.interaction.Select');


/**
 * @enum {string}
 */
mapito.layer.Events = {
  FEATURECLICK: 'feature:click',
  LAYERLOADEND: 'layer:loadEnd'
};


/**
 * @typedef {{
 *            type:mapito.layer.LayerTypes,
 *            specs:(mapito.layer.OSMOptions|mapito.layer.GEOJSONOptions|
 *              mapito.layer.WMSOptions|mapito.layer.TiledOptions|
 *              mapito.layer.GeotifOptions|mapito.layer.MARKERSOptions),
 *            config:mapito.layer.LayerConfig
 *          }}
 */
mapito.layer.LayerOptions;


/**
 * @typedef {{
 *            title: (string|undefined),
 *            baselayer: (boolean|undefined),
 *            visible: (boolean|undefined),
 *            alpha: (number|undefined),
 *            reload: (number|undefined),
 *            tags: (Array.<string>|undefined),
 *            events: (Array.<mapito.layer.Events>|undefined),
 *            id: (number|string|undefined)
 *          }}
 */
mapito.layer.LayerConfig;


/**
 * @enum {string}
 */
mapito.layer.ConfigEnum = {
  TITILE: 'title',
  BASELAYER: 'baselayer',
  VISIBLE: 'visible',
  ALPHA: 'alpha',
  RELOAD: 'reload',
  TAGS: 'tags',
  EVENTED: 'events',
  ID: 'id'
};


/**
 * @param {mapito.layer.LayerOptions} layerOptions
 * @return {ol.layer.Layer}
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
  */
  var properties = mapito.layer.getDefaultValues(layerConfig);

  layer.setProperties(properties);
  layer.set('layerType_', layerType);
  layer.set('layerSpecs_', layerSpecs);

  mapito.layer.setValues(layer);

  return layer;
};


/**
 * @param {ol.layer.Base} layer
 * @return {mapito.layer.LayerConfig}
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
 * @param {ol.layer.Layer} layer
 */
mapito.layer.setAlfa = function(layer) {
  window['console']['log']('setAlfa');
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
    alpha: alpha,
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
mapito.layer.getLayerInteractions = function(events) {
  var interactions = [];
  var interaction;
  goog.array.forEach(events, function(event) {
    switch (event) {
      case mapito.layer.Events.FEATURECLICK:
        interaction = new ol.interaction.Select({
          condition: ol.events.condition.click
        });
        break;
    }
    if (interaction) {
      interaction.set('eventType', mapito.layer.Events.FEATURECLICK);
      interactions.push(interaction);
    }
  });


  return interactions;
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
