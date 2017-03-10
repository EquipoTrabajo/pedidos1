const Office = require('../models/office');
const Order = require('../models/order');


const orderCtrl = require('../controllers/order');

const maxDistance = 80 /6371;
const request = require('request');
const requestretry = require('requestretry');
const GLOBAL_APPLY = false;
const GLOBAL_TIME = 1800;


module.exports.setTimeToFinish = (id) => {
  return new Promise((resolve, reject) => {
    Office.findById(id).populate(['wip.orders.order', 'wip.packages.package']).exec()
      .then(office => {
        let ordersTime = office.settings.packTime * (office.wip.orders.length / office.settings.packingEmployees);
        let packagesTime = office.wip.packages.reduce((x, y) => {
          return x.package.timeToFinish + y.package.timeToFinish;
        });

        office.timeToFinish = ordersTime + packagesTime;

        return office.save();
      })
      .then(rslt => resolve(rslt))
      .catch(err => reject(err));
    
  });
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


module.exports.sendMessage = (req, res, next) => {
  Office.findById(req.user._id).exec()
    .then(office => {
      office.wip.messages.push({
        'order': req.params.idOrder,
        'from': req.user._id,
        'to': req.params.idClient,
        'content': req.body.text
      });
      return office.save();
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}


module.exports.getMessages = (req, res, next) => {
  Office.findById(req.params._id).exec()
    .then(office => {
      let messages = office.wip.messages.filter(x => x.to === req.user._id);
      res.json(messages);
    })
    .catch(err => next(err));
}



module.exports.nearestOffices = (req, res, next) => {
  Order.findById(req.params.idOrder).exec()
    .then(order => {
      return Promise.all([
        Promise.resolve(order),
        Office.find({'location': {$near: order.address_deliver.location, $maxDistance: maxDistance}}).sort({'timeToFinish': -1}).exec()
      ]);
    })
    .then(rslts => {
      let order = rslts[0];
      let offices = rslts[1];

      // console.log('offices near: ', JSON.stringify(offices, null, ' '));
      // console.log('orders near: ', JSON.stringify(order, null, ' '));


      let officeWithProduct = offices.filter(x => {
        let flag = true;
        order.products.forEach(op => {
          if((x.stockProducts.findIndex(o => (o.product.toString() === op.product.toString() && o.stock > op.cant)) < 0) || (x.status !== 'online')){
            flag = false;
          }
        });
        if (flag) {
          return x;
        }
      });
      // console.log('officeWithProduct: ', JSON.stringify(officeWithProduct, null, ' '));
      if (officeWithProduct.length > 0) {
        req.nearestOffices = officeWithProduct;
        req.order = order;
        next();
      } else {
        if (offices.length > 0) {
          order.currentState = 'offline';
        } else {
          order.currentState = 'No encontrado';
        }
        order.save()
          .then(order => res.json({'message': order.currentState}))
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
}

module.exports.assignOrder = (req, res, next) => {
  let idNearestOffices = req.nearestOffices.map(x => x._id);
  let order = req.order;
  
  Office.find({'_id': {$in: idNearestOffices}, 'status': 'online'}).sort({'timeToFinish': 1}).populate('wip.orders').exec()
    .then(offices => {

      console.log('inside assignOrder: ', JSON.stringify(offices, null, ' '));
      console.log('inside assignOrder: ', JSON.stringify(order, null, ' '));
      return new Promise((resolve, reject) => {
        for(let i = 0; i < offices.length; i++) {
          let office = offices[i];
          let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + order.address_deliver.location[0] + ',' + order.address_deliver.location[1] + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
          
          requestretry({
            url: urlRequest,
            json:true,
            maxAttempts: 3,
            retryDelay: 5000,
            fullResponse: false
          })
          .then(response => {
            console.log('response requestretry: ', JSON.stringify(response, null, ' '));
            let distanceMatrixBody = response;
            if (distanceMatrixBody.status === 'OK') {
              if (distanceMatrixBody.rows[0].elements[0].status === 'OK') {
                console.log('elements ok');
                
                if (GLOBAL_APPLY && ((GLOBAL_TIME < office.timeToFinish) && req.body.force === 0)) {
                  resolve({'message': 'El tiempo es mayor..' });
                } else {
                  console.log('else');
                  let flag = true;
                  // let tempEach = order.products.forEach(op => {
                  //   console.log('mmm: ', op);
                  //   if(office.stockProducts.findIdex(o => (o.product.toString() === op.product.toString() && o.stock > op.cant)) < 0){
                  //     console.log('foreach: ');
                  //     flag = false;
                  //   }
                  // });
                  // for(let op of order.products){
                  //   console.log('mmm: ', op);
                  //   if(office.stockProducts.findIdex(o => (o.product.toString() === op.product.toString() && o.stock > op.cant)) < 0){
                  //     console.log('foreach: ');
                  //     flag = false;
                  //   }
                  // }
                  if (flag) {
                    office.wip.orders.push(
                    {
                      'order': req.params.idOrder,
                      'distance': distanceMatrixBody.rows[0].elements[0].distance.value,
                      'duration': distanceMatrixBody.rows[0].elements[0].duration.value
                    });
                    order.office = office._id;

                    resolve(
                      Promise.all([
                        office.save(),
                        order.save()
                      ])
                    );
                  } else {
                    console.log('else i: ', i);
                    if (offices.length >= i+1) {
                      resolve({'message': 'no se pudo asignar a una tienda'});
                    }
                  }
                }
              }
            }
          })
          .catch(err => reject(err));
        }
      });

    })
    .then(rslt => {
      if (rslt.length > 1) {
        let office = rslt[0];
        let order = rslt[1];
        return orderCtrl.setStatusOnHold(order._id, office._id);
      } else {
        return res.json(rslt);
      }
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}

