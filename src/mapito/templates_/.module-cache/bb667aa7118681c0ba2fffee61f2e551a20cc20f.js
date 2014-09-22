/** @jsx React.DOM */
goog.provide('templates.project')

templates.likebtn = React.createClass({displayName: 'likebtn',
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
