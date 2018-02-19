(function (root) {
  'use strict';

  const ymaps = root.ymaps;
  const HUMAN = root.game.HUMAN;

  const HUMAN_ICON_PRESET = 'islands#blueStretchyIcon';
  const COMPUTER_ICON_PRESET = 'islands#redStretchyIcon';
  const DEFAULT_ZOOM = 3;

  /**
   * Класс для обработки действий над Яндекс.Картами
   */
  class Map {
    /**
     * Инициализирует Яндекс.Карты
     *
     * @param {string} container контейнер для Яндекс.Карт
     */
    constructor(container) {
      this._map =
        new ymaps.Map(
          container,
          {
            center: [0, 0],
            zoom: DEFAULT_ZOOM,
            controls: []
          },
          {
            maxZoom: DEFAULT_ZOOM,
            suppressMapOpenBlock: true
          }
        );
    }

    /**
     * Создает метку с названием города на картах
     *
     * @param {Object} geoObject гео-объект, полученный при геокодировании
     * @param {string} cityName название города
     * @param {string} player игрок, который ставит метку
     * @returns {Promise} Промис, означающий конец анимации
     */
    createPlacemark(geoObject, cityName, player) {
      let preset = player === HUMAN ? HUMAN_ICON_PRESET : COMPUTER_ICON_PRESET;

      return this._addPlacemark(
        new ymaps.Placemark(
          geoObject.geometry,
          { iconContent: cityName },
          { preset: preset }
        )
      );
    }

    /**
     * Очищает карту
     */
    clear() {
      this._map.geoObjects.removeAll();

      this._map.panTo([0, 0]);

      if (this._map.getZoom() != DEFAULT_ZOOM) {
        this._map.setZoom(DEFAULT_ZOOM, { duration: 500 });
      }
    }

    /**
     * Добавление метки на карту и обработка анимаций
     *
     * @param {Object} placemark объект метки Яндекс.Карт
     * @returns {Promise} Промис, означающий конец анимации
     */
    _addPlacemark(placemark) {
      this._map.geoObjects.add(placemark);

      let promise = this._map.panTo( placemark.geometry.getCoordinates() );

      if (this._map.getZoom() == DEFAULT_ZOOM) return promise;

      return (
        promise.then(() => this._map.setZoom(DEFAULT_ZOOM, { duration: 500 }))
      );
    }
  }

  root.game.Map = Map;
})(this);
