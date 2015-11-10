goog.provide('mapito.DefaultOptions');
goog.provide('mapito.app.MapOptions');
goog.provide('mapito.app.ProjectOptions');
goog.provide('mapito.map.Events');
goog.provide('mapito.mapito.Theme');

goog.require('mapito.layer.LayerOptions');
goog.require('mapito.style.StyleOptions');


/**
 * @typedef {{
 *            projection:(mapito.app.ProjOptions|mapito.app.KnownProjections),
 *            map:(mapito.app.MapOptions),
 *            layers: Array.<(mapito.layer.LayerOptions)>,
 *            style: (Array.<mapito.style.StyleOptions>|undefined),
 *            theme: (mapito.Theme)}}
 */
mapito.app.ProjectOptions;


/**
 * @typedef {{init:(mapito.app.MapInit|undefined),
 *            baseResolution:(number|undefined),
 *            resolutionsLevels:(number|undefined),
 *            useURIcenter:(boolean|undefined),
 *            extent: (ol.Extent|undefined),
 *            events: (Array.<mapito.map.Events>|undefined)
 *           }}
 */
mapito.app.MapOptions;


/**
 * @typedef {{center:(ol.Coordinate|undefined),
 *            zoom:(number|undefined),
 *            extent:(ol.Extent|undefined)
 *           }}
 */
mapito.app.MapInit;


/**
 * @typedef {{
 *            code:string,
 *            def:string,
 *            extent:(ol.Extent)
 *           }}
 */
mapito.app.ProjOptions;


/**
 * @enum {string}
 */
mapito.map.Events = {
  MAPCLICK: 'map:click'
};


/**
 * @enum {string}
 */
mapito.app.KnownProjections = {
  4326 : 'EPSG:4326',
  3857 : 'EPSG:3857'
};


/**
 * @typedef {Object}
 */
mapito.Theme;


/**
 * @type {mapito.app.ProjectOptions}
 */
mapito.DefaultOptions = {
  'projection':
      /** @type {mapito.app.ProjOptions|mapito.app.KnownProjections} */(
      'EPSG:3857'),
  'map': /** @type {mapito.app.MapOptions} */({
    'init': {
      'center': [1910872.8582313128, 6148369.483887095],
      'zoom': 5,
      'extent': undefined
    },
    'baseResolution': 156543.03392804097,
    'resolutionsLevels': 21,
    'extent': undefined
  }),
  'layers': /** @type {Array.<(mapito.layer.LayerOptions)>}*/([
    {
      'type': 'osm',
      'config': {
        'name': 'Open street maps',
        'baselayer': true,
        'visible': true
      }
    }
  ]),
  'style': undefined,
  'theme': /** @type {mapito.Theme}*/({})
};
