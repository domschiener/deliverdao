Meteor.publish('orders', function() {
  return Orders.find({});
});

Meteor.publish('thisOrder', function(orderId) {
  return Orders.find({_id: orderId});
});
