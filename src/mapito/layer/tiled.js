goog.provide('mapito.layer.TiledOptions');
goog.provide('mapito.layer.tiled');

goog.require('ol.layer.Tile');
goog.require('ol.source.XYZ');


/**
 * @typedef {{
 *            url: string,
 *            projection:string
 *           }}
 */
mapito.layer.TiledOptions;


/**
 * @param {mapito.layer.TiledOptions} TiledOptions
 * @return {ol.layer.Tile}
 */
mapito.layer.tiled.getTiledLayer = function(TiledOptions) {
  var url = TiledOptions['url'];
  var projection = TiledOptions['projection'];

  var layer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      projection: projection,
      url: url + '/{z}/{x}/{-y}.png'
    })
  });

  return layer;
};
