const yargs = require("yargs");
const mysql = require("mysql");
var request = require("request");
const fs = require("fs");
require('dotenv').config()

module.exports = {
  DBConnect: function (dbName) {
    var dbURL = process.env.SPOTIFY_AWS;

    if (!dbURL)
      dbURL = "mysql://root:harry4657@localhost:3306/" + dbName;

    // connection = mysql.createConnection({
    //   host: "spotify-aws.cvy6fhmxbnjd.us-east-1.rds.amazonaws.com",
    //   user: "admin",
    //   password: "C8Y78VHjr?sbaMJA",
    //   database: "spotify"
    // });

    connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    return new Promise(function (resolve, reject) {
      connection.connect((error) => {
        if (error) {
          console.log("Error connecting to the database: " + error.name);
          reject(error);
        } else {
          console.log("Connected!");
          resolve(connection);
        }
      });
    });
  },

  wait: function (ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        //console.log("Done waiting");
        resolve(ms);
      }, ms);
    });
  },

  ReadHistory: function (inputFilename) {
    // Return new promise
    return new Promise(function (resolve, reject) {
      // Do async job
      let rawdata = fs.readFileSync(inputFilename);
      let recentPlays = JSON.parse(rawdata);
      console.log(recentPlays);
      resolve(recentPlays);
    });
  },

  CountPlays: (connection) => {
    return new Promise((resolve, reject) => {
      var query = "SELECT COUNT(*) as playCount FROM plays;";

      console.log(query);

      connection.query(query, function (err, result) {
        if (err) {
          console.log("Count Plays error: " + err);

          reject();
        } else {
          resolve(result[0].playCount);
        }
      });
    });
  },

  MostPlayed: (connection, limit, offset) => {
    return new Promise((resolve, reject) => {
      var query =
        "select trackName, artistName, count(*) as times from plays where msPlayed >= 10000 group by trackName, artistName order by times desc LIMIT ? OFFSET ?;";
      var inputs = [limit, offset];

      query = connection.format(query, inputs);

      connection.query(query, function (err, result) {
        if (err) {
          console.log("Most Played error: " + err);

          reject();
        } else {
          resolve(result);
        }
      });
    });
  },

  PlayTime: (connection, limit, offset) => {
    return new Promise((resolve, reject) => {
      var query =
        "select trackName, artistName, sum(msPlayed) as timeListened from plays group by trackname, artistName order by timeListened desc limit ? offset ?;";
      var inputs = [limit, offset];

      query = connection.format(query, inputs);

      connection.query(query, function (err, result) {
        if (err) {
          console.log("Most Played error: " + err);

          reject();
        } else {
          resolve(result);
        }
      });
    });
  },
  TotalPlayTime: (connection) => {
    return new Promise((resolve, reject) => {
      var query = "select sum(msPlayed) as msPlayed from plays;"

      connection.query(query, function (err, result) {
        if (err) {
          console.log("query: " + err);

          reject();
        } else {
          resolve(result[0].msPlayed);
        }
      });
    })
  }
};
