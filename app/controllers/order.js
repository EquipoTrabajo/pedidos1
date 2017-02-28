const Order = require('../models/order');
const Office = require('../models/office');
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

        let assignOrder = await officeCtrl.assignOrder(nearestOffice[0]._id, order._id);
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



