(function (root) {
  'use strict';

  const ymaps = root.ymaps;

  const State = root.game.State;
  const Map = root.game.Map;

  const renderer = root.game.renderer;
  const citiesCollection = root.game.citiesCollection;

  const HUMAN = root.game.HUMAN;
  const COMPUTER = root.game.COMPUTER;

  /**
   * Класс для управления игрой: обработка ходов, управления картой и остальным
   * элементами страницы
   */
  class Controller {
    /**
     * Создает экземпляр контроллера
     *
     * @param {string} mapContainer контейнер для инициализации карты
     */
    constructor(mapContainer) {
      this._map = new Map(mapContainer);
      this._state = new State();
    }

    /**
     * Подготовка игры: загрузка Яндекс.Карт и списка городов
     *
     * @param {string} mapContainer контейнер для инициализации карты
     * @return {Promise} Промис, который возвращает экзэмпляр контроллера
     */
    static ready(mapContainer) {
      return (
        Promise
          .all([
            ymaps.ready(),
            citiesCollection.loadCities()
          ])
          .then(() => new Controller(mapContainer))
      );
    }

    /**
     * Обработчик хода игры
     *
     * @param {string} cityName название города, введенного пользователем
     * @return {Promise}
     */
    makeMove(cityName) {
      return (
        new Promise((resolve, reject) => {
          execute( this._makeMove(cityName), resolve, reject );
        })
      );
    }

    /**
     * Обработчик конца игры
     *
     * @param {string} winner победитель
     */
    endGame(winner) {
      renderer.showFinalState(this._state, winner);
    }

    /**
     * Начинает новую игру
     */
    newGame() {
      this._state = new State();
      this._map.clear();

      renderer.reset();
    }

    /**
     * Последовательность при обработке хода игры
     *
     * @param {string} cityName название города, введенного пользователем
     */
    *_makeMove(cityName) {
      let geoObject;

      renderer.computerSays('Хм...')

      try {
        geoObject = yield this._state.humanAdd(cityName);
      } catch(e) {
        renderer.computerSays(e);

        return;
      }

      yield this._map.createPlacemark(geoObject, this._state.lastCityName, HUMAN);

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

  /**
   * Вспомогательная функция для обработки функций-генераторов, возвращающих
   * промисы. Итерируется по генератору, на каждой итерации вызывает генератор
   * со значением, полученным из промиса, возвращенного генератором на предыдущей
   * итерации.
   *
   * @param {*function} generator функция-генератор для итерирования
   * @param {function} resolve коллбэк для обработки окончания итерациии
   * @param {function} reject коллбэк для обработки ошибки при итерации
   * @param {*} yieldValue значение для генератора
   */
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
