const Office = require('../models/office');
const Order = require('../models/order');
const maxDistance = 20 /6371;
const request = require('request');

/*module.exports.nearestOffices = (coords, order) => {
  return new Promise((resolve, reject) => {
    Office.find({'location': {$near: coords, $maxDistance: maxDistance}, 'status': 'online'}).sort({'timeToFinish': -1}).exec()
      .then((offices) => {
        
        let officeWithProduct = offices.filter(x => {
          let flag = true;
          order.products.forEach(op => {
            if(x.stockProducts.findIdex(o => (o.product === op && o.stock > 0)) < 0){
              flag = false;
            }
          });
          if (flag) {
            return x;
          }
        });
        resolve(officeWithProduct);
      })
      .catch((err) => {
        reject(err);
      });
  });
}*/


module.exports.setTimeToFinish = (id) => {
  return new Promise((resolve, reject) => {
    Office.findById(id).populate(['wip.orders.order', 'wip.packages.package']).exec()
      .then(office => {
        let ordersTime = office.packTime * (office.wip.orders.length / office.settings.packingEmployees);
        let packagesTime = office.wip.packages.reduce((x, y) => {
          return x.package.timeToFinish + y.package.timeToFinish;
        });

        office.timeToFinish = ordersTime + packagesTime;

        return office.save();
      })
      .then(rslt => resolve(rslt))
      .catch(err => reject(err));
    
  });

  /*Office.findById(id).populate('wip.orders').exec()
    .then(office => {
      if (office.wip.orders.length > 0) {
        let timePacking = office.wip.orders.length * office.packTime;
        let ordersLocations = office.wip.orders.map(x => x.address_deliver.location).reduce((x, y) => x + '|' + y);
        let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + ordersLocations + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
        request(urlRequest, (err, response) => {
          if (response.body.status === 'OK') {
            if (respose.body.rows.elements.status === 'OK') {
              office.wip.timeToFinish += response.body.rows.elements.distance.value/60;
            }
          }
        });
      }
    })
    .catch(err => {
      return err;
    });*/
}


module.exports.addOffice = (req, res, next) => {
  res.render('add-office');
}


module.exports.store = (req, res, next) => {
  Office.create(req.body)
    .then((office) => {
      return res.json(office);
    })
    .catch((err) => {
      return next(err);
    });
}


module.exports.index = (req, res, next) => {
  Office.findById(req.user.id).populate('wip.orders').exec()
    .then(office => {
      return res.render('view-office', {'office': office});
    })
    .catch(err => {
      return next(err);
    })
}


module.exports.nearestOffices = (req, res, next) => {
  Order.findById(req.params.id).exec()
    .then(order => {
      Office.find({'location': {$near: order.address_deliver.location, $maxDistance: maxDistance}, 'status': 'online'}).sort({'timeToFinish': -1}).exec()
        .then((offices) => {
          
          let officeWithProduct = offices.filter(x => {
            let flag = true;
            order.products.forEach(op => {
              if(x.stockProducts.findIdex(o => (o.product === op && o.stock > 0)) < 0){
                flag = false;
              }
            });
            if (flag) {
              return x;
            }
          });
          return res.json(officeWithProduct);
        })
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.assignOrder = (req, res, next) => {
  Office.find({'_id': req.params.idOffice, 'status': 'online'}).populate('wip.orders').exec()
    .then((office) => {
      office.wip.orders.order.push(req.params.idOrder);

      let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + order.location[0] + ',' + order.location[1] + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
      request(urlRequest, (err, response) => {
        if (response.body.status === 'OK') {
          if (respose.body.rows.elements.status === 'OK') {
            office.wip.orders.distance = response.body.rows.elements.distance.value;
            office.wip.orders.duration = response.body.rows.elements.duration.value;
          }
        }
        return office.save();
      });
    })
    .then(rslt => res.json(rslt))
    .catch((err) => {
      return next(err);
    });
}



/*module.exports.assignOrder = (nearestOffices, order) => {
  return new Promise((resolve, reject) => {
    let idNearestOffices = nearestOffices.map(x => x._id);
    Office.find({'_id': {$in: idNearestOffices}, 'status': 'online'}).populate('wip.orders').exec()
      .then((office) => {
        office.wip.orders.order.push(order._id);

        let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + order.location[0] + ',' + order.location[1] + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
        request(urlRequest, (err, response) => {
          if (response.body.status === 'OK') {
            if (respose.body.rows.elements.status === 'OK') {
              office.wip.orders.distance = response.body.rows.elements.distance.value;
              office.wip.orders.duration = response.body.rows.elements.duration.value;
            }
          }
          return office.save();
        });
      })
      .then(rslt => resolve(rslt))
      .catch((err) => {
        reject(err);
      });
  }); 
}
*/