goog.provide('mapito.uri');
goog.provide('mapito.uri.uriOptions');

goog.require('goog.Uri');
goog.require('mapito.app.ProjectOptions');
goog.require('mapito.transform');
goog.require('ol.Object');


/**
 * @typedef {{x:{number|undefined},
 *            y:{number|undefined},
 *            z:{number|undefined},
 *            config:{string|mapito.app.ProjectOptions|undefined}
 *           }}
 */
mapito.uri.uriOptions;



/**
 * URL must by encoded by http://meyerweb.com/eric/tools/dencoder/
 * mode=RAW&x=14.83635&y=49.11928&z=13&config=data/mapito/4326.json
 */


/**
  * @return {?goog.Uri.QueryData}
  */
mapito.uri.getQueryData = function() {
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
 * @return {?mapito.uri.uriOptions}
 */
mapito.uri.getSettings = function() {
  var settings = null;

  var queryData = mapito.uri.getQueryData();

  if (!goog.isDefAndNotNull(queryData)) {
    return null;
  }

  var queryKeys = queryData.getKeys();
  var queryValues = queryData.getValues();

  //todo separate
  //check config

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

  //todo separate
  //check config
  if (goog.array.contains(queryKeys, 'config')) {
    var config = queryValues[queryKeys.indexOf('config')];

    //todo decode and parse json
    //if url, try to download and validate
    if (goog.isString(config)) {
      if (!goog.isObject(settings)) {
        settings = {};
      }
      goog.object.extend(settings, {'config': config});
    }
  }


  return settings;
};


/**
 * @param {ol.Coordinate} center
 * @param {number} zoom
 * @param {ol.proj.ProjectionLike} projection
 */
mapito.uri.propagateViewChange = function(center, zoom, projection) {
  var wgsCoords = mapito.transform.coordsToWgs(center, projection);

  var queryData = mapito.uri.getQueryData();
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
