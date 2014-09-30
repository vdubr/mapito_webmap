goog.provide('mapito.App');
goog.provide('mapito.App.Events');
goog.provide('mapito.app.Options');

goog.require('goog.Promise');
goog.require('goog.net.XhrIo');
goog.require('mapito.DefaultOptions');
goog.require('mapito.Uri');
goog.require('mapito.layer');
goog.require('mapito.style');
goog.require('mapito.style.StyleOptions');
goog.require('mapito.transform');
goog.require('mapito.uri.uriOptions');
goog.require('ol.Map');
goog.require('ol.Object');
goog.require('ol.Overlay');
goog.require('ol.View');
goog.require('ol.control.ScaleLine');
goog.require('ol.control.ZoomSlider');
goog.require('ol.source.FormatVector');
goog.require('templates.project');


/**
 * @typedef {{path:string,
 *            type:string,
 *            target:string}}
 */
mapito.app.Options;



/**
 * @class
 * @constructor
 * @extends {ol.Object}
 */
mapito.App = function() {

  this.listenersKey_ = [];

  this.uriParser_ = new mapito.Uri();

  //var defaultOptions = mapito.DefaultOptions;

  goog.base(this);

};
goog.inherits(mapito.App, ol.Object);


/**
 * @type {?Array.<mapito.style.StyleOptions>}
 * @private
 */
mapito.App.prototype.styles_ = null;


/**
 * @type {Array.<goog.events.Key>}
 * @private
 */
mapito.App.prototype.listenersKey_ = null;


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
 * @type {?mapito.Uri}
 * @private
 */
mapito.App.prototype.uriParser_ = null;


/**
 * @type {?mapito.app.ProjectOptions}
 * @private
 */
mapito.App.prototype.projectOptions_ = null;


/**
 * @type {?ol.Map}
 * @private
 */
mapito.App.prototype.map_ = null;


/**
 * @param {mapito.app.Options} options
 */
mapito.App.prototype.setOptions = function(options) {
  var baseOptions = options;
  this.target_ = document.querySelector('#' + baseOptions['target']) || null;
  var getProjectOptions = this.getProjectOptions_(baseOptions['path']);

  getProjectOptions.then(this.setProjectOptions_, null, this);

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
      var obj = res.getResponseJson();
      resolve(obj);
    }, false, this);
    xhr.send(path);
  });
  return optionsGetter;
};


/**
 * @param {mapito.app.ProjectOptions} projectOptions
 * @private
 */
mapito.App.prototype.setProjectOptions_ = function(projectOptions) {
  // this.setThemeOptions_(projectOptions.theme)
  // this.setMapOptions_(projectOptions.map)
  // this.setLayersOptions_(projectOptions.layers)
  //this.setModulesOptions_(projectOptions.modules)
  this.projectOptions_ = projectOptions;

  goog.events.dispatchEvent(
      this, new goog.events.Event(mapito.App.Events.PROJECT_SET));
};


/**
 * Render the mapito project
 */
mapito.App.prototype.init = function() {
  if (goog.isDefAndNotNull(this.target_)) {
    //TODO check react and templates -> if the are not defined use simple
    //     good for use vithout react
    React.renderComponent(templates.project(), this.target_);
  }

  this.startProject_(this.projectOptions_);

};


/**
 * Prepare start app without configuration
 * @param {mapito.app.ProjectOptions} projectOptions
 * @private
 */
