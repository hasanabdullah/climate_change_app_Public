var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../db-config.js');

/* ----- Connects to your mySQL database ----- */
var mysql = require('mysql');
config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* ----- Routers to handle FILE requests ----- */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});

/* ----- Routers to handle data requests ----- */

/* ----- F1 (Dashboard) ----- */

var groupByDate = "GROUP BY date_time";
var groupByMonth = "GROUP BY YEAR(date_time), MONTH(date_time)";
var groupByYear = "GROUP BY YEAR(date_time)";


router.get('/getPrecipitation/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getPrecipitation");
  var startDate =  req.params.startDate; //YYYY-MM-DD format
  var endDate =  req.params.endDate; // not including
  var state = req.params.state; // SA format

  var year = startDate.split("-")[0];
  var year2 = endDate.split("-")[0];

  var groupby = "";

  if(year==year2) {
    groupby = groupByDate;
  }

  else if(parseInt(year2)-parseInt(year) < 16) {
    groupby = groupByMonth;
  }

  else {
    groupby = groupByYear;
  }

  var query =
  `
  select DATE_FORMAT(date_time, "%Y-%m-%d") as x, MAX(prcp) as y from climate_elements
  	WHERE date_time between "${startDate}" and "${endDate}"
  	AND prcp <> -9999
  	AND id IN
  		(select id from stations where state = "${state}")
  	${groupby}
    ORDER BY date_time;
  `;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      res.json(rows);
    }

  });
  console.log("Out /getPrecipitation");
});

router.get('/getMaxTemperature/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getMaxTemperature");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;

  var year = startDate.split("-")[0];
  var year2 = endDate.split("-")[0];

  var groupby = "";

  if(year==year2) {
    groupby = groupByDate;
  }

  else if(parseInt(year2)-parseInt(year) < 16) {
    groupby = groupByMonth;
  }

  else {
    groupby = groupByYear;
  }

  var query =
  `
  select DATE_FORMAT(date_time, "%Y-%m-%d") as x, MAX(tmax) as y from climate_elements
	WHERE date_time between "${startDate}" and "${endDate}"
	AND tmax <> -9999
	AND id IN
		(select id from stations where state = "${state}")
	${groupby}
  ORDER BY date_time;
  `;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      res.json(rows);
    }
  });
  console.log("Out /getMaxTemperature");
});

router.get('/getAvgTemperature/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getAvgTemperature");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;

  var year = startDate.split("-")[0];
  var year2 = endDate.split("-")[0];

  var groupby = "";

  if(year==year2) {
    groupby = groupByDate;
  }

  else if(parseInt(year2)-parseInt(year) < 16) {
    groupby = groupByMonth;
  }

  else {
    groupby = groupByYear;
  }

  var query =
  `
  select DATE_FORMAT(date_time, "%Y-%m-%d") as x, MAX(tavg) as y from climate_elements
	WHERE date_time between "${startDate}" and "${endDate}"
	AND y <> -9999
	AND id IN
		(select id from stations where state = "${state}")
	${groupby}
  ORDER BY date_time;
  `;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      res.json(rows);
    }
  });
  console.log("Out /getAvgTemperature");
});

router.get('/getStormCount/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getStormCount");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;

  var year = startDate.split("-")[0];
  var year2 = endDate.split("-")[0];

  var groupby = "GROUP BY year";
  if(parseInt(year2)-parseInt(year) < 16) {
    groupby = "GROUP BY year, month_name";
  }

  var query =
  `
  select year, month_name, DATE_FORMAT(begin_date_time, "%Y-%m") as x, 
  COUNT(episode_id) as y from (
    select year, month_name, event_type, episode_id, event_id, begin_date_time 
    from storm_details
    WHERE begin_date_time between  "${startDate}" and "${endDate}"
    AND state = "${state}"
    GROUP BY episode_id
    ) t1
    ${groupby};
  `;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      res.json(rows);
    }
  });
  console.log("Out /getStormCount");
});

