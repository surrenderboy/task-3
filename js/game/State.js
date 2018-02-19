(function (root) {
  'use strict';

  const ymaps = root.ymaps;

  const citiesCollection = root.game.citiesCollection;

  const HUMAN = root.game.HUMAN;
  const COMPUTER = root.game.COMPUTER;

  const EXCEPTIONS = new Set(['Ы', 'Ь', 'Ъ', 'Ё']);
  const MAX_TRIES = 3;

  /**
   * Класс для доступа к состоянию игры и его изменения
   */
  class State {
    /**
     * Cоздает начальное состояние игры
     */
    constructor() {
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

    /**
     * Изменение состояния игры игроком. При этом проверяются правила игры
     *
     * @param {string} cityName город, введенный игроком
     * @returns {Promise} Возвращает найденный геокодированием объект, если
     *                    введенное слово удовлетворяет правилам игры. Или
     *                    сообщение об ошибке в противном случае.
     */
    humanAdd(cityName) {
      if ( this._beginsWithWrongLetter(cityName) ) {
        return Promise.reject(`Надо выбрать город на букву ${this._nextLetter}.`);
      }

      cityName = citiesCollection.getOriginalCity(cityName);

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


    /**
     * Изменение состояния игры компьютером
     * Если компьютер не может назвать город (либо он был назван, либо он не существует)
     * больше 3 раз, он сдается.
     *
     * @returns {Promise} Возвращает найденный геокодированием объект, если
     *                    введенное слово удовлетворяет правилам игры. Если
     *                    количество попыток найти город превышает 3, возвращает
     *                    сообщение о поражении.
     */
    computerAdd() {
      let cityName;

      while (this._computerTries < MAX_TRIES) {
        cityName = citiesCollection.getRandomCity(this._nextLetter);

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

    /**
     * Добавляет город в список назвашему его игроку, изменяет последнее названное
     * слово и следующую букву
     *
     * @param {string} cityName название города
     * @param {string} player игрок
     */
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

    /**
     * Проверяет, начинается ли город на последнюю букву предыдущего города
     *
     * @param {string} cityName название города
     * @returns {boolean}
     */
    _beginsWithWrongLetter(cityName) {
      if ( !this._nextLetter ) return false;

      let letter = cityName.slice(0, 1).toUpperCase();

      return letter != this._nextLetter;
    }


    /**
     * Проверяет, был ли город назван либо игроком, либо компьютером
     *
     * @param {string} cityName название города
     * @returns {boolean}
     */
    _wasNamed(cityName) {
      return (
        this._humanMoves.has(cityName) || this._computerMoves.has(cityName)
      );
    }
  }

  /**
   * Поиск последней буквы города с пропуском букв-исключений
   *
   * @param {string} cityName название города
   * @returns {string} удовлетворяющая буква
   */
  function findNextLetter(cityName) {
    let splitted = cityName.split('');

    for (let i = splitted.length - 1; i >= 0; i--) {
      let letter = splitted[i].toUpperCase();

      if ( !EXCEPTIONS.has(letter) ) return letter;
    }
  }

  root.game.State = State;
})(this);
