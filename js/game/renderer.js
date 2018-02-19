(function (root) {
  'use strict';

  const HUMAN = root.game.HUMAN;
  const COMPUTER = root.game.COMPUTER;

  /**
   * Объект для отрисовки различных элементов игры
   */
  const renderer = {
    showState(state) {
      let lastCityName = state.lastCityName;
      let nextLetter = state.nextLetter.toLowerCase();

      let index = lastCityName.lastIndexOf(nextLetter);

      if ( index == -1 ) return;

      this.computerSays(
        `${lastCityName.slice(0, index)}<span class="computer-says__message_accent">${nextLetter}</span>${lastCityName.slice(index + 1)}`
      );
    },

    computerSays(message) {
      let computerSays = document.querySelector('.computer-says');
      let computerSaysMessage = document.querySelector('.computer-says__message');

      computerSaysMessage.innerHTML = message;

      if ( computerSays.classList.contains('game__content_hidden') ) {
        let description = document.querySelector('.description');

        computerSays.classList.remove('game__content_hidden');
        description.classList.add('game__content_hidden');
      }
    },

    showControls() {
      let controls = document.querySelector('.controls');

      if ( controls.classList.contains('game__content_hidden') ) {
        controls.classList.remove('game__content_hidden');
      }
    },

    showFinalState(state, winner) {
      let citySearch = document.querySelector('.city-search');
      citySearch.classList.add('game__content_hidden');

      let surrenderButton = document.querySelector('.surrender-button');
      let newGameButton = document.querySelector('.new-game-button');
      newGameButton.classList.remove('game__content_hidden');
      surrenderButton.classList.add('game__content_hidden');

      let endGame = document.querySelector('.end-game');

      switch (winner) {
        case HUMAN:
          endGame.innerText = 'Вы выиграли! 🏄‍';
          break;
        case COMPUTER:
          endGame.innerText = 'Компьютер выиграл! 🤖'
          break;
        default:
          return;
      }

      endGame.classList.remove('game__content_hidden');
    },

    reset() {
      let endGame = document.querySelector('.end-game');
      let computerSays = document.querySelector('.computer-says');
      let controls = document.querySelector('.controls');
      let description = document.querySelector('.description');
      let citySearch = document.querySelector('.city-search');
      let surrenderButton = document.querySelector('.surrender-button');
      let newGameButton = document.querySelector('.new-game-button');

      endGame.classList.add('game__content_hidden');
      computerSays.classList.add('game__content_hidden');
      controls.classList.add('game__content_hidden');
      newGameButton.classList.add('game__content_hidden');

      description.classList.remove('game__content_hidden');
      citySearch.classList.remove('game__content_hidden');
      surrenderButton.classList.remove('game__content_hidden');
    }
  }

  root.game.renderer = renderer;
})(this)
