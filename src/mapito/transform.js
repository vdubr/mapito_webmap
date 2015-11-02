goog.provide('mapito.transform');

goog.require('ol.View');


/**
 * @param {ol.Coordinate} coords
 * @param {ol.proj.ProjectionLike} srcProj
 * @return {ol.Coordinate|undefined}
 */
mapito.transform.coordsToWgs = function(coords, srcProj) {
  var transformCoords;
  var dstProj = ol.proj.get('EPSG:4326');
  if (coords.length === 2 &&
      srcProj instanceof ol.proj.Projection &&
      dstProj instanceof ol.proj.Projection) {
    transformCoords = ol.proj.transform(coords, srcProj, dstProj);
  }
  return transformCoords;
};


/**
 * @param {ol.Coordinate} coords
 * @param {ol.proj.ProjectionLike} dstProj
 * @return {ol.Coordinate|undefined}
 */
mapito.transform.coordsWgsTo = function(coords, dstProj) {
  var transformCoords;
  var srcProj = ol.proj.get('EPSG:4326');
  if (coords.length === 2 &&
      srcProj instanceof ol.proj.Projection &&
      dstProj instanceof ol.proj.Projection) {
    transformCoords = ol.proj.transform(coords, srcProj, dstProj);
  }
  return transformCoords;
};
