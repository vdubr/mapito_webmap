goog.provide('mapito.layer.GEOJSONOptions');
goog.provide('mapito.layer.geojson');

goog.require('goog.Promise');
goog.require('goog.net.XhrIo');
goog.require('mapito.style.StyleOptions');
goog.require('ol.format.GeoJSON');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');


/**
 * @typedef {{
 *            path: string,
 *            projection: string,
 *            styleId: number
 *           }}
 */
mapito.layer.GEOJSONOptions;


/**
 * @param {string} path
 * @return {goog.Promise}
 * @private
 */
mapito.layer.geojson.loadGeojson_ = function(path) {

  var promise = new goog.Promise(function(resolve, reject) {

    var xhr = new goog.net.XhrIo();

    var harvestGeojsonResponse = function(evt) {
      var res = evt.target;
      var obj = res.getResponseJson();
      var geojsonFormat = new ol.format.GeoJSON();
      var features = geojsonFormat.readFeaturesFromObject(obj);
      resolve(features);
    };

    goog.events.listen(xhr, goog.net.EventType.COMPLETE,
        harvestGeojsonResponse);
    xhr.send(path);

  });

  return promise;
};


/**
 * @param {mapito.layer.GEOJSONOptions} GEOJSONOptions
 * @return {ol.layer.Vector}
 */
mapito.layer.geojson.getGEOJSONLayer = function(GEOJSONOptions) {
  var path = GEOJSONOptions['path'];
  var styleId = GEOJSONOptions['styleId'];
  var projection = GEOJSONOptions['projection'];
  //var layerStyle = mapito.style.getStyle();

  var source = new ol.source.Vector({
    projection: ol.proj.get(projection)
  });

  var layer = new ol.layer.Vector({
    source: source
  });

  mapito.layer.geojson.loadGeojson_(path).then(function(features) {
    goog.array.forEach(features, function(feature) {
      if (goog.isDefAndNotNull(styleId) && goog.isNumber(styleId) &&
          !feature.get('styleId_')) {
        feature.set('styleId_', styleId);
        //  feature.setStyle(style);
      }
    });

    source.addFeatures(features);
  });

  return layer;
};


/**
 * @param {number} styleId
 * @param {Array.<mapito.style.StyleOptions>} styleOptions
 */
mapito.layer.geojson.getStyle = function(styleId, styleOptions) {
  var styleOption = goog.array.filter(styleOptions, function(opt) {
    return opt['id'] === styleId;
  });

  window['console']['log'](styleOption);

};