/* ----- F2 (Dashboard) ----- */
router.get('/getBlizzardAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getBlizzard");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  WITH sd AS(
  SELECT date_time, snwd FROM climate_elements
  WHERE date_time between "${startDate}" and "${endDate}"
    AND snwd <> -9999
    AND id IN
      (select id from stations where state = "${state}")
    AND snwd IN (
      select MAX(snwd) as snwd from climate_elements
      WHERE date_time between "${startDate}" and "${endDate}"
      AND snwd <> -9999
      AND id IN
        (select id from stations where state = "${state}")
    )
  ),
  s AS (
  SELECT episode_id, event_type, MIN(begin_date_time) as begin_date_time, MAX(end_date_time) as end_date_time
  FROM storm_details
  WHERE state = "${state}" AND event_type ='Blizzard'
  AND begin_date_time between "${startDate}" and "${endDate}"
  GROUP BY episode_id
  )
  SELECT s.episode_id, s.event_type, DATE_FORMAT(s.begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(s.end_date_time, '%M %d, %Y') as end_date_time, sd.snwd as value
  FROM s
  JOIN sd
  ON ABS(DATEDIFF(s.end_date_time, sd.date_time)) < 3
  ORDER BY RAND()
  LIMIT 1;
  `;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getBlizzard AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.json(rows);
    }
  });
  console.log("Out /getBlizzard");
});


//F2, 2

router.get('/getDroughtAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getDrought");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  WITH dr AS (
  SELECT MIN(begin_date_time) as begin_date_time, MAX(end_date_time) as end_date_time, episode_id,
  DATEDIFF(MAX(end_date_time), MIN(begin_date_time)) as duration
  FROM storm_details WHERE begin_date_time between "${startDate}" and "${endDate}"
  AND state = "${state}"
  AND event_type='Drought'
  GROUP BY episode_id
  ORDER BY begin_date_time
  )
  SELECT sd.episode_id, sd.event_type, DATE_FORMAT(t1.begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(t1.end_date_time, '%M %d, %Y') as end_date_time, t1.duration AS value
  FROM storm_details sd
  JOIN (
  SELECT * FROM dr
  WHERE duration IN (SELECT MAX(duration) as duration FROM dr)
  ) t1 ON sd.episode_id = t1.episode_id
  GROUP BY episode_id
  ORDER BY RAND()
  LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getDrought AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getDrought");
});


//F2, 3

router.get('/getFloodAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getFlood");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  WITH sd AS(
  SELECT date_time, prcp FROM climate_elements
  WHERE date_time between "${startDate}" and "${endDate}"
    AND prcp <> -9999
    AND id IN
      (select id from stations where state = "${state}")
    AND prcp IN (
      select MAX(prcp) as prcp from climate_elements
      WHERE date_time between "${startDate}" and "${endDate}"
      AND prcp <> -9999
      AND id IN
        (select id from stations where state = "${state}")
    )
  ),
  s AS (
  SELECT episode_id, event_type, MIN(begin_date_time) as begin_date_time, MAX(end_date_time) as end_date_time
  FROM storm_details
  WHERE state = "${state}" AND event_type ='Flood'
  AND begin_date_time between "${startDate}" and "${endDate}"
  GROUP BY episode_id
  )
  SELECT s.episode_id, s.event_type, DATE_FORMAT(s.begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(s.end_date_time, '%M %d, %Y') as end_date_time, sd.prcp as value
  FROM s
  JOIN sd
  ON ABS(DATEDIFF(s.end_date_time, sd.date_time)) < 3
  ORDER BY RAND()
  LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getFlood AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getFlood");
});

//F2, 4

router.get('/getHurricaneAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getHurricane");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  SELECT episode_id, event_type, DATE_FORMAT(begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(end_date_time, '%M %d, %Y') as end_date_time,
  MAX(deaths) as value
  FROM (
  select s.begin_date_time, s.end_date_time, s.event_type, s.episode_id, s.event_id,
  SUM(deaths_direct+deaths_indirect) as deaths from storm_details s
  WHERE begin_date_time between "${startDate}" and "${endDate}"
  AND state = "${state}"
  AND event_type = 'Hurricane (Typhoon)'
  GROUP BY episode_id) t1
  ORDER BY RAND()
  LIMIT 1
  ;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getHurricane AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getHurricane");
});

//F2, 5

router.get('/getIceStormAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getIceStorm");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  select episode_id, event_type, DATE_FORMAT(begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(end_date_time, '%M %d, %Y') as end_date_time, max(damage) as value
  FROM (
  select s.begin_date_time, s.end_date_time, s.event_type, s.episode_id, s.event_id,
  SUM(coalesce(damage_crops,0)+coalesce(damage_property,0)) as damage from storm_details s
  WHERE begin_date_time between "${startDate}" and "${endDate}"
  AND state = "${state}"
  AND event_type='Ice Storm'
  GROUP BY episode_id) t1
  ORDER BY RAND()
  LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getIceStorm AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getIceStorm");
});

//F2, 6

router.get('/getLakeEffectSnowAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getLakeEffectSnow");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  WITH sd AS(
  SELECT date_time, snow FROM climate_elements
  WHERE date_time between "${startDate}" and "${endDate}"
    AND snow <> -9999
    AND id IN
      (select id from stations where state = "${state}")
    AND snow IN (
      select MAX(snow) as snow from climate_elements
      WHERE date_time between "${startDate}" and "${endDate}"
      AND snow <> -9999
      AND id IN
        (select id from stations where state = "${state}")
    )
  ),
  s AS (
  SELECT episode_id, event_type, MIN(begin_date_time) as begin_date_time, MAX(end_date_time) as end_date_time
  FROM storm_details
  WHERE state = "${state}" AND event_type ='Lake-Effect Snow'
  AND begin_date_time between "${startDate}" and "${endDate}"
  GROUP BY episode_id
  )
  SELECT s.episode_id, s.event_type, DATE_FORMAT(s.begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(s.end_date_time, '%M %d, %Y') as end_date_time, sd.snow as value
  FROM s
  JOIN sd
  ON ABS(DATEDIFF(s.end_date_time, sd.date_time)) < 3
   ORDER BY RAND()
   LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getLakeEffectSnow AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getLakeEffectSnow");
});


//F2, 7

router.get('/getTornadoAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getTornado");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  select s.episode_id, s.event_type, DATE_FORMAT(s.begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(s.end_date_time, '%M %d, %Y') as end_date_time, MAX(t.tor_f_scale) as value from storm_details s
  JOIN tornado_details t ON t.episode_id = s.episode_id
  WHERE begin_date_time between "${startDate}" and "${endDate}"
  AND state = "${state}"
  AND event_type='Tornado'
  ORDER BY RAND()
  LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getTornado AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getTornado");
});

//F2, 8

router.get('/getTropicalStormAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getTropicalStorm");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  select episode_id, event_type, DATE_FORMAT(begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(end_date_time, '%M %d, %Y') as end_date_time, max(damage) as value
  FROM (
  select s.begin_date_time, s.end_date_time, s.event_type, s.episode_id, s.event_id,
  SUM(coalesce(damage_crops,0)+coalesce(damage_property,0)) as damage from storm_details s
  WHERE begin_date_time between "${startDate}" and "${endDate}"
  AND state = "${state}"
  AND event_type='Tropical Storm'
  GROUP BY episode_id) t1
  ORDER BY RAND()
  LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getTropicalStorm AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getTropicalStorm");
});

//F2, 9

router.get('/getTsunamiAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getTsunami");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  select episode_id, event_type, DATE_FORMAT(begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(end_date_time, '%M %d, %Y') as end_date_time, max(damage) as value
  FROM (
  select s.begin_date_time, s.end_date_time, s.event_type, s.episode_id, s.event_id,
  SUM(coalesce(damage_crops,0)+coalesce(damage_property,0)) as damage from storm_details s
  WHERE begin_date_time between "${startDate}" and "${endDate}"
  AND state = "${state}"
  AND event_type='Tsunami'
  GROUP BY episode_id) t1
  ORDER BY RAND()
  LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getTsunami AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getTsunami");
});

//F2, 10

router.get('/getWildfireAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getWildfire");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  WITH wf AS (
  SELECT MIN(begin_date_time) as begin_date_time, MAX(end_date_time) as end_date_time, episode_id,
  DATEDIFF(MAX(end_date_time), MIN(begin_date_time)) as duration
  FROM storm_details WHERE begin_date_time between "${startDate}" and "${endDate}"
  AND state = "${state}"
  AND event_type='Wildfire'
  GROUP BY episode_id
  ORDER BY begin_date_time
  )
  SELECT sd.episode_id, sd.event_type, DATE_FORMAT(t1.begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(t1.end_date_time, '%M %d, %Y') as end_date_time, t1.duration as value
  FROM storm_details sd
  JOIN (
  SELECT * FROM wf
  WHERE duration IN (SELECT MAX(duration) as duration FROM wf)
  ) t1 ON sd.episode_id = t1.episode_id
  ORDER BY RAND()
  LIMIT 1;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getWildfire AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getWildfire");
});

//F2, 11

router.get('/getHottestDayAnomaly/:state&:startDate&:endDate', function (req, res) {
  console.log("In /getHottestDay");
  var startDate =  req.params.startDate;
  var endDate =  req.params.endDate;
  var state = req.params.state;
  var query =
  `
  Select NULL as episode_id, 'Hottest Day' as event_type, DATE_FORMAT(date_time, '%M %d, %Y') as begin_date_time,
  DATE_FORMAT(date_time, '%M %d, %Y') as end_date_time, MAX(tmax) as value
  from climate_elements
  WHERE date_time between "${startDate}" and "${endDate}"
  AND tmax <> -9999
  AND id IN
    (select id from stations where state = "${state}");
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getHottestDay AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getHottestDay");
});


