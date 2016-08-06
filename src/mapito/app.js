goog.provide('mapito.App');
goog.provide('mapito.AppEvents');
goog.provide('mapito.Event');
goog.provide('mapito.app.Options');

goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.net.XhrIo');
goog.require('mapito.DefaultOptions');
goog.require('mapito.layer');
goog.require('mapito.layer.Events');
goog.require('mapito.layer.LayerOptions');
goog.require('mapito.layer.LayerTypes');
goog.require('mapito.layer.geojson');
goog.require('mapito.layer.topojson');
goog.require('mapito.layerEvents');
goog.require('mapito.map.Events');
goog.require('mapito.style');
goog.require('mapito.style.StyleOptions');
goog.require('mapito.transform');
goog.require('mapito.uri');
goog.require('mapito.uri.uriOptions');
goog.require('ol.Map');
goog.require('ol.MapBrowserEvent.EventType');
goog.require('ol.MapEventType');
goog.require('ol.Object');
goog.require('ol.View');
goog.require('ol.events');
goog.require('ol.events.Event');
goog.require('ol.proj.Projection');
goog.require('ol.source.Vector');
goog.require('ol.source.VectorEventType');
goog.require('templates');
goog.require('templates.project');



/**
 * @param {string} type The event type.
 * @param {?Object} event Object contains event informations
 * @constructor
 * @extends {ol.events.Event}
 */
mapito.Event = function(type, event) {
  ol.events.Event.call(this, type);

  /**
   * @type {?Object}
   */
  this.event = event;

};
ol.inherits(mapito.Event, ol.events.Event);


/**
 * @typedef {{path:(string|undefined),
 *            target:(string|undefined),
 *            projectOptions:({mapito.app.ProjectOptions}|undefined)
 *          }}
 */
mapito.app.Options;



/**
 * @class
 * @constructor
 * @extends {ol.Object}
 * @api stable
 */
mapito.App = function() {
  ol.Object.call(this);

  this.projectOptions_ = mapito.DefaultOptions;

  this.styles_ = {};

  this.target_ = document.querySelector('#mapito') || null;


};
ol.inherits(mapito.App, ol.Object);


/**
 * @type {?Function}
 * @private
 */
mapito.App.prototype.eventListener_ = null;


/**
 * @type {?ol.Map}
 * @private
 */
mapito.App.prototype.map_ = null;


/**
 * @type {?mapito.app.ProjectOptions}
 * @private
 */
mapito.App.prototype.projectOptions_ = null;


/**
 * @type {Object.<number,ol.style.Style>}
 * @private
 */
mapito.App.prototype.styles_ = null;


/**
 * @type {?Element}
 * @private
 */
mapito.App.prototype.target_ = null;


/**
 * @type {boolean}
 * @private
 */
mapito.App.prototype.trackUri_ = true;


/**
 * @param {ol.style.Style} style
 * @param {number} styleId
 * @api stable
 */
mapito.App.prototype.addStyle = function(style, styleId) {
  var styleExists = this.getStyleById(styleId);
  if (!styleExists) {
    this.styles_[styleId] = style;
  }
};
goog.exportProperty(
    mapito.App.prototype,
    'addStyle',
    mapito.App.prototype.addStyle);


/**
 * @param {number|string} layerId
 * @return {ol.layer.Layer|undefined}
 * @api stable
 */
mapito.App.prototype.getLayerById = function(layerId) {
  //get layer by id
  var layers = this.map_.getLayers();
  var searchLayer, id;
  layers.forEach(function(layer) {
    id = layer.get('id');
    if (layerId == id) {
      searchLayer = layer;
      return;
    }
  });
  return /**@type {ol.layer.Layer|undefined}*/(searchLayer);
};
goog.exportProperty(
    mapito.App.prototype,
    'getLayerById',
    mapito.App.prototype.getLayerById);


/**
 * @return {Array.<mapito.layer.LayerConfig>}
 */
mapito.App.prototype.getLayers = function() {
  var layersConfigs = [];

  var layers = this.map_.getLayers();
  var layerConfig;

  layers.forEach(function(layer) {

    layerConfig = mapito.layer.getLayerConfig(layer);

    layersConfigs.push(layerConfig);
  });

  return layersConfigs;

};
goog.exportProperty(
    mapito.App.prototype,
    'getLayers',
    mapito.App.prototype.getLayers);


