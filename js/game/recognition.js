(function (root) {
  'use strict';

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

  const renderer = root.game.renderer;

  /**
   * Объект для управления распознаованием голоса
   */
  const recognition = {
    /**
     * Инициализирует обработку звука
     */
    init() {
      let recognition = new SpeechRecognition();

      recognition.lang = 'ru-RU';
      recognition.interimResults = false;

      document.querySelector('.city-search__micro').onclick = () => {
        recognition.start();
        renderer.computerSays('Я слушаю...');
      }

      let recognized = false;
      recognition.onresult = event => {
        recognized = true;
        let last = event.results.length - 1;
        let cityName = event.results[last][0].transcript;

        renderer.computerSays(`Вы сказали "${cityName}".`);
        document.querySelector('.city-search__input').value = cityName;

        console.log(`Confidence: ${event.results[0][0].confidence}`);
      }
      // nomatch event работает нестабильно, поэтому если есть результат
      // распознавания — записываем флаг вручную
      recognition.onend = () => {
        if (recognized) return;

        recognized = false;
        renderer.computerSays('Не понимаю...');
      }
      recognition.onspeechend = () => recognition.stop();
      recognition.onerror = () => renderer.computerSays('Не понимаю...');
    }
  }

  root.game.recognition = recognition;
})(this);
