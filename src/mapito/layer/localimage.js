goog.provide('mapito.layer.LocalimageOptions');
goog.provide('mapito.layer.localimage');

goog.require('ol.layer.Image');
goog.require('ol.proj.Projection');
goog.require('ol.source.ImageStatic');


/**
 * @typedef {{
 *            path: string,
 *            size: {ol.Size},
 *            opacity: number
 *           }}
 */
mapito.layer.LocalimageOptions;


/**
 * @param {mapito.layer.LocalimageOptions} LocalimageOptions
 * @return {ol.layer.Image}
 */
mapito.layer.localimage.getLocalimageLayer = function(LocalimageOptions) {
  var path = LocalimageOptions['path'];
  var size = LocalimageOptions['size'];
  var opacity = LocalimageOptions['opacity'] || 1;

  // Maps always need a projection, but the static image is not geo-referenced,
  // and are only measured in pixels.  So, we create a fake projection that the
  // map can use to properly display the layer.
  var pixelProjection = new ol.proj.Projection({
    code: 'pixel',
    units: 'pixels',
    extent: [0, 0, size[0], size[1]]
  });


  var layer = new ol.layer.Image({
    opacity: opacity,
    source: new ol.source.ImageStatic({
      url: path,
      projection: pixelProjection,
      imageSize: size,
      imageExtent: pixelProjection.getExtent()
    })
  });

  return layer;
};
