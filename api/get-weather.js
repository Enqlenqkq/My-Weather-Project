export default async function handler(request, response) {
  const apiKey = process.env.WEATHER_API_KEY;
  const { city, lat, lon, type } = request.query;

  // 기본 URL 설정
  let baseUrl = "https://api.openweathermap.org/data/2.5/";
  let endpoint = "weather";
  let queryParams = `appid=${apiKey}&units=metric&lang=kr`;

  // 요청 타입에 따른 엔드포인트 설정
  if (type === "forecast") endpoint = "forecast";
  else if (type === "air_pollution") endpoint = "air_pollution";

  // 검색 조건 설정 (도시 이름 vs 좌표)
  if (city) {
    queryParams += `&q=${city}`;
  } else if (lat && lon) {
    queryParams += `&lat=${lat}&lon=${lon}`;
  } else {
    return response
      .status(400)
      .json({ error: "도시 이름 또는 좌표가 필요합니다." });
  }

  const apiUrl = `${baseUrl}${endpoint}?${queryParams}`;

  try {
    const fetchResponse = await fetch(apiUrl);
    const data = await fetchResponse.json();

    if (!fetchResponse.ok) {
      return response.status(fetchResponse.status).json(data);
    }
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: "API 요청 실패" });
  }
}
