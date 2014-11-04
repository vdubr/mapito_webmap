goog.provide('mapito.style');
goog.provide('mapito.style.StyleDefinition');
goog.provide('mapito.style.StyleOptions');

goog.require('mapito.icon.pin');
goog.require('ol.style.Style');


/**
 * @typedef {{id: number,
 *            def: {mapito.style.StyleDefinition}
 *           }}
 */
mapito.style.StyleOptions;


/**
 * @typedef {{fill: {olx.style.FillOptions},
 *            image: {olx.style.IconOptions},
 *            stroke: {olx.style.StrokeOptions}
 *           }}
 */
mapito.style.StyleDefinition;


/**
 * Return style function for given style definition
 * @param {ol.Feature} feature
 * @param {number} resolution
 */
mapito.style.getStyleFunction = function(feature, resolution) {
  var styleId = featire.get('styleId_');
  if (goog.isDefAndNotNull(styleId)) {

  }
};


/**
 * Return style function for given style definition
 * @param {Array.<mapito.style.StyleOptions>} stylesOptions
 * @param {number} styleId
 * @return {mapito.style.StyleOptions|undefined}
 */
mapito.style.getStyle = function(stylesOptions, styleId) {
  var style;
  var styleOpt = goog.array.find(stylesOptions, function(stylesOption) {
    return stylesOption['id'] === styleId;
  });

  if (goog.isDefAndNotNull(styleOpt)) {

    if (styleOpt['def']) {
      var styleDefinition = styleOpt['def'];
      style = new ol.style.Style({
        fill: styleDefinition['fill'] ?
            mapito.style.getFillStyle(styleDefinition['fill']) : undefined,
        image: styleDefinition['image'] ?
            mapito.style.getImageStyle(styleDefinition['image']) : undefined,
        stroke: styleDefinition['stroke'] ?
            mapito.style.getStrokeStyle(styleDefinition['stroke']) : undefined,
        text: styleDefinition['text'] ?
            mapito.style.getTextStyle(styleDefinition['text']) : undefined,
        zIndex: styleDefinition['zIndex'] ? styleDefinition['fill'] : undefined
      });
    }else if (styleOpt['icon']) {
      var iconDefinition = styleOpt['icon'];
      var iconStyleDef = goog.object.clone(iconDefinition);
      goog.object.remove(iconStyleDef, 'name');

      var name = iconDefinition['name'];
      var image = new Image();

      switch (name) {
        case 'pin':
          image.src = mapito.icon.pin.src;
          iconStyleDef.size = mapito.icon.pin.size;
          iconStyleDef.anchor = mapito.icon.pin.anchor;
          iconStyleDef.scale = mapito.icon.pin.scale;
          break;
      }

      iconStyleDef.img = image;

      style = new ol.style.Style({
        image: mapito.style.getImageStyle(iconStyleDef)
      });
    }


  }

  return style;
};


/**
 * @param {olx.style.FillOptions|undefined} options
 * @return {ol.style.Fill|undefined}
 */
mapito.style.getFillStyle = function(options) {
  var style;

  if (goog.isDefAndNotNull(options) && options['color']) {
    style = new ol.style.Fill({
      color: options['color']
    });
  }

  return style;
};


/**
 * @param {olx.style.ImageOptions|undefined} options
 * @return {ol.style.Image|undefined}
 */
mapito.style.getImageStyle = function(options) {
  var style;

  if (goog.isDefAndNotNull(options)) {
    style = new ol.style.Icon({
      anchor: options['anchor'],
      anchorOrigin: options['anchorOrigin'],
      anchorXUnits: options['anchorXUnits'],
      anchorYUnits: options['anchorYUnits'],
      crossOrigin: options['crossOrigin'],
      img: options['img'],
      offset: options['offset'],
      offsetOrigin: options['offsetOrigin'],
      scale: options['scale'],
      snapToPixel: options['snapToPixel'],
      rotateWithView: options['rotateWithView'],
      size: options['size'],
      src: options['src']
    });
  }

  return style;
};


/**
 * @param {olx.style.StrokeOptions|undefined} options
 * @return {ol.style.Stroke|undefined}
 */
mapito.style.getStrokeStyle = function(options) {
  var style;

  if (goog.isDefAndNotNull(options)) {
    style = new ol.style.Stroke({
      color: options['color'],
      lineCap: options['lineCap'],
      lineJoin: options['lineJoin'],
      lineDash: options['lineDash'],
      miterLimit: options['miterLimit'],
      width: options['img']
    });
  }

  return style;
};


/**
 * @param {olx.style.TextOptions|undefined} options
 * @return {ol.style.Text|undefined}
 */
mapito.style.getTextStyle = function(options) {
  var style;

  if (goog.isDefAndNotNull(options)) {
    style = new ol.style.Text({
      font: options['font'],
      offsetX: options['offsetX'],
      offsetY: options['offsetY'],
      scale: options['scale'],
      rotation: options['rotation'],
      text: options['text'],
      textAlign: options['textAlign'],
      textBaseline: options['textBaseline'],
      fill: options['fill'],
      stroke: options['stroke']
    });
  }

  return style;
};