/**
 * @return {Object}
 */
mapito.App.prototype.getView = function() {
  var view = this.map_.getView();
  var size = this.map_.getSize();
  var extent = size ? view.calculateExtent(size) : null;
  var properties = view.getProperties();
  properties['extent'] = extent;
  properties['zoom'] = view.getZoom();
  properties['projection'] = view.getProjection();
  return properties;
};
goog.exportProperty(
    mapito.App.prototype,
    'getView',
    mapito.App.prototype.getView);


/**
 * @param {ol.Extent} extent
 */
mapito.App.prototype.zoomToExtent = function(extent) {
  //TODO check if extent fit to restricted extent
  if (extent) {
    var view = this.map_.getView();
    var size = this.map_.getSize();
    view.fit(/** @type {ol.Extent}*/(extent), /** @type {ol.Size}*/(size));
  }
};
goog.exportProperty(
    mapito.App.prototype,
    'zoomToExtent',
    mapito.App.prototype.zoomToExtent);


/**
 * @param {number|string} layerId
 * @return {Array.<ol.Feature>|undefined}
 */
mapito.App.prototype.getLayerFeatures = function(layerId) {

  var features;

  var layer = this.getLayerById(layerId);

  if (!layer) {
    return features;
  }

  var source = layer.getSource();

  if (source instanceof ol.source.Vector) {
    features = source.getFeatures();
  }

  return features;

};
goog.exportProperty(
    mapito.App.prototype,
    'getLayerFeatures',
    mapito.App.prototype.getLayerFeatures);


/**
 * @param {number} styleId
 * @return {ol.style.Style|undefined}
 */
mapito.App.prototype.getStyleById = function(styleId) {
  return this.styles_[styleId];
};
goog.exportProperty(
    mapito.App.prototype,
    'getStyleById',
    mapito.App.prototype.getStyleById);


/**
 * @param {mapito.app.Options} options
 * @param {?Function} callback
 */
mapito.App.prototype.setOptions = function(options, callback) {
  if (!options) {
    window['console']['error']('Options is not defined.');
    return;
  }

  if (options['target']) {
    this.target_ = document.querySelector('#' + options['target']);
  }

  if (goog.isDefAndNotNull(options['projectOptions'])) {
    this.setProjectOptions_(options['projectOptions']).then(callback);
  } else if (goog.isDefAndNotNull(options['path'])) {
    var getProjectOptions = this.getProjectOptions_(options['path']);
    getProjectOptions.then(this.setProjectOptions_, null, this).then(callback);
  } else {
    this.setProjectOptions_(mapito.DefaultOptions).then(callback);
    // callback();
    // this.dispatchEvent_({'type': mapito.App.Events.PROJECT_SET});
  }


};

goog.exportProperty(
    mapito.App.prototype,
    'setOptions',
    mapito.App.prototype.setOptions);


/**
 * @param {Function} listener
 */
mapito.App.prototype.setEventListener = function(listener) {
  this.eventListener_ = listener;
};
goog.exportProperty(
    mapito.App.prototype,
    'setEventListener',
    mapito.App.prototype.setEventListener);


/**
 * @param {ol.Feature} feature
 * @param {number} styleId
 */
mapito.App.prototype.setFeatureStyle = function(feature, styleId) {
  if (goog.isDefAndNotNull(feature) && goog.isDefAndNotNull(styleId)) {
    var style = this.getStyleById(styleId);
    if (goog.isDefAndNotNull(style)) {
      feature.setStyle(style);
    }
  }
};
goog.exportProperty(
    mapito.App.prototype,
    'setFeatureStyle',
    mapito.App.prototype.setFeatureStyle);


/**
 * @param {string} type
 * @param {Object=} opt_eventObject
 * @private
 */
mapito.App.prototype.dispatchEvent_ = function(type, opt_eventObject) {
  //call external listener
  if (this.eventListener_) {
    this.eventListener_(type, opt_eventObject);
  }
  //dispatch event on itself
  var evtObj = opt_eventObject ? opt_eventObject : null;
  this.dispatchEvent(new mapito.Event(type, evtObj));
};


/**
 * @param {string} path
 * @return {goog.Promise}
 * @private
 */
