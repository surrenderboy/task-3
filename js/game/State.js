(function (root) {
  'use strict';

  const ymaps = root.ymaps;

  const HUMAN = root.game.HUMAN;
  const COMPUTER = root.game.COMPUTER;

  const EXCEPTIONS = new Set(['Ы', 'Ь', 'Ъ', 'Ё']);
  const MAX_TRIES = 3;

  class State {
    constructor(citiesCollection) {
      this._citiesCollection = citiesCollection;
      this._humanMoves = new Set();
      this._computerMoves = new Set();
      this._lastCityName = null;
      this._nextLetter = null;
      this._computerTries = 0;
    }

    get nextLetter() {
      return this._nextLetter;
    }

    get lastCityName() {
      return this._lastCityName;
    }

    get humanMoves() {
      return this._humanMoves;
    }

    get computerMoves() {
      return this._computerMoves;
    }

    humanAdd(cityName) {
      if ( this._beginsWithWrongLetter(cityName) ) {
        return Promise.reject(`Надо выбрать город на букву ${this._nextLetter}.`);
      }

      cityName = this._citiesCollection.normalize(cityName);

      if ( !cityName ) {
        return Promise.reject('Я не знаю такого города.');
      }
      if ( this._wasNamed(cityName) ) {
        return Promise.reject('Такой город уже был.');
      }

      return (
        ymaps
          .geocode(cityName)
          .then(res => {
            if (res.metaData.geocoder.found == 0) {
              return Promise.reject('Не могу найти такой город в Яндексе.');
            }

            this._add(cityName, HUMAN);

            return Promise.resolve(res.geoObjects.get(0));
          })
      );
    }

    computerAdd() {
      let cityName;

      while (this._computerTries < MAX_TRIES) {
        cityName = this._citiesCollection.getRandomCity(this._nextLetter);

        if ( this._wasNamed(cityName) ) {
          this._computerTries++;
        } else {
          break;
        }
      }

      if ( this._computerTries >= MAX_TRIES ) {
        return Promise.reject('Я сдаюсь!');
      }

      return (
        ymaps
          .geocode(cityName)
          .then(res => {
            if (res.metaData.geocoder.found == 0) {
              this._computerTries++;
              return this.computerAdd();
            }

            this._add(cityName, COMPUTER);

            return Promise.resolve(res.geoObjects.get(0));
          })
      )
    }

    _add(cityName, player) {
      switch (player) {
        case HUMAN:
          this._humanMoves.add(cityName);
          break;
        case COMPUTER:
          this._computerMoves.add(cityName);
          break;
        default:
          return;
      }

      this._lastCityName = cityName;
      this._nextLetter = findNextLetter(cityName);
    }

    _beginsWithWrongLetter(cityName) {
      if ( !this._nextLetter ) return false;

      let letter = cityName.slice(0, 1).toUpperCase();

      return letter != this._nextLetter;
    }

    _wasNamed(cityName) {
      return (
        this._humanMoves.has(cityName) || this._computerMoves.has(cityName)
      );
    }
  }

  function findNextLetter(cityName) {
    let splitted = cityName.split('');

    for (let i = splitted.length - 1; i >= 0; i--) {
      let letter = splitted[i].toUpperCase();

      if ( !EXCEPTIONS.has(letter) ) return letter;
    }
  }

  root.game.State = State;
})(this);
