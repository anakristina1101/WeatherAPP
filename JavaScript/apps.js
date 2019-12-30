$(document).ready(function() {
  var getDate = function(days) {
    var generateDate = new Date();
    var numberOfDays = days;
    generateDate.setDate(generateDate.getDate() + numberOfDays);

    var dd = generateDate.getDate();
    var mm = generateDate.getMonth() + 1;
    var y = generateDate.getFullYear();

    return mm + "/" + dd + "/" + y;
  };

  //Wind
  var mph = speed => {
    return parseFloat(speed * (3600 / 1609.344)).toFixed(2);
  };

  //Searched cities
  var searchedCities = [];
  if (localStorage.getItem("citysearch")) {
    searchedCities = JSON.parse(localStorage.getItem("citysearch"));
  }

  // API for cities to call
  var apiKey = "714d1a6192b6441412bd19b878646ce2";

  var weatherUpdate = function(cityName, searched) {
    $("#searchError").html("");
    $("#search datalist").html("");

    // First AJAX -gets named
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`,
      success: function(result) {
        // Checks if was sent from searchfield
        if (searched === true) {
          // Checks if value was sent from form field before
          if (searchedCities.includes($("#search input").val()) !== true) {
            searchedCities.push($("#search input").val());
            localStorage.setItem("citysearch", JSON.stringify(searchedCities));
          }

          localStorage.setItem("lastCitySearch", $("#search input").val());
        }

        cityId = result.id;
        // Second AJAX
        $.ajax({
          url: `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&APPID=${apiKey}&units=imperial`,
          success: function(result) {
            // Empties current day info
            $("#currentDay").html("");
            // Sets current day info
            $("#currentDay").append(
              `<div class="blockHeading"><h2>${result.city.name} ( ${getDate(
                0
              )} )</h2><img src="https://openweathermap.org/img/w/${
                result.list[0].weather[0].icon
              }.png" alt="${
                result.list[0].weather[0].description
              }" width='50' height='50'>`
            );
            $("#currentDay").append(
              `<p class="humidity">Temperature: ${result.list[0].main.temp} °C</p>`
            );
            $("#currentDay").append(
              `<p class="humidity"> Humidity: ${result.list[0].main.humidity} %</p>`
            );
            $("#currentDay").append(
              `<p class="uv">Wind Speed:  ${mph(
                result.list[0].wind.speed
              )} MPH</p>`
            );
            // Third AJAX call uses the co-ordinate data from the second to call the uv data
            $.ajax({
              url:
                "https://api.openweathermap.org/data/2.5/uvi?appid=428bbab3989b31eb5f6dd40e0559cbeb&lat=" +
                result.city.coord.lat +
                "&lon=" +
                result.city.coord.lon,
              success: function(result) {
                $("#currentDay").append(
                  `<p class="uv">UV Index: <span>${result.value}</span></p>`
                );
              }
            });

            // 5 Day FC //

            $("#forcast .days").html("");
            // Append forcast data
            for (var i = 1; i <= 5; i++) {
              var forecastBlock = function(i) {
                return (
                  "<div>" +
                  '<p class="date">' +
                  getDate(i) +
                  "</p>" +
                  `<img src="https://openweathermap.org/img/w/${result.list[i].weather[0].icon}.png" alt="${result.list[i].weather[0].description}" "width='50' height='50'>` +
                  `<p class="temperature">Temp: ${result.list[i].main.temp}&nbsp;°C</p>` +
                  `<p class="humidity">Humidity: ${result.list[i].main.humidity}&nbsp;%"</p>` +
                  "</div>"
                );
              };

              $("#forcast .days").append(forecastBlock(i));
            }
          }
        });
      },
      error: function(xhr, ajaxOptions, thrownError) {
        //Error handling
        if ($("#search input").val() === "") {
          $("#searchError").html("* Input Requires a city name.");
        } else {
          $("#searchError").html("* Sorry, City not found.");
        }
      }
    });
  };

  if (localStorage.getItem("lastCitySearch")) {
    weatherUpdate(localStorage.getItem("lastCitySearch"), false);
  } else {
    weatherUpdate("Chicago", false);
  }

  $("#commonCities div").on("click", function() {
    weatherUpdate(
      $(this)
        .html()
        .toString(),
      false
    );
  });

  $("#search button").on("click", function() {
    weatherUpdate($("#search input").val(), true);
  });
});
