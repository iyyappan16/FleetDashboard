//Configuration 
const EVENTHUB_CONNECTION_STRING = "Endpoint=sb://hlseventhub-tvk6dvklpv4ne.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=PLomU5AkcVS6XMCi3AUAQqAwSsXAX1KbY6sdSoiuUZ4=";
const EVENTHUB_NAME = "here_api_eventhub";
const HERE_APP_ID = "EbuEzCM30PVYLtSsdtOK";
const HERE_APP_CODE= "atl-trn6cHEDADsbaK2bLQ";
const SAMPLING_TIME_MS = 3000; // 5000 ( ms ) = 5 second
const SKIP_SAMPLES = 3;
var request = require('request');
const {
  EventHubClient
} = require('@azure/event-hubs');

//create eventhub client from given connection string.
const client = EventHubClient.createFromConnectionString(EVENTHUB_CONNECTION_STRING, EVENTHUB_NAME);

//default set to 5 vehicle 
var vehicleCount = 5;
if (process.argv.length > 2 ) {
  if (typeof vehicleCount == 'number') {
    vehicleCount = process.argv[2];
  }
}


var vehicleMap = [];
vehicleMap[0] = {
  "currentLat": 41.834746,
  "currentLon": -87.759434,
  "marker": "circle1",
  "color": "red",
  "number": "1",
  "legend": "Truck1",
  "latLower": 0,
  "latHigher": 1,
  "lonLower": 0,
  "lonHigher": 0
};
vehicleMap[1] = {
  "currentLat": 41.835613,
  "currentLon": -87.7600445,
  "marker": "square1",
  "color": "green",
  "number": "2",
  "legend": "Truck2",
  "latLower": 0,
  "latHigher": 0,
  "lonLower": 1,
  "lonHigher": 2
};
vehicleMap[2] = {
  "currentLat": 41.8375025,
  "currentLon": -87.7627006,
  "marker": "diamond1",
  "color": "yellow",
  "number": "3",
  "legend": "Truck3",
  "latLower": -2,
  "latHigher": -1,
  "lonLower": 0,
  "lonHigher": 1
};
vehicleMap[3] = {
  "currentLat": 41.8338129,
  "currentLon": -87.7587817,
  "marker": "cross1",
  "color": "blue",
  "number": "4",
  "legend": "Truck4",
  "latLower": -2,
  "latHigher": -1,
  "lonLower": 1,
  "lonHigher": 2
};
vehicleMap[4] = {
  "currentLat": 41.8346527,
  "currentLon": -87.7556561,
  "marker": "triangle1",
  "color": "brown",
  "number": "5",
  "legend": "Truck5",
  "latLower": 0,
  "latHigher": 0,
  "lonLower": 0,
  "lonHigher": 1
};
vehicleMap[5] = {
  "currentLat": 41.83655,
  "currentLon": -87.754649,
  "marker": "circle1",
  "color": "blue",
  "number": "6",
  "legend": "Truck6",
  "latLower": 0,
  "latHigher": 1,
  "lonLower": -3,
  "lonHigher": -3
};
vehicleMap[6] = {
  "currentLat": 41.8358081,
  "currentLon": -87.7510883,
  "marker": "square1",
  "color": "blue",
  "number": "7",
  "legend": "Truck7",
  "latLower": -2,
  "latHigher": -1,
  "lonLower": -1,
  "lonHigher": -1
};
vehicleMap[7] = {
  "currentLat": 41.8473103,
  "currentLon": -87.7544601,
  "marker": "dot1",
  "color": "green",
  "number": "8",
  "legend": "Truck8",
  "latLower": -2,
  "latHigher": 0,
  "lonLower": -3,
  "lonHigher": -2
};
vehicleMap[8] = {
  "currentLat": 41.8451062,
  "currentLon": -87.763967,
  "marker": "triangle2",
  "color": "yellow",
  "number": "9",
  "legend": "Truck9",
  "latLower": 1,
  "latHigher": 2,
  "lonLower": -3,
  "lonHigher": -2
};
vehicleMap[9] = {
  "currentLat": 41.8445133,
  "currentLon": -87.7733764,
  "marker": "plus2",
  "color": "white",
  "number": "10",
  "legend": "Truck10",
  "latLower": 1,
  "latHigher": 2,
  "lonLower": 1,
  "lonHigher": 2
};


