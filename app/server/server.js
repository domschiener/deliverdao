Meteor.methods({
  newOrder: function(data) {
    return Orders.insert({order: data});
  }
})
