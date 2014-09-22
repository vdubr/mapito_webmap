/** @jsx React.DOM */
goog.provide('templates.project')

templates.project = React.createClass({displayName: 'project',
  render: function() {
      var classes = "mapito-project"

    return (
      React.DOM.div({className: 'mapito-project'}, 
      React.DOM.div({className: 'mapito-mapview'}
      ), 
      React.DOM.div({className: 'mapito-dataview'}
      )
      )
    );
  }
});
