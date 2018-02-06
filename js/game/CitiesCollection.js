(function (root) {
  'use strict';

  const CITIES_JSON_PATH = 'cities.json';

  class CitiesCollection {
    constructor() {
      this._cities = {};
    }

    getRandomCity(letter) {
      let arr = this._cities[letter];

      return arr[randomInt(0, arr.length)];
    }

    loadCities() {
      return (
        fetch(CITIES_JSON_PATH)
          .then(res => res.json())
          .then(data => this._cities = data)
      );
    }

    has(cityName) {
      let firstLetter = cityName.slice(0, 1);
      let citiesSet = new Set(this._cities[firstLetter]);

      return citiesSet.has(cityName);
    }
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  root.game.CitiesCollection = CitiesCollection;
})(this);
