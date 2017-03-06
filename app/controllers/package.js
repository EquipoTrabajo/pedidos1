const Package = require('../models/package');
const request = require('request');


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

module.exports.store = (order, office) => {
  const orderDistance = 1 /6371;


  package = new Package({
    'office': office._id,
    'orders': order
  });

  return Promise((resolve, reject) => {
    Package.findOne({'orders.location': {$near: coords, $maxDistance: orderDistance}, 'complete': false}).exec()
      .then(package => {
        if (package && package.orders.length < 3) {
          package.orders.push(order);
        } else {
          package = new Package(package);
        }
        return package.save();
      })
      .then(rslts => resolve(rslts))
      .catch(err => reject(err));
  });
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

        let packageDistance += orders.distance[0];
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