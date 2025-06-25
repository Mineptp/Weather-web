// Constants and initial values
const api_keys = 'dbf08a05c1b4667f462c77f3325380eb';
let day_forecast = 5;
let block_per_day = 8;
let country_curent = 'Ho Chi Minh';
let today_days_of_week = '';

// Entry point
function main() {
	const input_city = document.querySelector('.weather-search__bar--input__country');
	fetchData(country_curent);

	if (input_city) {
		input_city.addEventListener('keypress', function(event) {
			if (event.key === 'Enter') {
				event.preventDefault();
				handleSearch();
			}
		});
	}
}
main();

// Fetch data from APIs
async function fetchData(country) {
	try {
		const response_forecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${country}&appid=${api_keys}`);
		const response_current = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${country}&appid=${api_keys}`);

		if (!response_forecast.ok) {
			alert(" Can't find the country / city. Please check the name again.");
			return;
		}

		const data_fc = await response_forecast.json();
		const data_cur = await response_current.json();

		document.querySelector('.weather-forecast-list').innerHTML = '';
		Contain_All_function(data_cur, data_fc);

	} catch (error) {
		console.error("Error fetching data:", error);
		alert("Failed to load weather data. Please try again later.");
	}
}

// Handle input search
async function handleSearch() {
	const input_data = document.querySelector('.weather-search__bar--input__country').value
	if (!input_data) return;
	console.log(input_data);

	document.querySelector('.weather-search__bar--input__country').value = '';
	country_curent = input_data;
	await fetchData(input_data);
}

// Main processing function after successful fetch
function Contain_All_function(data_cur, data_fc) {
	weather_cur(data_cur);
	proccess_data_forecast(data_fc);
	display_time_date();
	change_background();
}

// Render current weather
function weather_cur(data_cur) {
	const elements = {
		name_main: document.querySelector(".weather-head-information__name--location"),
		name_search: document.querySelector(".weather-search__ouput--location"),
		img: document.querySelector(".weather-head-information__status--icon"), // giữ nguyên nếu class chưa đổi
		pressure: document.querySelector(".weather-current__pressure-content"),
		temp: document.querySelector(".weather-head-information__status--temperature__information__display"),
		temp_feel_like: document.querySelector(".weather-head-information__status--temperture__feel-like"),
		wind: document.querySelector(".weather-current_wind--content"),
		humidity: document.querySelector(".weather-current_humidity--content"),
	};


	const temp = Math.round(data_cur.main.temp - 273);
	const feels_like = Math.round(data_cur.main.feels_like - 273);

	elements.name_main.textContent = `${data_cur.name} / ${data_cur.sys.country}`;
	elements.name_search.textContent = `${data_cur.name}, ${data_cur.sys.country}`;
	elements.img.src = `https://openweathermap.org/img/wn/${data_cur.weather[0].icon}@2x.png`;
	elements.pressure.innerHTML = `<i class="fas fa-gauge icon-pressure"></i> <span>${data_cur.main.pressure} hPa</span>`;
	elements.temp.textContent = `${temp}°`;
	elements.temp_feel_like.textContent = `RealFeel ${feels_like}°`;
	elements.wind.innerHTML = `<i class="fas fa-solid fa-wind icon-wind"></i> <span>${data_cur.wind.speed} m/s</span>`;
	elements.humidity.innerHTML = `<i class="fas fa-solid fa-droplet icon-humidity"></i> <span>${data_cur.main.humidity}%</span>`;
}

// Process and render forecast data
function proccess_data_forecast(data_fc) {
	const forecast_list = data_fc.list;
	const {
		groupedData,
		display_days,
		should_omit_today
	} = filter_display_date(forecast_list);
	const data_display = getDailyMinMax(groupedData);
	const forecast_list_filter = forecast_list.filter(item => item.dt_txt.includes('12:00:00'));

	const today = new Date();
	const dayNumber = today.getDay();
	const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	today_days_of_week = daysOfWeek[dayNumber];

	render_weather_forecast({
		forecast_list_filter,
		groupedData,
		data_display,
		display_days,
		dayNumber,
		should_omit_today,
		daysOfWeek
	}, day_forecast);
}

