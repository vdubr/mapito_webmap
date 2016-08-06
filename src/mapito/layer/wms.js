goog.provide('mapito.layer.WMSOptions');
goog.provide('mapito.layer.wms');

goog.require('ol.layer.Tile');
goog.require('ol.source.TileWMS');


/**
 * TODO add zoom restriction for all layers
 * @api stable
 * @typedef {{
 *            url: string,
 *            version: string,
 *            layers: string,
 *            tiled: boolean,
 *            extent: (ol.Extent|undefined)
 *           }}
 */
mapito.layer.WMSOptions;


/**
 * @param {mapito.layer.WMSOptions} WMSOptions
 * @return {ol.layer.Tile}
 * @api stable
 */
mapito.layer.wms.getWMSLayer = function(WMSOptions) {
  var url = WMSOptions['url'];
  var version = WMSOptions['version'] || '1.1.1';
  var layers = WMSOptions['layers'];
  var tiled = WMSOptions['tiled'];
  var extent = WMSOptions['extent'];
  var projection = WMSOptions['projection'];

  var source_options = {
    url: url,
    //TODO add posibility to add params from options
    params: {
      'LAYERS': layers,
      'TILED': tiled,
      'VERSION': version
    },
    extent: extent,
    projection: projection
  };

  var source = new ol.source.TileWMS(source_options);

  var layer = new ol.layer.Tile({
    source: source
  });
  return layer;
};