mapito.App.prototype.getProjectOptions_ = function(path) {
  var optionsGetter = new goog.Promise(function(resolve, reject) {

    var xhr = new goog.net.XhrIo();

    goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(evt) {
      var res = evt.target;
      var obj;
      if (res.getLastErrorCode() === goog.net.ErrorCode.HTTP_ERROR) {

        if (path.indexOf('.json') > -1) {
          obj = mapito.DefaultOptions;
        } else {
          mapito.App.prototype.getProjectOptions_(path + '.json')
              .then(function(config) {
                resolve(config);
              });
        }
      }else {
        obj = res.getResponseJson();
        resolve(obj);
      }
    }, false, this);

    xhr.send(path);
  });
  return optionsGetter;
};


/**
 * @param {mapito.app.ProjectOptions} projectOptions
 * @return {goog.Promise}
 * @private
 */
mapito.App.prototype.setProjectOptions_ = function(projectOptions) {
  // this.setThemeOptions_(projectOptions.theme)
  // this.setMapOptions_(projectOptions.map)
  // this.setLayersOptions_(projectOptions.layers)
  //this.setModulesOptions_(projectOptions.modules)
  var optionsSetter = new goog.Promise(function(resolve, reject) {
    this.projectOptions_ = projectOptions;
    resolve();
  }, this);
  var type = mapito.AppEvents.PROJECT_SET;
  this.dispatchEvent_(type);
  return optionsSetter;
};


/**
 * Render the mapito project
 */
mapito.App.prototype.init = function() {

  this.renderMapTarget_(this.target_);


  this.startProject_(
      /** @type {mapito.app.ProjectOptions} */(this.projectOptions_));

};
goog.exportProperty(
    mapito.App.prototype,
    'init',
    mapito.App.prototype.init);


/**
 * Prepare start app without configuration
 * @param {mapito.app.ProjectOptions} projectOptions
 * @private
 */
mapito.App.prototype.startProject_ = function(projectOptions) {
  var uriOptions = mapito.uri.getSettings();

  if (goog.isDefAndNotNull(uriOptions) &&
      goog.isDefAndNotNull(uriOptions['config'])) {
    this.setProjectFromUri_(uriOptions);
  }else if (goog.isDefAndNotNull(projectOptions)) {
    this.setProject_(projectOptions);
  }
};


/**
 * @param {mapito.app.ProjectOptions} projectOptions
 * @private
 */
mapito.App.prototype.setProject_ = function(projectOptions) {
  var projection = this.getProjection_(projectOptions['projection']);
  this.setMap_(projectOptions['map'], projection);
  this.setLayers_(projectOptions['layers']);
  this.setStyles_(projectOptions['styles']);

  if (projectOptions && projectOptions['map'] &&
      projectOptions['map']['useURIcenter']) {
    var uriOptions = mapito.uri.getSettings();
    if (uriOptions) {
      this.setViewFromUri_(uriOptions, this.map_.getView());
    }
  }
};


/**
 * @param {mapito.uri.uriOptions} uriOptions
 * @private
 */
mapito.App.prototype.setProjectFromUri_ = function(uriOptions) {
  this.getConfigFromUri_(uriOptions).then(this.setProject_, null, this);
};


/**
 * @param {mapito.uri.uriOptions} uriOptions
 * @param {ol.View} view
 * @private
 */
mapito.App.prototype.setViewFromUri_ = function(uriOptions, view) {

  //set center
  if (uriOptions.x && uriOptions.y) {
    var appProj = view.getProjection();
    var srcCoords = [uriOptions.x, uriOptions.y];
    var coords = mapito.transform.coordsWgsTo(srcCoords, appProj);

    if (goog.isDefAndNotNull(coords)) {
      view.setCenter(coords);
    }
  }

  //set zoom
  if (uriOptions.z) {
    view.setZoom(uriOptions.z);
  }
};


/**
 * TODO add reject states
 * @param {mapito.uri.uriOptions} uriOptions
 * @return {goog.Promise}
 * @private
 */
mapito.App.prototype.getConfigFromUri_ = function(uriOptions) {
  var promise = new goog.Promise(function(resolve, reject) {
    if (goog.object.containsKey(uriOptions, 'config')) {
      this.getProjectOptions_(uriOptions['config']).then(
          function(config) {
            resolve(config);
          },null, this);
    }else {
      reject();
    }

  },this);

  return promise;
};


/**
 * @param {Array.<mapito.style.StyleOptions>} styleOptions
 * @private
 */
