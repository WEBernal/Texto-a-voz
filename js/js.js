const voiceOptions = document.querySelector(".voice");
const startButton = document.querySelector(".start");
const cancelButton = document.querySelector(".cancel");
const pitchInput = document.querySelector(".pitch");
const rateInput = document.querySelector(".rate");
const volumeInput = document.querySelector(".volume");

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
  speechSynthesis.speak(message);
});

cancelButton.addEventListener("click", () => speechSynthesis.cancel());