(function (root) {
  'use strict';

  const ymaps = root.ymaps;

  const CitiesCollection = root.game.CitiesCollection;
  const State = root.game.State;
  const Map = root.game.Map;

  const HUMAN = root.game.HUMAN;
  const COMPUTER = root.game.COMPUTER;

  class Controller {
    constructor(mapContainer, citiesCollection) {
      this._map = new Map(mapContainer);
      this._state = new State(citiesCollection);
    }

    static ready(mapContainer) {
      let citiesCollection = new CitiesCollection();

      return (
        Promise
          .all([
            ymaps.ready(),
            citiesCollection.loadCities()
          ])
          .then(() => new Controller(mapContainer, citiesCollection))
      );
    }

    makeMove(cityName) {
      return (
        new Promise((resolve, reject) => {
          execute( this._makeMove(cityName), resolve, reject );
        })
      );
    }

    *_makeMove(cityName) {
      let geoObject;

      try {
        geoObject = yield this._state.humanAdd(cityName);
      } catch(e) {
        alert(e);

        return;
      }

      yield this._map.createPlacemark(geoObject, cityName, HUMAN);

      try {
        geoObject = yield this._state.computerAdd();
      } catch(e) {
        alert(e);
        // this.endGame(HUMAN);

        return;
      }

      // this._renderer.showState(this._state);

      yield this._map.createPlacemark(geoObject, this._state.lastCityName, COMPUTER);
    }
  }

  function execute(generator, resolve, reject, yieldValue) {
    let next = generator.next(yieldValue);

    if (!next.done) {
      next.value.then(
        res => execute(generator, resolve, reject, res),
        err => {
          reject();

          generator.throw(err);
        }
      )
    } else {
      resolve();
    }
  }

  root.game.Controller = Controller;
})(this);