mapito.App.prototype.setStyles_ = function(styleOptions) {
  if (goog.isDefAndNotNull(styleOptions)) {
    var style;
    goog.array.forEach(styleOptions, function(styleOption) {
      style = mapito.style.getStyle(styleOption);
      if (style) {
        this.addStyle(style, styleOption['id']);
      }
    },this);
  }
};


/**
 * @param {mapito.app.ProjOptions|mapito.app.KnownProjections} projOptions
 * @return {ol.proj.Projection|undefined}
 * @private
 */
mapito.App.prototype.getProjection_ = function(projOptions) {
  var projection;

  if (goog.isString(projOptions)) {
    projection = ol.proj.get(projOptions);
  }else if (goog.isObject(projOptions) &&
      goog.isDefAndNotNull(projOptions['code']) &&
      goog.isDefAndNotNull(projOptions['def']) &&
      goog.isDefAndNotNull(projOptions['extent'])) {
    proj4.defs(projOptions['code'], projOptions['def']);
    projection = ol.proj.get(projOptions['code']);
    projection.setExtent(projOptions['extent']);
  }
  return projection;
};


/**
 * @param {mapito.app.MapOptions} mapOptions
 * @param {ol.proj.Projection|undefined} projection
 * @private
 */
mapito.App.prototype.setMap_ = function(mapOptions, projection) {
  var mapTarget = this.target_.querySelector('.mapito-mapview');

  var resolutions = this.getResolutions_(
      mapOptions['baseResolution'], mapOptions['resolutionsLevels']);

  var zoom, center, zoomExtent;
  if (mapOptions['init']) {
    zoom = mapOptions['init']['zoom'] || 0;
    center = mapOptions['init']['center'];
    zoomExtent = mapOptions['init']['extent'];
  }

  var map_options = {
    target: mapTarget,
    renderer: ol.RendererType.CANVAS,
    view: new ol.View({
      center: center,
      zoom: zoom,
      resolutions: resolutions,
      projection: projection,
      extent: mapOptions['extent']
    })
  };

  this.map_ = new ol.Map(map_options);

  if (zoomExtent) {
    this.zoomToExtent(zoomExtent);
  }

  if (this.trackUri_) {
    this.setUriTracking_();
  }

  //set map listeners
  this.setMapEvents_(mapOptions['events']);
};


/**
 * @param {Array.<mapito.map.Events>|undefined} events
 * @private
 */
mapito.App.prototype.setMapEvents_ = function(events) {
  if (goog.isArray(events)) {
    var handler;
    goog.array.forEach(events, function(eventType) {
      switch (eventType) {
        case mapito.map.Events.MAPCLICK:
          handler = mapito.mapEvents.getHandler(
              mapito.map.Events.MAPCLICK, this.map_, this.dispatchEvent_, this);
          if (handler) {
            this.map_.on(
                ol.MapBrowserEvent.EventType.SINGLECLICK, handler, this);
          }
          break;
      }
    },this);
  }
};


/**
 * @private
 */
mapito.App.prototype.setUriTracking_ = function() {
  var view = this.map_.getView();
  this.map_.on(ol.MapEventType.MOVEEND, function(evt) {
    var center = view.getCenter() ||
        mapito.DefaultOptions['map']['init']['center'];
    var zoom = view.getZoom() || mapito.DefaultOptions['map']['init']['zoom'];
    var projection = view.getProjection();
    mapito.uri.propagateViewChange(center, zoom, projection);
  });

};


/**
 * @param {!string} projStr
 * @return {ol.proj.Projection}
 * @private
 */
mapito.App.prototype.getProjectionGGG_ = function(projStr) {
  var proj;
  switch (projStr) {
    case 'local':
      proj = new ol.proj.Projection({
        code: 'pixel',
        units: 'pixels',
        extent: [0, 0, 16200, 8100]});
      break;
    default:
      try {
        proj = ol.proj.get(projStr);
      }catch (e) {
        proj = ol.proj.get('EPSG:3857');
      }
      break;
  }
  return proj;
};


/**
 * @param {number=} opt_baseResolution
 * @param {number=} opt_resolutionsLevels
 * @return {Array.<number>}
 * @private
 */
