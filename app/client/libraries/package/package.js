if(typeof web3 === 'undefined')
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var deliverdaoContract = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"proposals","outputs":[{"name":"name","type":"bytes32"},{"name":"description","type":"string"},{"name":"creator","type":"address"},{"name":"requestedAmount","type":"uint256"},{"name":"weightedVote","type":"uint256"},{"name":"threshold","type":"uint256"},{"name":"active","type":"bool"},{"name":"successful","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"},{"name":"_value","type":"uint256"},{"name":"_fee","type":"uint256"}],"name":"makeOrder","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_address","type":"address"}],"name":"addCourier","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"takeOrder","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"shippers","outputs":[{"name":"name","type":"bytes32"},{"name":"totalSent","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_description","type":"string"},{"name":"_requestedAmount","type":"uint256"}],"name":"createProposal","outputs":[{"name":"proposal","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_address","type":"address"}],"name":"addShipper","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"voteProposal","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"deliveries","outputs":[{"name":"courier","type":"address"},{"name":"shipper","type":"address"},{"name":"totalValue","type":"uint256"},{"name":"fee","type":"uint256"},{"name":"active","type":"bool"},{"name":"beingShipped","type":"bool"},{"name":"arrived","type":"bool"},{"name":"deposit","type":"uint256"},{"name":"deadline","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"requiredDeposit","outputs":[{"name":"depositAmount","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"deadline","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"couriers","outputs":[{"name":"name","type":"bytes32"},{"name":"reputation","type":"uint256"},{"name":"totalDelivered","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"courierAddr","type":"address"},{"name":"rating","type":"uint256"}],"name":"leaveRating","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"arrived","outputs":[],"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"uint256"}],"name":"newOrder","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"courier","type":"address"}],"name":"orderFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"orderArrived","type":"event"}]);

Template.PackageDetail.onCreated(function() {
  var self = this;
  self.autorun(function() {
    var thisOrder = FlowRouter.getParam('_id');
    self.subscribe('thisOrder', thisOrder);
  });

  this.deposit = new ReactiveVar( false );
});

Template.PackageDetail.events({
  'click #fulfillOrder': function() {
    var orderId = FlowRouter.getParam('_id');
    var thisOrder = Orders.findOne({_id: orderId});

    var deliverdao = deliverdaoContract.at(thisOrder.order.address);


    var orderFulfilled = deliverdao.orderFulfilled({}, {fromBlock: 'latest', toBlock: 'latest'}, function(error, result) {
      if (!error) {
        var timestamp = new Date()
        var domElement = '<li class="timeline_item" event-date="' + timestamp + '"><p class="timeline_title">Order Accepted</p><p class="timeline_content">The order with ID: <strong>' + result.args.id +'</strong> has been accepted by Tim Balter with address ' + result.args.courier + '. Payment is currently being held in Smart Contract Escrow.</p></li>'
        $('.timeline').append(domElement);
      }
    });

    var orderArrived = deliverdao.orderArrived({}, {fromBlock: 'latest', toBlock: 'latest'}, function(error, result) {
      if (!error) {
        var timestamp = new Date()
        var domElement = '<li class="timeline_item" event-date="' + timestamp + '"><p class="timeline_title">Order Arrived</p><p class="timeline_content">Your order has successfully reached its destination. Your payment was payment was successfully sent to the DAO and the Courier.</p></li>'
        $('.timeline').append(domElement);
      }
    });

    deliverdao.requiredDeposit(1, {from: web3.eth.accounts[1], gas: 200000}, function(error, success) {
      console.log(error, success);
      if (!error) {
        deliverdao.takeOrder(1, {from: web3.eth.accounts[1], value: success, gas: 500000}, function(e, s) {
          console.log(e, s);
          if (!e) {
            $('#deliverPackage').remove();
            Meteor.call('setActive', orderId);
          }
        })
      }
    })
  }
})

Template.PackageDetail.helpers({
  'orderData': function() {
    var orderId = FlowRouter.getParam('_id');
    return Orders.findOne({_id: orderId});
  },
  'requiredDeposit': function(orderAddress) {
    var orderId = FlowRouter.getParam('_id');
    var deliverdao = deliverdaoContract.at(orderAddress);

    deliverdao.requiredDeposit(1, {from: web3.eth.accounts[1], gas: 200000}, function(error, success) {
      if (!error) {
        Meteor.call('addDeposit', orderId, success.plus(21).toString(10));
      }
    })
  },
  'fromWei': function(amount) {
    return Math.round(web3.fromWei(amount, 'ether'));
  }
})