// Render forecast cards
function render_weather_forecast(data_forecast, day_forecast) {
	let day_calc = data_forecast.display_days[1] ? 0 : 1;

	for (let i = 0; i < day_forecast; i++) {
		const new_div = document.createElement('div');
		new_div.classList.add("weather-forecast-card");

		const day_name = data_forecast.display_days[i] || data_forecast.daysOfWeek[(i + data_forecast.dayNumber + day_calc) % 7];

		new_div.innerHTML = `
            <h4 class="weather-forecast-card__day-of-week">${day_name}</h4>
            <h4 class="weather-forecast-card__date">${Object.keys(data_forecast.groupedData)[i].slice(6, 11)}</h4>
            <img src='https://openweathermap.org/img/wn/${data_forecast.forecast_list_filter[i].weather[0].icon}@2x.png' />
            <div class="weather-forecast-card__information">
                <p class="weather-forecast-card__information--temperture-forecast">
                    <span class="weather-forecast-card__information--max-temperture-forecast">${data_forecast.data_display[i].temper_max}°</span>
                    <span class="weather-forecast-card__information--temperture-forecast-divider"> /</span>
                    <span class="weather-forecast-card__information--min-temperture-forecast">${data_forecast.data_display[i].temper_min}°</span>
                </p>
                <div class="weather-forecast-card__wind-humidity--information">
                    <p><i class="fas fa-solid fa-wind icon-wind"></i> ${data_forecast.data_display[i].wind_speed_min} m/s - ${data_forecast.data_display[i].wind_speed_max} m/s</p>
                    <p><i class="fas fa-solid fa-droplet icon-humidity"></i> ${data_forecast.data_display[i].humidity_min}% - ${data_forecast.data_display[i].humidity_max}%</p>
                </div>
            </div>
        `;

		document.querySelector(".weather-forecast-list").appendChild(new_div);

		if (i === 0) {
			new_div.classList.add("First-element");
			const first_card = document.querySelector(".First-element");
			if (data_forecast.should_omit_today) {
				omit_today(first_card);
			}
		}
	}
}

// Background image switching
function change_background() {
	const now = new Date();
	const hour = now.getHours();
	console.log(hour);
	let path_img = (hour > 18 || hour < 5)
	console.log(path_img);
	if (path_img) {
		path_img = "img/Night.jpg"
		document.querySelector('.weather-head-information__status--temperature__information__display').classList.add('night');
	} else if (hour > 12 && hour <= 18) {
		path_img = "img/Clear_sky_day.jpg"
	} else {
		path_img = "img/sky.jpg"
	}
	document.body.style.backgroundImage = `url("${path_img}")`;
}

// Get current time formatted
function display_time_date() {
	const now = new Date();
	return now.toLocaleString();
}

// Format first day if it's partial
function omit_today(element) {
	element.style.backdropFilter = 'blur(4px)';
	element.style.backgroundColor = 'rgba(18, 17, 17, 0.6)';
	element.style.borderRadius = '2px';
	element.style.padding = '5px 3px';
}

// Group forecast data and decide which days to show
function filter_display_date(data) {
	const groupedData = {};
	let should_omit_today = false;

	data.forEach(item => {
		const date = item.dt_txt.split(' ')[0];
		if (!groupedData[date]) groupedData[date] = [];
		groupedData[date].push(item);
	});

	const allDates = Object.keys(groupedData);
	const first_day = allDates[0];
	let display_days = [];

	if (groupedData[first_day].length < block_per_day) {
		delete groupedData[first_day];
		display_days = ['Tomorrow'];
	} else {
		display_days = ['Today', 'Tomorrow'];
		should_omit_today = true;
	}

	return {
		groupedData,
		display_days,
		should_omit_today
	};
}

// Get min/max per day
function getDailyMinMax(groupedData) {
	return Object.entries(groupedData).map(([date, items]) => {
		const temp_min = items.map(i => i.main.temp_min);
		const temp_max = items.map(i => i.main.temp_max);
		const humidity_data = items.map(i => i.main.humidity);
		const wind_speed_data = items.map(i => i.wind.speed);

		return {
			date,
			temper_min: Math.round(Math.min(...temp_min) - 273),
			temper_max: Math.round(Math.max(...temp_max) - 273),
			humidity_min: Math.min(...humidity_data),
			humidity_max: Math.max(...humidity_data),
			wind_speed_min: Math.min(...wind_speed_data),
			wind_speed_max: Math.max(...wind_speed_data)
		};
	});
}
// Update time every second
setInterval(() => {
	const el = document.querySelector('.weather-head-information__name--now');
	if (el) {
		el.textContent = `${today_days_of_week}, ${display_time_date()}`;
	}
}, 1000);
// update weather every 10 mins
setInterval(() => {
	fetchData(country_curent);
}, 100000);