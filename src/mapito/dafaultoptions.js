goog.provide('mapito.DefaultOptions');
goog.provide('mapito.app.MapOptions');
goog.provide('mapito.app.ProjectOptions');
goog.provide('mapito.mapito.Theme');

goog.require('mapito.style.StyleOptions');


/**
 * @typedef {{
 *            projection:{{mapito.app.ProjOptions|string}},
 *            map:{{mapito.app.MapOptions}},
 *            layers: Array.<{{mapito.layer.OSMOptions}}>,
 *            style: Array.<mapito.style.StyleOptions>
 *            theme: {{mapito.Theme}}}}
 */
mapito.app.ProjectOptions;


/**
 * @typedef {{center:Array.<number>,
 *            zoom:number,
 *            baseResolution:number,
 *            resolutionsLevels:number
 *           }}
 */
mapito.app.MapOptions;


/**
 * @typedef {{
 *            code:string,
 *            def:string,
 *            extent:{ol.Extent}
 *           }}
 */
mapito.app.ProjOptions;


/**
 * @enum {string}
 */
mapito.app.KnownProjections = {
  4326 : 'EPSG:4326',
  3857 : 'EPSG:3857'
};


/**
 * @typedef {{
 *           }}
 */
mapito.Theme;


/**
 * @type {mapito.app.ProjectOptions}
 */
mapito.DefaultOptions = {
  'projection': 'EPSG:3857',
  'map': {
    'center': [1910872.8582313128, 6148369.483887095],
    'zoom': 5,
    'baseResolution': 156543.03391,
    'resolutionsLevels': 21
  },
  'layers': [
    {
      'type': 'osm',
      'config': {
        'name': 'Open street maps',
        'baselayer': true,
        'visible': true
      }
    }
  ],
  'theme': {

  }
};
