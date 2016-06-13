Meteor.methods({
  newOrder: function(data) {
    return Orders.insert({order: data});
  },
  setActive: function(orderId) {
    return Orders.update({_id: orderId}, {
      $set: {
        'order.active': true,
        'order.shipping': true,
        'order.courier' : 'Courier1'
      }
    });
  },
  addDeposit: function(orderId, amount) {
    return Orders.update({_id: orderId}, {
      $set: {
        'order.deposit': amount
      }
    });
  }
})
