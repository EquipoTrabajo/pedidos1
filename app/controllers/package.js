const Package = require('../models/package');
const Order = require('../models/order');
const Office = require('../models/office');
const request = require('request');

const orderCtrl = require('../controllers/order');



let getDistance = (lat1,lon1,lat2,lon2) => {
  let R = 6371;
  let dLat = deg2rad(lat2-lat1);
  let dLon = deg2rad(lon2-lon1); 
  let a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let d = R * c;
  return d;
}

let deg2rad = (deg) => {
  return deg * (Math.PI/180)
}

module.exports.store = (req, res, next) => {
  const orderDistance = 1 /6371;

  Order.findById(req.params.idOrder).exec()
    .then(order => {
      return Promise.all([
        Office.findById(order.office).exec(),
        Promise.resolve(order),
        Package.findOne({'orders.location': {$near: order.address_deliver.location, $maxDistance: orderDistance}, 'complete': false, 'office.id': order.office}).exec()
      ]);
    })
    .then(rslts => {
      let office = rslts[0];
      let order = rslts[1];
      let package = rslts[2];

      let newOrder = {
        'order': order._id,
        'location': order.address_deliver.location,
        'distance': office.wip.orders[office.wip.orders.findIndex(o => o.order.toString() === order._id.toString())].distance,
        'duration': office.wip.orders[office.wip.orders.findIndex(o => o.order.toString() === order._id.toString())].duration
      }

      if (package && package.orders.length < 3) {
        package.orders.push(newOrder);
      } else {
        package = new Package({
          office: {
            id: office._id,
            location: office.location
          },
          orders: newOrder
        });
      }

      return Promise.all([
        package.save(),
        orderCtrl.setStatusPacking(order, office)
      ]);

    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}


module.exports.completePackage = (id) => {
  return new Promise((resolve, reject) => {
    Package.findById(id).exec()
      .then(package => {
        let orders = package.orders;
        orders.sort((x, y) => {
          return x.distance - y.distance;
        });

        let packageDistance = orders.reduce((x, y) => {
          return getDistance(x.location[0], x.location[1], y.location[0], y.location[1]);
        });

        packageDistance += orders.distance[0];
        let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + package.office.location[0] + ',' + package.office.location[1] + '&destinations=' + orders[orders.length-1].location[0] + ',' + orders[orders.length-1].location[1] + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
        request(urlRequest, (err, response) => {
          if (response.body.status === 'OK') {
            if (respose.body.rows.elements.status === 'OK') {
              package.duration = response.body.rows.map(x => x).elements.reduce((x, y) => {
                return x.duration.value;
              })
            }
          }
          package.timeToFinish = package.duration * 2;
          package.complete = true;
        });


      })
      .catch(err => reject(err));
    
  });

}