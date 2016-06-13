Meteor.publish('orders', function() {
  return Orders.find({});
});
