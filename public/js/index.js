let socket = io();

socket.on('connect', function () {
    console.log('connected to server');
})

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newMessage', function (message) {
    // console.log('New Message', message);
    const formatedTime = moment(message.createdAt).format('LT');
    const template = document.getElementById('list-item-template').innerHTML;
    const html = Mustache.render(template, {
        from: message.from,
        text: message.text,
        createdAt: formatedTime
    })
    const div = document.createElement('div');
    div.innerHTML = html;
    document.getElementById('messages').appendChild(div);
});

socket.on('newLocationMessage', function (message) {
    // console.log('location Message', message);
    const template = document.getElementById('list-item-location-template').innerHTML;
    const formatedTime = moment(message.createdAt).format('LT');
    const html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formatedTime
    })
    const div = document.createElement('div');
    div.innerHTML = html;
    document.getElementById('messages').appendChild(div);


    // const formatedTime = moment(message.createdAt).format('LT');
    // let listElement = document.createElement('li');
    // let anchorElement = document.createElement('a');
    // anchorElement.setAttribute('target', '_blank');
    // anchorElement.setAttribute('href', message.url);
    // listElement.innerHTML = `${message.from} ${formatedTime} : `;
    // anchorElement.innerText = `Current Location`;
    // listElement.appendChild(anchorElement);
    // document.getElementById('messages').append(listElement);
})


document.getElementById("submit-btn").addEventListener('click', function (e) {
    e.preventDefault();
    let inputText = document.querySelector('input[name="message"]')
    socket.emit('createMessage', {
        from: "Rishabh",
        text: inputText.value,
    }, function (data) {
        console.log("Got it : ", data);
    });
    //clear input
    inputText.value = '';
})

document.getElementById('send-location').addEventListener('click', function (e) {
    e.preventDefault();
    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
    } else {
        console.log('Locating…');
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            socket.emit('createLocationMessage', {
                from: "Rishabh",
                lat,
                lng
            }, function (data) {
                console.log("Got it : ", data);
            });
        }, function (error) {
            console.log('location error', error);
        });
    }
})