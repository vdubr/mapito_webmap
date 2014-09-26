goog.provide('mapito.Uri');
goog.provide('mapito.Uri.Events');
goog.provide('mapito.uri.uriOptions');

goog.require('goog.Uri');
goog.require('mapito.transform');
goog.require('ol.Object');


/**
 * @typedef {{x:{number|undefined},
 *            y:{number|undefined},
 *            z:{number|undefined}
 *           }}
 */
mapito.uri.uriOptions;



/**
 * mapito_3857.html#?mode=RAW&x=13&y=54&z=4
 * @class
 * @constructor
 * @extends {ol.Object}
 */
mapito.Uri = function() {

  goog.base(this);

};
goog.inherits(mapito.Uri, ol.Object);


/**
 * FIXME define type
 * @return {?mapito.uri.uriOptions}
 */
mapito.Uri.prototype.getSettings = function() {
  var settings = null;

  var queryData = this.getQueryData();

  if (!goog.isDefAndNotNull(queryData)) {
    return null;
  }

  var queryKeys = queryData.getKeys();
  var queryValues = queryData.getValues();

  if (goog.array.contains(queryKeys, 'x') &&
      goog.array.contains(queryKeys, 'y')) {
    var strX = queryValues[queryKeys.indexOf('x')];
    var x = goog.string.toNumber(strX);

    var strY = queryValues[queryKeys.indexOf('y')];
    var y = goog.string.toNumber(strY);

    if (goog.isNumber(x) && goog.isNumber(y)) {
      settings = {
        x: x,
        y: y
      };
      if (goog.array.contains(queryKeys, 'z')) {
        var strZ = queryValues[queryKeys.indexOf('z')];
        var z = goog.string.toNumber(strZ);
        if (goog.isNumber(z)) {
          goog.object.extend(settings, {z: z});
        }
      }
    }
  }

  return settings;
};


/**
 * @return {?goog.Uri.QueryData}
 */
mapito.Uri.prototype.getQueryData = function() {
  var query = null;
  var uri = new goog.Uri(document.location);
  var queryData = uri.getQueryData();
  var hashQueryData = new goog.Uri.QueryData(uri.getFragment());

  if (queryData.getKeys().length > 0) {
    query = queryData;
  }else if (hashQueryData.getKeys().length > 0) {
    query = hashQueryData;
  }
  return query;
};


/**
 * @param {ol.View} view
 */
mapito.Uri.prototype.propagateViewChange = function(view) {
  var mapCoords = view.getCenter();
  var zoom = view.getZoom();
  var projection = view.getProjection();

  var wgsCoords = mapito.transform.coordsToWgs(mapCoords, projection);

  var queryData = this.getQueryData();
  if (!goog.isDefAndNotNull(queryData)) {
    queryData = new goog.Uri.QueryData();
  }

  //round to last five
  var roundX = Math.round(wgsCoords[0] * 100000) / 100000;
  var roundY = Math.round(wgsCoords[1] * 100000) / 100000;

  queryData.set('x', roundX);
  queryData.set('y', roundY);
  queryData.set('z', zoom);

  var hash = queryData.toLocaleString();

  window.location.hash = hash;
};


/**
 * @enum {string}
 */
mapito.Uri.Events = {
  VIEW_SET: 'viewset',
  PROJECT_SET: 'projectset'
};
