document.addEventListener("DOMContentLoaded", function() {
  const voiceOptions = document.querySelector(".voice");
  const startButton = document.querySelector(".start");
  const cancelButton = document.querySelector(".cancel");
  const downloadBtn = document.getElementById("downloadBtn");
  const pitchInput = document.querySelector(".pitch");
  const rateInput = document.querySelector(".rate");
  const volumeInput = document.querySelector(".volume");
  const soundwaveImage = document.querySelector("#animated-image");
  const textArea = document.querySelector(".text");
  
  let audioContext;
  let analyser;
  let scriptProcessor;
  let audioBuffer = [];
  let isRecording = false;

  // Cargar las voces disponibles
  speechSynthesis.addEventListener("voiceschanged", () => {
    const voices = speechSynthesis.getVoices();
    const options = voices.map((voice, index) => {
      return `<option value="${index}">${voice.name}</option>`;
    });
    voiceOptions.innerHTML = options.join("");
  });

  // Inicializar el contexto de audio
  function initAudioContext() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Crear un nodo ScriptProcessor para capturar el audio
    scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    
    // Capturar el audio que se está reproduciendo
    scriptProcessor.onaudioprocess = function(event) {
      if (isRecording) {
        const inputData = event.inputBuffer.getChannelData(0);
        audioBuffer.push(...inputData);
      }
    };

    // Conectar el script processor a la salida de audio del navegador
    try {
      const destination = audioContext.destination;
      scriptProcessor.connect(destination);
      audioContext.createMediaStreamDestination().connect(scriptProcessor);
    } catch (e) {
      console.log("Usando método alternativo de captura");
    }
  }

  // Función para iniciar la grabación de audio del sistema
  function startAudioCapture() {
    initAudioContext();
    audioBuffer = [];
    isRecording = true;
  }

  // Función para detener la grabación
  function stopAudioCapture() {
    isRecording = false;
    
    if (audioBuffer.length > 0) {
      downloadBtn.style.display = "inline-block";
      console.log("Audio capturado:", audioBuffer.length, "muestras");
    }
  }

  // Evento para hablar (Start)
  startButton.addEventListener("click", () => {
    const text = textArea.value.trim();
    
    if (!text) {
      alert("Por favor, ingresa texto para convertir a voz");
      return;
    }

    // Reiniciar el buffer de audio
    startAudioCapture();

    const message = new SpeechSynthesisUtterance(text);
    const index = voiceOptions.selectedIndex;
    message.voice = speechSynthesis.getVoices()[index];
    message.pitch = parseFloat(pitchInput.value);
    message.rate = parseFloat(rateInput.value);
    message.volume = parseFloat(volumeInput.value);

    // Agregar clases de animación
    startButton.classList.add("animated");
    soundwaveImage.classList.add("animated");
    startButton.disabled = true;
    downloadBtn.style.display = "none";

    // Cuando termine la locución
    message.onend = () => {
      stopAudioCapture();
      startButton.classList.remove("animated");
      soundwaveImage.classList.remove("animated");
      startButton.disabled = false;
    };

    speechSynthesis.speak(message);
  });

  // Evento para cancelar
  cancelButton.addEventListener("click", () => {
    speechSynthesis.cancel();
    stopAudioCapture();
    startButton.classList.remove("animated");
    soundwaveImage.classList.remove("animated");
    startButton.disabled = false;
    downloadBtn.style.display = "none";
  });

  // Evento para descargar MP3
  downloadBtn.addEventListener("click", () => {
    if (audioBuffer.length === 0) {
      alert("No hay audio para descargar");
      return;
    }

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = "Procesando...";

    // Crear archivo de audio desde el buffer capturado
    const audioData = new Float32Array(audioBuffer);
    convertToMP3(audioData, audioContext.sampleRate);
  });

  // Función para convertir audio a MP3
  function convertToMP3(audioData, sampleRate) {
    try {
      // Configurar el encoder MP3
      const channels = 1;
      const kbps = 128;
      const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);

      // Dividir el audio en chunks de 1152 muestras (estándar MP3)
      const maxSamples = 1152;
      const int16Data = float32ToInt16(audioData);
      const mp3Data = [];

      // Procesar chunks
      for (let i = 0; i < int16Data.length; i += maxSamples) {
        const chunk = int16Data.slice(i, Math.min(i + maxSamples, int16Data.length));
        const mp3chunk = mp3Encoder.encodeBuffer(chunk);
        
        if (mp3chunk.length > 0) {
          mp3Data.push(new Uint8Array(mp3chunk));
        }
      }

      // Finalizar la codificación
      const finalFrames = mp3Encoder.flush();
      if (finalFrames.length > 0) {
        mp3Data.push(new Uint8Array(finalFrames));
      }

      // Crear blob MP3
      const mp3Blob = new Blob(mp3Data, { type: "audio/mpeg" });
      downloadMP3File(mp3Blob);

      // Restaurar botón
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg> Descargar MP3';

    } catch (error) {
      console.error("Error al convertir a MP3:", error);
      alert("Error al procesar el audio. Intenta de nuevo.");
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg> Descargar MP3';
    }
  }

  // Función para convertir Float32 a Int16
  function float32ToInt16(float32Array) {
    let int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Limitar valores entre -1 y 1
      let sample = Math.max(-1, Math.min(1, float32Array[i]));
      // Convertir a Int16
      int16Array[i] = sample < 0 
        ? sample * 0x8000 
        : sample * 0x7FFF;
    }
    return int16Array;
  }

  // Función para descargar el archivo MP3
  function downloadMP3File(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audio-${new Date().getTime()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
});