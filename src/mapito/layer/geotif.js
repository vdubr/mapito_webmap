goog.provide('mapito.layer.GeotifOptions');
goog.provide('mapito.layer.geotif');

goog.require('ol.layer.Tile');
goog.require('ol.source.ImageStatic');


/**
 * @typedef {{
 *            url: string,
 *            projection:string,
 *            extent:ol.Extent,
 *            imageSize:imageSize
 *           }}
 */
mapito.layer.GeotifOptions;


/**
 * @param {mapito.layer.GeotifOptions} GeotifOptions
 * @return {ol.layer.Tile}
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
