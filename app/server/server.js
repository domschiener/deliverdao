Meteor.methods({
  newOrder: function(data) {
    return Orders.insert({order: data});
  },
  setActive: function(orderId) {
    return Orders.update({_id: orderId}, {
      $set: {
        'order.active': true,
        'order.shipping': true
      }
    });
  }
})
