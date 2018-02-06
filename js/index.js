(function (root) {
  'use strict';

  const Controller = root.game.Controller;

  Controller
    .ready('map')
    .then(controller => {
      let citySearch = document.querySelector('.city-search');

      citySearch.addEventListener('submit', event => {
        event.preventDefault();

        let input = event.target.querySelector('.input');
        let cityName = input.value;

        controller.makeMove(cityName)
          .then(() => input.value = '')
          .finally(() => input.removeAttribute('disabled'));
      });
    });
})(this);
