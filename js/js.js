document.addEventListener("DOMContentLoaded", function() {
  const voiceOptions = document.querySelector(".voice");
  const startButton = document.querySelector(".start");
  const cancelButton = document.querySelector(".cancel");
  const pitchInput = document.querySelector(".pitch");
  const rateInput = document.querySelector(".rate");
  const volumeInput = document.querySelector(".volume");
  const soundwaveImage = document.querySelector("#animated-image");

  speechSynthesis.addEventListener("voiceschanged", () => {
    const voices = speechSynthesis.getVoices();
    const options = voices.map((voice, index) => {
      return `<option value="${index}">${voice.name}</option>`;
    });
    voiceOptions.innerHTML = options.join("");
  });

  startButton.addEventListener("click", () => {
    const text = document.querySelector(".text").value;
    const message = new SpeechSynthesisUtterance(text);
    const index = voiceOptions.selectedIndex;
    message.voice = speechSynthesis.getVoices()[index];
    message.pitch = pitchInput.value;
    message.rate = rateInput.value;
    message.volume = volumeInput.value;

    // Agregar la clase ".animated" para activar la animación al hacer clic en el botón de hablar
    startButton.classList.add("animated");
    soundwaveImage.classList.add("animated");

    // Cuando la locución haya terminado, quitar la clase ".animated" para detener la animación del botón de hablar y de la imagen
    message.onend = () => {
      startButton.classList.remove("animated");
      soundwaveImage.classList.remove("animated");
    };

    speechSynthesis.speak(message);
  });

  cancelButton.addEventListener("click", () => {
    speechSynthesis.cancel();
    startButton.classList.remove("animated"); // Quitar la clase de animación del botón de hablar
    soundwaveImage.classList.remove("animated"); // Quitar la clase de animación de la imagen
  });
});

