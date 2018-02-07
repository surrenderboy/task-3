(function (root) {
  'use strict';

  const COMPUTER = root.game.COMPUTER;

  const Controller = root.game.Controller;

  Controller
    .ready('map')
    .then(controller => {
      let citySearch = document.querySelector('.city-search');
      let surrenderButton = document.querySelector('.surrender-button');
      let newGameButton = document.querySelector('.new-game-button');

      citySearch.addEventListener('submit', event => {
        event.preventDefault();

        let input = event.target.querySelector('.input');
        let cityName = input.value.trim();

        controller.makeMove(cityName)
          .then(() => input.value = '')
          .finally(() => input.removeAttribute('disabled'));
      });

      surrenderButton.addEventListener('click', () => {
        controller.endGame(COMPUTER);
      });

      newGameButton.addEventListener('click', () => {
        controller.newGame();
      });
    });
})(this);
