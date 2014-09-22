/** @jsx React.DOM */
templates.likebtn = React.createClass({displayName: 'likebtn',
  getInitialState: function() {
    return {liked: false};
  },
  handleClick: function(event) {
    this.setState({liked: !this.state.liked});
  },
  render: function() {
    var text = this.state.liked ? 'like' : 'unlike';
    return (
      React.DOM.p({onClick: this.handleClick}, 
        "You ", text, " this. Click to toggle."
      )
    );
  }
});