//F3

router.get('/getStormDetails/:id', function (req, res) {
  console.log("In /getStormDetails");
  var id =  req.params.id;
  var query =
  `
  WITH t1 AS (
  SELECT s.begin_date_time, s.end_date_time, s.cz_timezone, s.episode_id, s.event_id, s.event_type,
  s.injuries_direct, s.injuries_indirect, s.deaths_direct, s.deaths_indirect, s.damage_crops, s.damage_property,
  s.magnitude, s.magnitude_type, s.flood_cause, s.episode_narrative, s.event_narrative, s.state, sl.location_index,
  sl.center_range, sl.azimuth, sl.location, sl.latitude, sl.longitude
  FROM storm_details s
  LEFT JOIN storm_locations sl ON s.event_id = sl.event_id
  WHERE s.episode_id = "${id}"
  )
  , t3 AS (
  SELECT
  6373*(2* ATAN2(SQRT(POW((SIN(RADIANS(s.latitude) - RADIANS(t1.latitude))/2),2) + COS(RADIANS(s.latitude))*COS(RADIANS(t1.latitude))* POW(SIN((RADIANS(s.longitude) - RADIANS(t1.longitude))/2),2)
  ), SQRT(1-(POW((SIN(RADIANS(s.latitude) - RADIANS(t1.latitude))/2),2) + COS(RADIANS(s.latitude))*COS(RADIANS(t1.latitude))* POW(SIN((RADIANS(s.longitude) - RADIANS(t1.longitude))/2),2)
  )))) as distance,
  s.id, t1.event_id, t1.location_index
  FROM stations s
  JOIN t1
  WHERE s.state = t1.state
  ORDER BY event_id, distance DESC
  )
  , t2 AS (
  SELECT MIN(distance) AS distance, event_id, location_index
  FROM t3
  GROUP BY event_id, location_index
  ), t4 AS (
  SELECT id, event_id, location_index FROM t3 WHERE (distance, event_id, location_index) IN (SELECT * FROM t2)
  )
  SELECT DATE_FORMAT(t5.begin_date_time, '%M %d, %Y') as begin_date_time, DATE_FORMAT(t5.end_date_time, '%M %d, %Y') as end_date_time, t5.cz_timezone, t5.episode_id, t5.event_id, t5.event_type,
    t5.injuries_direct, t5.injuries_indirect, t5.deaths_direct, t5.deaths_indirect, t5.damage_crops, t5.damage_property,
    t5.magnitude, t5.magnitude_type, t5.flood_cause, t5.episode_narrative, t5.event_narrative, t5.state,
    t5.location_index, t5.center_range, t5.azimuth, t5.location, t5.latitude, t5.longitude,
    t5.id, ce.prcp, ce.snow, ce.snwd, ce.tmax, ce.tmin, ce.tavg, ce.tobs
  FROM (
    SELECT t1.begin_date_time, t1.end_date_time, t1.cz_timezone, t1.episode_id, t1.event_id, t1.event_type,
    t1.injuries_direct, t1.injuries_indirect, t1.deaths_direct, t1.deaths_indirect, t1.damage_crops, t1.damage_property,
    t1.magnitude, t1.magnitude_type, t1.flood_cause, t1.episode_narrative, t1.event_narrative, t1.state,
    t1.location_index, t1.center_range, t1.azimuth, t1.location, t1.latitude, t1.longitude,
    t4.id
    FROM t1
    LEFT JOIN t4
    ON t1.event_id = t4.event_id AND t1.location_index = t4.location_index
  ) t5
  LEFT JOIN climate_elements ce
  ON ce.id=t5.id AND DATE_FORMAT(ce.date_time, '%Y-%m-%d') = DATE_FORMAT(t5.end_date_time, '%Y-%m-%d')
  ;
  ` ;

  connection.query(query, function (err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log("In /getStormDetails AF.");
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      console.log("Query Returned: \n" + res);
      console.log(rows);
      res.send(rows);
    }
  });
  console.log("Out /getStormDetails");
});

