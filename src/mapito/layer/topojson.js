goog.provide('mapito.layer.TOPOJSONOptions');
goog.provide('mapito.layer.topojson');

goog.require('goog.Promise');
goog.require('goog.net.XhrIo');
goog.require('ol.format.TopoJSON');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');


/**
 * @typedef {{
 *            path: string,
 *            sourceProjection: ol.ProjectionLike,
 *            destinationProjection: ol.ProjectionLike,
 *            styleId: number
 *           }}
 */
mapito.layer.TOPOJSONOptions;


/**
 * @param {string} path
 * @param {ol.ProjectionLike} sourceProjection
 * @param {ol.ProjectionLike} destinationProjection
 * @return {goog.Promise}
 * @private
 */
mapito.layer.topojson.loadJSON_ = function(path, sourceProjection,
    destinationProjection) {

  var promise = new goog.Promise(function(resolve, reject) {

    var xhr = new goog.net.XhrIo();

    goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(evt) {
      var features = mapito.layer.topojson.onFeaturesLoadEnd_(
          evt.target, sourceProjection, destinationProjection);
      resolve(features);
    });
    xhr.send(path);

  });

  return promise;
};


/**
 * @param {goog.events.EventTarget} respTarget
 * @param {ol.ProjectionLike} sourceProjection
 * @param {ol.ProjectionLike} destinationProjection
 * @return {Array.<ol.Feature>}
 * @private
 */
mapito.layer.topojson.onFeaturesLoadEnd_ = function(
    respTarget, sourceProjection, destinationProjection) {
  var obj = respTarget.getResponseJson();
  var topoJSONFormat = new ol.format.TopoJSON();
  //read and transform features
  var options = {
    dataProjection: sourceProjection,
    featureProjection: destinationProjection
  };
  var features = topoJSONFormat.readFeatures(obj, options);
  return features;
};


/**
 * @param {mapito.layer.TOPOJSONOptions} TOPOJSONOptions
 * @return {ol.layer.Vector}
 */
mapito.layer.topojson.getTOPOJSONLayer = function(TOPOJSONOptions) {
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
mapito.layer.topojson.loadLayer = function(layer) {
  var source = layer.getSource();
  var layerSpecs = layer.get('layerSpecs_');
  var sourceProjection = layerSpecs['sourceProjection'];
  var destinationProjection = layerSpecs['destinationProjection'];
  var path = layerSpecs['path'];
  var styleId = layerSpecs['styleId'];

  return mapito.layer.topojson.loadJSON_(
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
