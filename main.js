// main.js
console.log("main script loaded.");

async function getWeather(city) {
  // API 호출 및 데이터 처리
}

function displayWeather(data) {
  // DOM 업데이트 및 UI 조작
}

function handleError(error) {
  // 오류 처리
}

document.querySelector("#searchBtn").addEventListener("click", () => {
  const city = document.querySelector("#cityInput").value;
  getWeather(city).catch(handleError);
});
