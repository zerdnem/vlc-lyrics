const request = require("request");

const url = "http://localhost:8080/requests/status.json";

const options = {
  url,
  auth: {
    username: "",
    password: "1234"
  }
};

module.exports = {
  get: () => {
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) reject("Configure VLC's HTTP Interface first!");
        if (!error && response.statusCode == 200) {
          const result = JSON.parse(body);
          const title = result.information.category.meta.title;
          const artist = result.information.category.meta.artist;
          const album = result.information.category.meta.album;
          const position = result.time;
          const total = result.length;
          const data = { title, artist, album, position, total };
          resolve(data);
        } else {
          reject("Configure VLC's HTTP Interface first!");
        }
      });
    });
  }
};
