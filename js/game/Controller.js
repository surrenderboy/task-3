(function (root) {
  'use strict';

  const ymaps = root.ymaps;

  const CitiesCollection = root.game.CitiesCollection;
  const State = root.game.State;
  const Map = root.game.Map;

  const renderer = root.game.renderer;

  const HUMAN = root.game.HUMAN;
  const COMPUTER = root.game.COMPUTER;

  let citiesCollection = new CitiesCollection();


  class Controller {
    constructor(mapContainer, citiesCollection) {
      this._map = new Map(mapContainer);
      this._state = new State(citiesCollection);
    }

    static ready(mapContainer) {
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

    endGame(winner) {
      renderer.showFinalState(this._state, winner);
    }

    newGame() {
      this._state = new State(citiesCollection);
      this._map.clear();

      renderer.reset();
    }

    *_makeMove(cityName) {
      let geoObject;

      renderer.computerSays('Хм...')

      try {
        geoObject = yield this._state.humanAdd(cityName);
      } catch(e) {
        renderer.computerSays(e);

        return;
      }

      yield this._map.createPlacemark(geoObject, cityName, HUMAN);

      try {
        geoObject = yield this._state.computerAdd();
      } catch(e) {
        renderer.computerSays(e);
        this.endGame(HUMAN);

        return;
      }

      renderer.showState(this._state);
      renderer.showControls();

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
