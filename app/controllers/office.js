const Office = require('../models/office');
const maxDistance = 20 /6371;
const request = require('request');

module.exports.nearestOffice = (coords) => {
  return new Promise((resolve, reject) => {
    Office.find({'location': {$near: coords, $maxDistance: maxDistance}}).exec()
      .then((office) => {
        console.log('Office in: ');
        console.log(JSON.stringify(office, null, ' '))
        console.log('Office out: ');
        // return office;
        resolve(office);
      })
      .catch((err) => {
        console.log('Office err: ' + err);
        // return err;
        reject(err);
      });
  });
}


module.exports.setTimeToFinish = (id) => {
  Office.findById(id).populate('wip.orders').exec()
    .then(office => {
      if (office.wip.orders.length > 0) {
        let timePacking = office.wip.orders.length * office.packTime;
        let ordersLocations = office.wip.orders.map(x => x.address_deliver.location).reduce((x, y) => x + '|' + y);
        let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + ordersLocations + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
        /*request(urlRequest, (err, response) => {
          if (response.body.status === 'OK') {
            if (respose.body.rows.elements.status === 'OK') {
              office.wip.timeToFinish += response.body.rows.elements.distance.value/60;
            }
          }
        });*/
      }
    })
    .catch(err => {
      return err;
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

module.exports.assignOrder = (id, orderId) => {
  return new Promise((resolve, reject) => {
    Office.findById(id).populate('wip.orders').exec()
      .then((office) => {
        console.log(JSON.stringify(office, null, ' '));
        office.wip.orders.push(orderId);

        
        // if (office.wip.orders.length > 0) {
        //   let ordersLocations = office.wip.orders.map(x => x.address_deliver.location).reduce((x, y) => x + '|' + y);
        //   let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + ordersLocations + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
        //   console.log(urlRequest);
        // }
        // request('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,-73.89188969999998&destinations=40.6860072%2C-73.6334271|40.598566%2C-73.7527626&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY')
        return office.save();
      })
      .then(rslt => resolve(rslt))
      .catch((err) => {
        reject(err);
      });
  }); 
}
