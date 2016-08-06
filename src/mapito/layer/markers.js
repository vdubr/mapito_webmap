goog.provide('mapito.layer.MARKERSOptions');
goog.provide('mapito.layer.markers');

goog.require('goog.Promise');
goog.require('goog.net.XhrIo');
goog.require('ol.Feature');
goog.require('ol.geom.Point');
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
mapito.layer.MARKERSOptions;


/**
 * @param {Object} marker
 * @param {?ol.proj.ProjectionLike} sourceProjection
 * @param {?ol.proj.ProjectionLike} destinationProjection
 * @return {ol.Feature}
 * @private
 */
mapito.layer.markers.readMarker_ = function(marker, sourceProjection,
    destinationProjection) {
  var feature = new ol.Feature();
  var geometry = new ol.geom.Point([marker['x'], marker['y']]);
  if (sourceProjection && destinationProjection) {
    geometry = geometry.transform(sourceProjection, destinationProjection);
  }
  feature.setGeometry(geometry);
  feature.setProperties(marker['properties']);
  return feature;
};


/**
 * @param {Array.<Object>} markers
 * @param {?ol.proj.ProjectionLike} sourceProjection
 * @param {?ol.proj.ProjectionLike} destinationProjection
 * @return {Array.<ol.Feature>}
 * @private
 */
mapito.layer.markers.readMarkers_ = function(markers, sourceProjection,
    destinationProjection) {
  var features = goog.array.map(markers, function(marker) {
    return mapito.layer.markers.readMarker_(marker, sourceProjection,
        destinationProjection);
  }
  );
  return features;
};


/**
 * @param {string} path
 * @param {?ol.proj.ProjectionLike} sourceProjection
 * @param {?ol.proj.ProjectionLike} destinationProjection
 * @return {goog.Promise}
 * @private
 */
mapito.layer.markers.loadMarkers_ = function(path, sourceProjection,
    destinationProjection) {

  var promise = new goog.Promise(function(resolve, reject) {

    var xhr = new goog.net.XhrIo();

    var harvestMarkersResponse = function(evt) {
      var res = evt.target;

      //harvest markers
      var obj = res.getResponseJson();
      if (goog.isDefAndNotNull(obj['markers'])) {
        var features = mapito.layer.markers.readMarkers_(obj['markers'],
            sourceProjection, destinationProjection);
        resolve(features);
      }else {
        reject();
      }



    };

    goog.events.listen(xhr, goog.net.EventType.COMPLETE,
        harvestMarkersResponse);

    xhr.send(path);

  });

  return promise;
};


/**
 * @param {mapito.layer.MARKERSOptions} MARKERSOptions
 * @return {ol.layer.Vector}
 */
mapito.layer.markers.getMARKERSLayer = function(MARKERSOptions) {
  var path = MARKERSOptions['path'];
  var styleId = MARKERSOptions['styleId'];
  var sourceProjection = MARKERSOptions['sourceProjection'];
  var destinationProjection = MARKERSOptions['destinationProjection'];

  //var layerStyle = mapito.style.getStyle();

  var source = new ol.source.Vector({
    projection: destinationProjection ? destinationProjection : undefined
  });


  var layer = new ol.layer.Vector({
    source: source
  });

  mapito.layer.markers.loadMarkers_(path, sourceProjection,
      destinationProjection).then(function(features) {
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
mapito.layer.markers.getStyle = function(styleId, styleOptions) {
  var styleOption = goog.array.filter(styleOptions, function(opt) {
    return opt['id'] === styleId;
  });

  window['console']['log'](styleOption);

};
