const Office = require('../models/office');
const Order = require('../models/order');
const maxDistance = 80 /6371;
const request = require('request');
const requestretry = require('requestretry');
const GLOBAL_APPLY = false;
const GLOBAL_TIME = 1800;

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
  Order.findById(req.params.idOrder).exec()
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
          // return res.json(officeWithProduct);
          if (order.products.length > 0) {
            req.nearestOffices = officeWithProduct;
            req.order = order;
          } else {
            req.nearestOffices = offices;
            req.order = order;
          }
          if (officeWithProduct.length > 0) {
            next();
          } else {
            Office.find({'location': {$near: order.address_deliver.location, $maxDistance: maxDistance}}).sort({'timeToFinish': -1}).exec()
              .then(office => {
                if (office.length > 0) {
                  order.currentState = 'offline';
                } else {
                  order.currentState = 'No encontrado';
                }
                return order.save();
              })
              .then(rslt => res.json(rslt))
              .catch(err => next(err));
          }
        })
        .catch(err => next(err));
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.assignOrder = (req, res, next) => {
  let idNearestOffices = req.nearestOffices.map(x => x._id);
  Office.find({'_id': {$in: idNearestOffices}, 'status': 'online'}).sort({'timeToFinish': 1}).populate('wip.orders').exec()
    .then(offices => {
      
      /*request(urlRequest, (err, response) => {
        if (err) next(err);

        let distanceMatrixBody = JSON.parse(response.body);
        if (distanceMatrixBody.status === 'OK') {
          if (distanceMatrixBody.rows[0].elements[0].status === 'OK') {
            offices.wip.orders.push(
            {
              'order': req.params.idOrder,
              'distance': distanceMatrixBody.rows[0].elements[0].distance.value,
              'duration': distanceMatrixBody.rows[0].elements[0].duration.value
            });
          }
          if (GLOBAL_APPLY) {
            if ((GLOBAL_TIME < offices.timeToFinish) && req.body.force === 0) {
              return Promise.resolve({'message': 'El tiempo es mayor..' });
            } else {
              return offices.save();
            }
          } else {
            return offices.save();
          }
        } else {
          return Promise.resolve({'message': 'Ha un ocurrido un problema al conectarse a la api de google'});
        }
      });*/
      
      for(let i = 0; i < offices.length; i++) {
        let office = offices[i];
        let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + req.order.address_deliver.location[0] + ',' + req.order.address_deliver.location[1] + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';

        requestretry({
          url: urlRequest,
          json:true,
          maxAttempts: 3,
          retryDelay: 5000,
          fullResponse: false
        })
          .then(response => {
            let distanceMatrixBody = response;
            if (distanceMatrixBody.status === 'OK') {
              if (distanceMatrixBody.rows[0].elements[0].status === 'OK') {
                office.wip.orders.push(
                {
                  'order': req.params.idOrder,
                  'distance': distanceMatrixBody.rows[0].elements[0].distance.value,
                  'duration': distanceMatrixBody.rows[0].elements[0].duration.value
                });
              }
              if (GLOBAL_APPLY && ((GLOBAL_TIME < office.timeToFinish) && req.body.force === 0)) {
                return Promise.resolve({'message': 'El tiempo es mayor..' });
              } else {
               if (office.stockProducts.findIndex(o => o.product === order._id && o.stock > 0) >= 0) {
                  return offices.save();
                } else if (offices.length >= i+1 ){
                  return Promise.resolve({'message': 'no se pudo asignar a una tienda'});
                }
              }
            }
          })
          .catch(err => next(err));
        } //end of for
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