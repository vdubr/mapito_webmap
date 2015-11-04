goog.provide('mapito.layer.GeotifOptions');
goog.provide('mapito.layer.geotif');

goog.require('ol.layer.Image');
goog.require('ol.source.ImageStatic');


/**
 * @typedef {{
 *            url: string,
 *            projection:ol.proj.ProjectionLike,
 *            extent:ol.Extent,
 *            imageSize:ol.Size
 *           }}
 */
mapito.layer.GeotifOptions;


/**
 * @param {mapito.layer.GeotifOptions} GeotifOptions
 * @return {ol.layer.Image}
 */
mapito.layer.geotif.getGeotifLayer = function(GeotifOptions) {
  var url = GeotifOptions['url'];
  var projection = GeotifOptions['projection'];
  var extent = GeotifOptions['extent'];
  var imageSize = GeotifOptions['imageSize'];

  var layer = new ol.layer.Image({
    source: new ol.source.ImageStatic({
      projection: projection,
      url: url,
      imageExtent: extent,
      imageSize: imageSize
    })
  });

  return layer;
};
