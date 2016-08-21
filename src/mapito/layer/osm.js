goog.provide('mapito.layer.OSMOptions');
goog.provide('mapito.layer.osm');

goog.require('ol.layer.Tile');
goog.require('ol.source.OSM');

/**
Confg example

{
  "type":"osm",
  "specs":{},
  "config":{
    "name":"First layer made by mapito",
    "baselayer":false,
    "visible":true,
    "reload":0,
    "tags":["Sítě","Zeleň"]
    }
}

**/


/**
 * @typedef {{
 *            opacity: number
 *           }}
 */
mapito.layer.OSMOptions;


/**
 * Only for projection EPSG:3857
 * @param {?mapito.layer.OSMOptions} OSMOptions
 * @return {ol.layer.Tile}
 */
mapito.layer.osm.getOSMLayer = function(OSMOptions) {
  var opacity = OSMOptions ? OSMOptions['opacity'] || 1 : 1;
  var layer = new ol.layer.Tile({
    opacity: opacity,
    source: new ol.source.OSM()
  });
  return layer;
};
