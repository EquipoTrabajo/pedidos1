const Order = require('../models/order');
const Office = require('../models/office');
const Package = require('../models/package');
const officeCtrl = require('../controllers/office');
const maxDistance = 200 /6371;
  const request = require('request');

/*const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCh2BCQIB04NNDYyulpIio-mIPK0_ZGAzU'
});
*/

module.exports.addOrder = (req, res, next) => {
  res.render('add-order', {'user': req.user});
}

module.exports.store = async (req, res, next) => {
  Order.create(req.body)
    .then(async (order) => {
      console.log('order emp in: ');
      try {
        let nearestOffice = await officeCtrl.nearestOffice(order.address_deliver.location);

        let assignOrder = await officeCtrl.assignOrder(nearestOffice[0]._id, order);
        return res.json({assignOrder, order});

      } catch(e) {
        return next(e);
      }
    })
    .catch((err) => {
      return next(err);
    });
}


module.exports.update = (req, res, next) => {
  Order.findByIdAndUpdate(req.params.id, req.body).exec()
    .then((order) => {
      return res.json(order);
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.show = (req, res, next) => {
  Order.findById(req.params.id).exec()
    .then((order) => {
      return res.json(order);
    })
    .catch((err) => {
      return next(err);
    });
}


module.exports.changeStatus = (req, res, next) => {
  Order.findById(req.params.id).exec()
    .then(order => {
      Office.findById(req.params.idOffice).populate('wip.orders').exec()
        .then(office => {
          // let ordersLocations = office.wip.orders.map(x => x.address_deliver.location).reduce((x, y) => x + '|' + y);
          let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + order.location[0] + ',' + order.location[1] + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
          request(urlRequest, (err, response) => {
            if (order.state.name === 'En Espera') {
              order.state.name = 'Empacando';
              if (response.body.status === 'OK') {
                if (respose.body.rows.elements.status === 'OK') {
                  office.wip.timeToFinish += response.body.rows.elements.distance.value/60;
                }
              }
              office.wip.timeToFinish += office.packTime;
            } else if (order.state.name === 'Empacando') {
              office.wip.timeToFinish -= office.packTime;
              order.state.name = 'Enviando';
            }
            return Promise.all([order.save(), office.save()]);
          });
        });
    })
    .then(rslts => {
      return res.json(rslts);
    })
    .catch(err => {
      next(err);
    });
}


module.exports.setStatusOnHold = (id, office) => {
  let cantOrders = office.wip.orders.length;
  let status = {
    name: 'En Espera',
    time: office.packTime * (cantOrders/office.settings.packingEmployees)
  }

  return status;
}

module.exports.setStatusPacking = (order, office) => {
  const orderDistance = 1 /6371;

  let getDistanceFromLatLonInKm = (lat1,lon1,lat2,lon2) => {
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

  Package.findOne({'orders.location': {$near: coords, $maxDistance: orderDistance}}).exec()
    .then(package => {
      if (package && package.orders.length < 3) {
        package.orders.push({
          'order': order._id,
          'location': order.location,
          'distance': office.wip.orders[office.wip.orders.findIndex(o => o.order === order._id)].distance,
          'duration': office.wip.orders[office.wip.orders.findIndex(o => o.order === order._id)].duration
        });
        let packageDistance = package.orders.reduce((x, y) => {
          return getDistanceFromLatLonInKm(x.location[0], x.location[1], y.location[0], y.location[1]);
        });
        package.distance = packageDistance;
      } else {
        //create new package TODO
      }

      let status = {
        name: 'Empacando',
        time: office.packTime
      }
      return status;
      
    })
    .catch(err => {
      return err;
    });
}

module.exports.setStatusDelivering = (package, office) => {
  
  let status = {
    name: 'Enviando',
    time: package.timeToFinish
  }
  return status;
}