mapito.App.prototype.getResolutions_ =
    function(opt_baseResolution, opt_resolutionsLevels) {
  var resolutions = [];
  var base = goog.isNumber(opt_baseResolution) ? opt_baseResolution :
      mapito.DefaultOptions['map']['baseResolution'];
  var levels = goog.isNumber(opt_resolutionsLevels) ? opt_resolutionsLevels :
      mapito.DefaultOptions['map']['resolutionsLevels'];

  for (var i = 0; i <= levels; i++) {
    var resolution = base / Math.pow(2, i);
    resolutions.push(resolution);
  }

  return resolutions;
};


/**
 * @param {ol.layer.Layer} layer
 * @private
 */
mapito.App.prototype.postLayerAddHandler_ = function(layer) {
  var type = layer.get('layerType_');
  switch (type) {
    case mapito.layer.LayerTypes.GEOJSON:
      if (layer.get('layerSpecs_') && layer.get('layerSpecs_')['path']) {
        mapito.layer.geojson.loadLayer(
            /** @type {ol.layer.Vector}*/(layer)).then(function() {
          var type = mapito.layer.Events.LAYERLOADEND;
          var event = {
            'layer': layer
          };
          this.dispatchEvent_(type, event);
        },null, this);
      }
      break;
    case mapito.layer.LayerTypes.TOPOJSON:
      if (layer.get('layerSpecs_') && layer.get('layerSpecs_')['path']) {
        mapito.layer.topojson.loadLayer(
            /** @type {ol.layer.Vector}*/(layer)).then(function() {
          var eventType = mapito.layer.Events.LAYERLOADEND;
          var event = {
            'layer': layer
          };
          this.dispatchEvent_(eventType, event);
        },null, this);
      }
      break;
  }

};


/**
 * @param {Array.<mapito.layer.LayerOptions>} layersOptions
 * @private
 */
mapito.App.prototype.setLayers_ = function(layersOptions) {
  var layers = goog.array.map(layersOptions, mapito.layer.getLayer);

  goog.array.forEach(layers, function(layer) {
    if (layer) {
      this.setLayerListeners_(layer);
      this.map_.addLayer(layer);
      this.postLayerAddHandler_(layer);
    }
  },this);

};


/**
 * @param {ol.layer.Layer} layer
 * @private
 */
mapito.App.prototype.setLayerListeners_ = function(layer) {
  var source = layer.getSource();

  if (source instanceof ol.source.Vector) {
    ol.events.listen(source, ol.source.VectorEventType.ADDFEATURE,
        this.handleAddFeature_, this, false);
  }

  var events = layer.get('events');

  if (goog.isArray(events)) {
    var handler;
    goog.array.forEach(events, function(eventType) {
      switch (eventType) {
        case mapito.layer.Events.FEATURECLICK:
          handler = mapito.layerEvents.getHandler(
              mapito.layer.Events.FEATURECLICK, this.map_, this.dispatchEvent_,
              this, layer);
          if (handler) {
            this.map_.on(
                ol.MapBrowserEvent.EventType.SINGLECLICK, handler, this);
          }
          break;
      }
    },this);
  }

};


/**
 * @param {ol.interaction.SelectEvent} evt
 * @private
 */
mapito.App.prototype.onselectEventHandler_ = function(evt) {
  var selected = evt.selected;
  if (selected && selected.length > 0) {
    var eventType = evt.target.get('eventType');
    var layerId = evt.target.get('layerId');
    var event = {
      'features': selected,
      'layerId': layerId
    };
    this.dispatchEvent_(eventType, event);
  }

};


/**
 * @param {Event} evt
 * @private
 */
mapito.App.prototype.handleAddFeature_ = function(evt) {
  var feature = evt['feature'];
  var styleId = feature.get('styleId_');
  this.setFeatureStyle(feature, styleId);
};


/**
 * @param {?Element} element
 * @private
 */
mapito.App.prototype.renderMapTarget_ = function(element) {

  if (!element) {
    window['console']['error']('Wrong map element ID');
    return;
  }

  if (goog.isDefAndNotNull(element)) {
    if (goog.isDefAndNotNull(window['React'])) {
      // var mapElement = React.createElement(templates.project());
      React.render(templates.project(), element);
    }else {
      goog.dom.appendChild(element, templates.project());
    }
  }
};


/**
 * @enum {string}
 */
mapito.AppEvents = {
  /**
   * @api stable
   */
  PROJECT_SET: 'projectset'
};

goog.exportSymbol('mapito.App', mapito.App);
