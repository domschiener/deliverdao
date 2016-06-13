// Early Proof of Concept
// The DAO part will be added later

contract UserManagement {
  struct Courier {
    bytes32 name;
    uint reputation;
    uint totalDelivered;
  }

  struct Shipper {
    bytes32 name;
    uint totalSent;
  }

  mapping (address => Courier) public couriers;
  mapping (address => Shipper) public shippers;

  function addCourier(bytes32 _name, address _address) {

    Courier newCourier;
    newCourier.name = _name;
    newCourier.reputation = 0;
    newCourier.totalDelivered = 0;

    couriers[_address] = newCourier;
  }

  function addShipper(bytes32 _name, address _address) {

    Shipper newShipper;
    newShipper.name = _name;
    newShipper.totalSent = 0;

    shippers[_address] = newShipper;
  }

  function leaveRating(address courierAddr, uint rating) {
    // Rating is between 0 and 100
    if (rating > 100 || rating < 0) {
      throw;
    }

    couriers[courierAddr].reputation += rating;
  }
}

contract DeliveryManagement is UserManagement {
  struct Delivery {
    address courier;
    address shipper;
    uint totalValue;
    uint fee;
    bool active;
    bool beingShipped;
    bool arrived;
    uint deposit;
    uint deadline;
  }

  mapping (uint => Delivery) public deliveries;

  event newOrder(uint id);
  event orderFulfilled(uint id, address courier);
  event orderArrived(uint id, uint timestamp);

  modifier onlyCourier(uint id) { if (msg.sender == deliveries[id].courier) _ }
  modifier isActive(uint id) { if (deliveries[id].active) _ }

  function makeOrder(uint id, uint _value, uint _fee) {

    if (msg.value < _fee) {
      throw;
    }

    Delivery newDelivery;
    newDelivery.shipper = msg.sender;
    newDelivery.totalValue = _value;
    newDelivery.fee = _fee;
    newDelivery.deposit = 0;
    newDelivery.active = true;
    newDelivery.beingShipped = false;
    newDelivery.arrived = false;
    newDelivery.deposit = 0;
    newDelivery.deadline = block.timestamp + 2 days;

    deliveries[id] = newDelivery;

    newOrder(id);
  }

  function requiredDeposit(uint id) constant returns (uint depositAmount) {

    Courier potentialCourier = couriers[msg.sender];

    uint totalValue = deliveries[id].totalValue;

    // Very basic reputation system
    // If a courier has done less than 1000 reputation, deposit needs to equal to totalValue
    // Else deposit equals half of total value
    if (potentialCourier.reputation < 1000) {
      return totalValue;
    } else if (potentialCourier.reputation >= 1000) {
      return totalValue / 2;
    }
  }

  function takeOrder(uint id) isActive(id) {

    Delivery thisDelivery = deliveries[id];

    if (!thisDelivery.active || thisDelivery.beingShipped) {
      throw;
    }

    if (msg.value == 0) {
      throw;
    }

    Courier thisCourier = couriers[msg.sender];

    if (thisCourier.reputation < 1000 && msg.value < thisDelivery.totalValue) {
      throw;
    } else if (msg.value < thisDelivery.totalValue / 2) {
      throw;
    }

    thisDelivery.courier = msg.sender;
    thisDelivery.deposit = msg.value;
    thisDelivery.beingShipped = true;

    orderFulfilled(id, msg.sender);
  }

  function arrived(uint id)
    onlyCourier(id)
    isActive(id)
  {

    orderArrived(id, block.timestamp);
    payOut(id);
  }

  function payOut(uint id) internal {

    // Pay out the payment to the courier
    Delivery thisDelivery = deliveries[id];
    thisDelivery.courier.send((thisDelivery.fee / 2) + thisDelivery.deposit);

    couriers[thisDelivery.courier].totalDelivered += thisDelivery.totalValue;
    shippers[thisDelivery.shipper].totalSent += thisDelivery.totalValue;

    thisDelivery.active = false;
    thisDelivery.beingShipped = false;
    thisDelivery.arrived = true;
  }

  function deadline(uint id) isActive(id) {

    // If after 48 hours the package has not been delivered, send deposit to shipper
    Delivery thisDelivery = deliveries[id];
    if (block.timestamp >= thisDelivery.deadline && thisDelivery.arrived == false) {
      thisDelivery.shipper.send(thisDelivery.deposit + thisDelivery.fee);
      thisDelivery.active = false;
      thisDelivery.beingShipped = false;
      thisDelivery.arrived = false;
    }
  }
}


contract DeliverDAO is UserManagement, DeliveryManagement {
  struct Proposal {
    bytes32 name;
    string description;
    address creator;
    uint requestedAmount;
    uint weightedVote;
    uint threshold;
    bool active;
    bool successful;
  }

  uint numProposals;

  mapping (uint => Proposal) proposals;

  
}