mapito.App.prototype.startProject_ = function(projectOptions) {
  var uriSettings = this.uriParser_.getSettings();
  if (goog.isDefAndNotNull(uriSettings)) {
    this.setProjectFromUri_(uriSettings, projectOptions);
  }else {
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
};


/**
 * @param {mapito.app.uriOptions} uriOptions
 * @param {mapito.app.ProjectOptions} projectOptions
 * @private
 */
mapito.App.prototype.setProjectFromUri_ = function(uriOptions, projectOptions) {

//TODO replace
var scope = this


var setView = function() {
    var view = scope.map_.getView();

    //set center and zoom
    if (uriOptions.x && uriOptions.y) {
      var appProj = scope.map_.getView().getProjection();
      var srcCoords = [uriOptions.x, uriOptions.y];
      var coords = mapito.transform.coordsWgsTo(srcCoords, appProj);

      if (goog.isDefAndNotNull(coords)) {
        view.setCenter(coords);
      }

      if (uriOptions.z) {
        view.setZoom(uriOptions.z);
      }
    }
  };



  this.getConfigFromUri_(uriOptions).then(
      function(config){
          scope.setProject_(config);
          setView();
      }, function(){
        scope.setProject_(projectOptions);
      }, this);

};


/**
 * TODO add reject states
 * @param {mapito.app.uriOptions} uriOptions
 * @return {Promise}
 * @private
 */
mapito.App.prototype.getConfigFromUri_ = function(uriOptions) {
  var promise = new goog.Promise(function(resolve, reject) {
    if (goog.object.containsKey(uriOptions, 'config')) {
      this.getProjectOptions_(uriOptions.config).then(
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
    this.styles_ = styleOptions;
    window['console']['log'](this.styles_);
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
    window['console']['log'](projection);
    projection.setExtent(projOptions['extent']);
    window['console']['log'](projection);
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

  // var resolutions = this.getResolutions_(
  //     mapOptions['baseResolution'], mapOptions['resolutionsLevels']);

  //var projection = this.getProjection_(mapOptions['proj']);

  var map_options = {
    target: mapTarget,
    renderer: ol.RendererType.CANVAS,
    view: new ol.View({
      center: mapOptions['center'],
      zoom: mapOptions['zoom'],
      //  resolutions: resolutions,
      //projection: mapOptions['proj']
      projection: projection
    })
  };

  this.map_ = new ol.Map(map_options);

  if (this.trackUri_) {
    this.setUriTracking_();
  }
};


/**
 * @private
 */
mapito.App.prototype.setUriTracking_ = function() {
  var parser = this.uriParser_;
  var view = this.map_.getView();
  this.map_.on('moveend', function(evt) {
    parser.propagateViewChange(view);
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
      return proj;
  }
};


/**
 * @param {!number} baseResolution
 * @param {!number} resolutionsLevels
 * @return {Array.<number>}
 * @private
 */
mapito.App.prototype.getResolutions_ =
    function(baseResolution, resolutionsLevels) {
  var resolutions = [];
  if (goog.isNumber(baseResolution) && goog.isNumber(resolutionsLevels)) {
    for (var i = 0; i <= resolutionsLevels; i++) {
      var resolution = baseResolution / Math.pow(2, i);
      resolutions.push(resolution);
    }
  }
  return resolutions;
};


/**
 * @param {mapito.app.LayersOptions} layersOptions
 * @private
 */
mapito.App.prototype.setLayers_ = function(layersOptions) {
  var layers = goog.array.map(layersOptions, mapito.layer.getLayer);

  goog.array.forEach(layers, function(layer) {
    this.setLayerListeners_(layer);
    this.map_.addLayer(layer);
  },this);

};


/**
 * @param {ol.layer.Base} layer
 * @private
 */
mapito.App.prototype.setLayerListeners_ = function(layer) {

  var source = layer.getSource();

  if (source instanceof ol.source.Vector) {
    this.beforeAddListenerFormatVector_(layer);


    this.listenersKey_.push(
        goog.events.listen(source, 'addfeature',
        this.handleAddFeature_, false, this)
    );
  }
};


/**
 * @param {ol.layer.Base} layer
 * @private
 */
mapito.App.prototype.beforeAddListenerFormatVector_ = function(layer) {
  var source = layer.getSource();
  var features = source.getFeatures();
  goog.array.forEach(features, function(feature) {
    var styleId = feature.get('styleId_');
    if (goog.isDefAndNotNull(styleId)) {
      var style = mapito.style.getStyle(this.styles_, styleId);
      window['console']['log'](style);
    }

  },this);
};


/**
 * @param {Event} evt
 * @private
 */
mapito.App.prototype.handleAddFeature_ = function(evt) {
  var feature = evt['feature'];
  var styleId = feature.get('styleId_');
  if (goog.isDefAndNotNull(styleId)) {
    var style = mapito.style.getStyle(this.styles_, styleId);
    if (goog.isDefAndNotNull(style)) {
      feature.setStyle(style);
    }
  }

};


/**
 * @enum {string}
 */
mapito.App.Events = {
  PROJECT_SET: 'projectset'
};