//dummy query for feature 3


// router.get('/getStormDetails/:id', function (req, res) {
//   console.log("In /getStormDetails");
//   var id =  req.params.id;
//   var query =
//   // query tags has to match the iStormDetails for the values to not be null

//   `
//       SELECT s.begin_date_time, s.end_date_time, s.cz_timezone, s.episode_id, s.event_id, 
//       s.event_type, s.injuries_direct, s.injuries_indirect, s.deaths_direct,
//        s.deaths_indirect,s.damage_crops, s.damage_property, 
//        s.magnitude, s.magnitude_type, s.flood_cause, s.episode_narrative, 
//        s.event_narrative, s.state, sl.location_index, sl.center_range, sl.azimuth, 
//        sl.location, sl.latitude, sl.longitude, 
//       NULL as id, NULL as prcp, NULL as snow, NULL as snwd, NULL as tmax, NULL as tmin, NULL as tavg, 
//       NULL as tobs
//       FROM storm_details s
//       LEFT JOIN storm_locations sl ON s.event_id = sl.event_id
//       WHERE s.episode_id = ${id};

//   ` ;

//   connection.query(query, function (err, rows, fields) {
//     if (err) console.log(err);
//     else {
//       console.log("In /getStormDetails AF.");
//       res.header("Access-Control-Allow-Origin", "*")
//       res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//       console.log("Query Returned: \n" + res);
//       console.log(rows);
//       res.send(rows);
//     }
//   });
//   console.log("Out /getStormDetails");
// });



module.exports = router;
