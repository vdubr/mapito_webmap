goog.provide('mapito.layerEvents');
goog.provide('mapito.mapEvents');

goog.require('goog.array');
goog.require('mapito.layer.Events');
goog.require('mapito.map.Events');
goog.require('ol.Map');


/**
 * @param {mapito.map.Events} eventType
 * @param {ol.Map} map
 * @param {function(Object)} callback
 * @param {Object=} opt_this The object to use as `this` in `listener`.
 * @return {function(?)|undefined}
 */
mapito.mapEvents.getHandler = function(eventType, map, callback, opt_this) {
  var handler;

  switch (eventType) {
    case mapito.map.Events.MAPCLICK:
      handler = mapito.mapEvents.mapClickHandler(
          eventType, map, callback, opt_this);
      break;
  }

  return handler;
};


/**
 * @param {mapito.map.Events} eventType
 * @param {ol.Map} map
 * @param {function(Object)} callback
 * @param {Object=} opt_this The object to use as `this` in `listener`.
 * @return {function(?): ?}
 */
mapito.mapEvents.mapClickHandler = function(
    eventType, map, callback, opt_this) {
  /**
     * @param {?} evt
     */
  var handler = function(evt) {
    var event = {
      'eventType': mapito.map.Events.MAPCLICK,
      'target': evt
    };
    callback.call(opt_this, event);

  };

  return handler;
};


/**
 * @param {mapito.layer.Events} eventType
 * @param {ol.Map} map
 * @param {function(Object)} callback
 * @param {Object=} opt_this The object to use as `this` in `listener`.
 * @param {ol.layer.Base=} opt_layer
 * @return {function(?)|undefined}
 */
mapito.layerEvents.getHandler = function(
    eventType, map, callback, opt_this, opt_layer) {
  var handler;

  switch (eventType) {
    case mapito.layer.Events.FEATURECLICK:
      handler = mapito.layerEvents.featureClickHandler(
          eventType, map, callback, opt_this, opt_layer);
      break;
  }

  return handler;
};


/**
 * @param {mapito.layer.Events} eventType
 * @param {ol.Map} map
 * @param {function(Object)} callback
 * @param {Object=} opt_this The object to use as `this` in `listener`.
 * @param {ol.layer.Base=} opt_layer Parent layer
 * @return {function(?): ?}
 */
mapito.layerEvents.featureClickHandler = function(
    eventType, map, callback, opt_this, opt_layer) {
  var parentLayerID = opt_layer.get('id');

  /**
   * @param {?} evt
   */
  var handler = function(evt) {

    /**
     * @type {?} evt
     */
    var event = evt;
    var pixel = event.pixel;
    var features = [];
    map.forEachFeatureAtPixel(pixel, function(f, l) {
      goog.array.extend(features, f);
    },null, function(l) {
      return l.get('id') === parentLayerID;
    });

    if (features.length > 0) {
      var dispEvt = {
        'eventType': mapito.layer.Events.FEATURECLICK,
        'features': features,
        'layerId': parentLayerID
      };
      callback.call(opt_this, dispEvt);
    }
  };

  return handler;
};
