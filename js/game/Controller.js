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
     * @async
     * @param {string} cityName название города, введенного пользователем
     */
    async makeMove(cityName) {
      let geoObject;

      renderer.computerSays('Хм...')

      try {
        geoObject = await this._state.humanAdd(cityName);
      } catch(e) {
        renderer.computerSays(e);

        return;
      }

      await this._map.createPlacemark(geoObject, this._state.lastCityName, HUMAN);

      try {
        geoObject = await this._state.computerAdd();
      } catch(e) {
        renderer.computerSays(e);
        this.endGame(HUMAN);

        return;
      }

      renderer.showState(this._state);
      renderer.showControls();

      await this._map.createPlacemark(geoObject, this._state.lastCityName, COMPUTER);
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
  }

  root.game.Controller = Controller;
})(this);
