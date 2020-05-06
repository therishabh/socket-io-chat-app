let socket = io();

socket.on('connect', function () {
    const urlParams = new URLSearchParams(location.search);
    const params = {
        room: urlParams.get('room'),
        name: urlParams.get('name')
    }
    socket.emit('join', params, function (error) {
        if (error) {
            alert(error);
            window.location.href = '/';
        } else {
            console.log('everything is fine')
        }
    })
})

socket.on('updateUserList', function (userList) {
    console.log(userList)
    let ol = document.createElement('ol');
    userList.forEach((item, key) => {
        let li = document.createElement('li');
        li.innerText = item;
        ol.appendChild(li);
    });
    document.getElementById('users').innerHTML = ''
    document.getElementById('users').append(ol);
})

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

function scrollToBottom() {
    document.getElementById('messages').lastElementChild.scrollIntoView()
}

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
    scrollToBottom();
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
    div.innerHTML = html
    document.getElementById('messages').appendChild(div);
    scrollToBottom();
})

socket.on('newTypingMessage', function (message) {
    const typingWrapper = document.getElementById('typing-wrap')
    if (message) {
        let divElement = document.createElement('div');
        divElement.setAttribute('class', 'typing-text');
        divElement.innerText = message;
        typingWrapper.innerHTML = '';
        typingWrapper.appendChild(divElement);
    } else {
        typingWrapper.innerHTML = '';
    }
})


document.getElementById("submit-btn").addEventListener('click', function (e) {
    e.preventDefault();
    let inputText = document.querySelector('input[name="message"]')
    if (inputText.value.trim().length > 0) {
        socket.emit('createMessage', {
            from: "Rishabh",
            text: inputText.value,
        }, function (data) {
            console.log("Got it : ", data);
        });
        //clear input
        inputText.value = '';
    } else {
        alert('Please enter message text')
    }
})

var timeout;
document.querySelector('input[name="message"]').addEventListener('keypress', function (e) {
    if (e.which != 13) {
        socket.emit('createTypingMessage', { typing: true })
        clearTimeout(timeout)
        timeout = setTimeout(function () {
            console.log('foo')
            socket.emit('createTypingMessage', { typing: false })
        }, 3000)
    } else {
        clearTimeout(timeout)
    }
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