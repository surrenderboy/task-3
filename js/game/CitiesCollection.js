(function (root) {
  'use strict';

  const CITIES_JSON_PATH = 'cities.json';

  class CitiesCollection {
    constructor() {
      this._cities = {};
    }

    getRandomCity(letter) {
      let names = Object.values(this._cities[letter.toUpperCase()]);

      return names[randomInt(0, names.length)];
    }

    loadCities() {
      return (
        fetch(CITIES_JSON_PATH)
          .then(res => res.json())
          .then(data => this._cities = data)
      );
    }

    normalize(cityName) {
      cityName = cityName.toLowerCase().replace(/-/g, ' ');

      let firstLetter = cityName.slice(0, 1).toUpperCase();

      return this._cities[firstLetter][cityName];
    }
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  root.game.CitiesCollection = CitiesCollection;
})(this);
