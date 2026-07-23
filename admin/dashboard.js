function updateDateTime() {

    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const date = now.toLocaleDateString("en-GB", options);

    const time = now.toLocaleTimeString();

    document.getElementById("date").innerHTML = date + "<br>" + time;
}

updateDateTime();

setInterval(updateDateTime, 1000);
