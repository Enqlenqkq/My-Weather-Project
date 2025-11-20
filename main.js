// main.js
console.log("main script loaded.");

// 1. HTML 요소 가져오기 (ID가 HTML과 정확히 일치해야 함)
const searchBtn = document.querySelector("#searchBtn");
const cityInput = document.querySelector("#cityInput");
const weatherResultDiv = document.querySelector("#weather-result");

// 2. 버튼 클릭 이벤트 리스너 추가
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value;

  // 입력값 검증
  if (!city) {
    alert("도시 이름을 입력해주세요!");
    return;
  }

  // 3. 데이터 요청 및 표시
  try {
    // Vercel 서버리스 함수(중계기) 호출
    const response = await fetch(`/api/get-weather?city=${city}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("서버 응답 데이터:", data);

    // 4. 화면 업데이트
    weatherResultDiv.innerHTML = `
            <h2>${data.name}의 날씨</h2>
            <p>🌡️ 온도: ${data.main.temp}°C</p>
            <p>☁️ 날씨: ${data.weather[0].description}</p>
        `;
  } catch (error) {
    console.error("에러 발생:", error);
    weatherResultDiv.innerHTML = `<p style="color:red;">날씨 정보를 가져오지 못했습니다.<br>도시 이름을 확인해주세요.</p>`;
  }
});

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