async function getNearsetRoadLatLon(lat, lon) {
  return new Promise(resolve => {
    var payload1 = '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="MapSource 6.16.3" version="1.1"     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"><trk><trkseg><trkpt';
    var payload2 = '></trkpt></trkseg></trk></gpx>';


    var finalPayLoad = payload1 + " lat=\"" + lat + "\"" + " lon=\"" + lon + "\"" + payload2;
    request.post({
        url: 'https://rme.api.here.com/2/matchroute.json?routemode=car&app_id='+ HERE_APP_ID +' &app_code=' + HERE_APP_CODE,
        body: finalPayLoad,
        headers: {
          'Content-Type': 'text/xml'
        }
      },
      function (error, response, body) {
        try {
          var parsedBody = JSON.parse(body);
          var jsonObject = {};
          jsonObject.latMatched = parsedBody.TracePoints[0].latMatched;
          jsonObject.lonMatched = parsedBody.TracePoints[0].lonMatched;
          resolve(jsonObject);
        }
        catch(error)
        {
          //console.log("Error: " + error);
          var jsonObject = {};
          jsonObject.latMatched = lat;
          jsonObject.lonMatched = lon;
          resolve(jsonObject);
        }
        
      });
  });
}

function chooseRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function generateVehicleData(key) {

  let jsonresp = await getNearsetRoadLatLon(vehicleMap[key].currentLat, vehicleMap[key].currentLon);
  let nextLat = jsonresp.latMatched + chooseRandomNumber(vehicleMap[key].latLower, vehicleMap[key].latHigher) / 10000;
  let nextLon = jsonresp.lonMatched + chooseRandomNumber(vehicleMap[key].lonLower, vehicleMap[key].lonHigher) / 10000;

  if (vehicleMap[key].currentLat == nextLat &&  vehicleMap[key].currentLon == nextLon ) {
    //Vehicle is stuck into same position in simulatoion, trying to move it a little far .
    vehicleMap[key].currentLat = jsonresp.latMatched + chooseRandomNumber(vehicleMap[key].latLower + 1 , vehicleMap[key].latHigher + 1) / 10000;
    vehicleMap[key].currentLon = jsonresp.lonMatched + chooseRandomNumber(vehicleMap[key].lonLower + 1 , vehicleMap[key].lonHigher + 1) / 10000;
  }
  else {
    vehicleMap[key].currentLat = nextLat;
    vehicleMap[key].currentLon = nextLon;
  }

  console.log(jsonresp.latMatched + " " + jsonresp.lonMatched + " " + vehicleMap[key].marker + " " + vehicleMap[key].color + " " + vehicleMap[key].number + " " + vehicleMap[key].legend);

  //prepare ehub-msg;
  var url = "/6.2/reversegeocode.json?prox=" + vehicleMap[key].currentLat + "%2C" + vehicleMap[key].currentLon + "%2C250&mode=retrieveAddresses&maxresults=1&gen=9";
  var ehMsg = {};
  ehMsg.uid = "uid_geocode_v_" + key + "_" + (Math.round(new Date() / 1000)).toString();
  ehMsg.api = "geocoder";
  ehMsg.url = url;
  ehMsg.method = "get";

  ehMsg.vehicleId = vehicleMap[key].legend;
  ehMsg.latMatched = jsonresp.latMatched;
  ehMsg.lonMatched = jsonresp.lonMatched;
  ehMsg.engineTemperature = chooseRandomNumber(55, 100);
  ehMsg.engineRPM = chooseRandomNumber(2000, 8000);
  ehMsg.engineLoad = chooseRandomNumber(5, 100);
  ehMsg.coolantTemperature = chooseRandomNumber(50, 200);

  const data = {
    body: ehMsg
  };

  //send to event-hub .
  client.send(data);

}

//Generate data for given number of vehicle every 'X' seconds as configured.
for (var key = 0; key < vehicleCount; key++) {
  setInterval(generateVehicleData, SAMPLING_TIME_MS, key);
}
