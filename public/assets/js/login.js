function doSignIn() {
    const xhr = new XMLHttpRequest();
    const url = './api/v1/login';
    const params = JSON.stringify({
        "nim": document.querySelector('#nim').value,
        "password": document.querySelector('#password').value
    });

    xhr.open('POST', url, true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200 || xhr.status === 302) {
                const res = JSON.parse(xhr.response);
                if (!res.response.change_password) window.location = './dashboard';
                else window.location = './newpassword';
            } else {
                document.write(xhr.status);
            }
        }
    };
    xhr.send(params);
}