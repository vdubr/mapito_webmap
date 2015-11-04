goog.provide('mapito.layer.GEOJSONOptions');
goog.provide('mapito.layer.geojson');

goog.require('goog.Promise');
goog.require('goog.net.XhrIo');
goog.require('ol.format.GeoJSON');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');


/**
 * @typedef {{
 *            path: string,
 *            sourceProjection: ol.proj.ProjectionLike,
 *            destinationProjection: ol.proj.ProjectionLike,
 *            styleId: number
 *           }}
 */
mapito.layer.GEOJSONOptions;


/**
 * @param {string} path
 * @param {ol.proj.ProjectionLike} sourceProjection
 * @param {ol.proj.ProjectionLike} destinationProjection
 * @return {goog.Promise}
 * @private
 */
mapito.layer.geojson.loadGeojson_ = function(path, sourceProjection,
    destinationProjection) {

  var promise = new goog.Promise(function(resolve, reject) {

    var xhr = new goog.net.XhrIo();

    goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(evt) {
      var features = mapito.layer.geojson.onFeaturesLoadEnd_(
          evt.target, sourceProjection, destinationProjection);
      resolve(features);
    });
    xhr.send(path);

  });

  return promise;
};


/**
 * @param {goog.events.EventTarget} respTarget
 * @param {ol.proj.ProjectionLike} sourceProjection
 * @param {ol.proj.ProjectionLike} destinationProjection
 * @return {Array.<ol.Feature>}
 * @private
 */
mapito.layer.geojson.onFeaturesLoadEnd_ = function(
    respTarget, sourceProjection, destinationProjection) {
  var obj = respTarget.getResponseJson();
  var geojsonFormat = new ol.format.GeoJSON();
  //read and transform features
  var options = {
    dataProjection: sourceProjection,
    featureProjection: destinationProjection
  };
  var features = geojsonFormat.readFeatures(obj, options);
  return features;
};


/**
 * @param {mapito.layer.GEOJSONOptions} GEOJSONOptions
 * @return {ol.layer.Vector}
 */
mapito.layer.geojson.getGEOJSONLayer = function(GEOJSONOptions) {
  var source = new ol.source.Vector();

  var layer = new ol.layer.Vector({
    source: source
  });

  return layer;
};


/**
 * @param {ol.layer.Vector} layer
 * @return {goog.Promise}
 */
mapito.layer.geojson.loadLayer = function(layer) {
  var source = layer.getSource();
  var layerSpecs = layer.get('layerSpecs_');
  var sourceProjection = layerSpecs['sourceProjection'];
  var destinationProjection = layerSpecs['destinationProjection'];
  var path = layerSpecs['path'];
  var styleId = layerSpecs['styleId'];

  return mapito.layer.geojson.loadGeojson_(
      path, sourceProjection, destinationProjection).then(function(features) {
    goog.array.forEach(features, function(feature) {
      if (goog.isDefAndNotNull(styleId) && goog.isNumber(styleId) &&
          !feature.get('styleId_')) {
        feature.set('styleId_', styleId);
      }
    });

    source.addFeatures(features);
  });

};
