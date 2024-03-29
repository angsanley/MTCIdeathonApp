//Code with 💗 in my kost
//Code with hand in my room

let foo = "";

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('error')) {
    console.log('error');
    alert(urlParams.get('error'));
} else if (urlParams.has('success')) {
    alert('Your file is uploaded');
    console.log('success');
}

const xhr = new XMLHttpRequest();
const url = './api/v1/teams/profile';

xhr.open('GET', url, true);
xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200 || xhr.status === 304) {
            const res = JSON.parse(xhr.response);
            document.querySelector('#team_name').innerHTML = res.response.team_name;
            document.querySelector('#team_leader').innerText = res.response.team_leader;
            document.querySelector('#user_name').innerText = res.response.team_leader;
            document.querySelector('#team_member1').innerText = res.response.team_member1;
            document.querySelector('#team_member2').innerText = res.response.team_member2;
            document.querySelector('#mentor').innerText = res.response.mentor;
        } else if (xhr.status === 401) {
            window.location = '/';
        } else {
            alert("Unknown error");
        }
    }
};
xhr.send();

const xhr1 = new XMLHttpRequest();
const url1 = './api/v1/tasks';

xhr1.open('GET', url1, true);
xhr1.onreadystatechange = () => {
    if (xhr1.readyState === XMLHttpRequest.DONE) {
        if (xhr1.status === 200) {
            let obj = JSON.parse(xhr1.response);
            if (obj.status === 200) obj.response.forEach(addChild);
            console.log('done');
            document.getElementById("task_parent").innerHTML += foo;
            for (let i = 0; i < obj.response.length; ++i) {
                if (obj.response[i].task_accept_submission === 1) {
                    let a = document.getElementById('btn' + obj.response[i].task_id);
                    let c = document.querySelector('#file' + obj.response[i].task_id);
                    if (a) {
                        a.onclick = () => {
                            let b = document.querySelector('#form' + obj.response[i].task_id);
                            if (c) {
                                if (c.files.length === 1) {
                                    b.submit();
                                } else {
                                    alert('File can\'t be empty');
                                }
                            }
                        };
                    }
                    if (c) {
                        c.onchange = () => {
                            let e = document.getElementById('label' + obj.response[i].task_id);
                            if (e) {
                                console.log('ok');
                                e.innerText = c.value.substr(c.value.lastIndexOf('\\') + 1);
                            }
                        };
                    }
                }
            }
        } else {

        }
    }
};
xhr1.send();

// const jeson = '{ "status":200,"response":[ { "task_id":1,"task_name":"Pengumpulan Proposal",'+
//           '"task_description":"Tolong upload proposal yang telah kalian buat dengan format PDF/ZIP.",'+
//           '"task_accept_submission":1, "task_date_from":"2019-09-13T00:00:00.000Z",'+
//           '"task_date_to":"2019-09-15T00:00:00.000Z"},{ "task_id":2,'+
//           '"task_name":"Bersihin Kotoran Kucing di Karpet", "task_description":"Tolong itu eek kucingnya dibuang.",'+
//           '"task_accept_submission":0,"task_date_from":"2019-09-13T00:00:00.000Z",'+
//           '"task_date_to":"2019-09-15T00:00:00.000Z"},{ "task_id":3,'+
//           '"task_name":"Pengumuman List Mentor", "task_description":"Selamat kepada kelompok yang telah lolos pada seleksi tahap I. Berikut adalah list mentor beserta kelompok yang telah dipilih:</br>Team H[Array]: Andre Taulany</br>QB-Team: Kevin</br>Luis Anthonie Alkins</br>OurPriority Group: Handika Limanto</br>LIQUID: Daniel Anadi</br>LIA-TEAM: Davia Belinda Hidayat</br>Reinhart, Andy, Hendry: Arvin</br>Ciwi MAT: Devita Setyaningrum</br>Jaterpok: Jesselyn</br>Team Code RED: Christopher Teddy",'+
//           '"task_accept_submission":0,"task_date_from":"2019-09-13T00:00:00.000Z",'+
//           '"task_date_to":"2019-09-15T00:00:00.000Z"}]}';

function addChild(item, index) {
    // document.getElementById("task_parent").innerHTML +=
    // '<div class="task_content"><h3>'+item.task_name+'</h3><hr>'+item.task_description+
    // submission(item.task_accept_submission,item.task_date_to)+'</div>';
    // const xhr2 = new XMLHttpRequest();
    // const url2 = './api/v1/teams/checksubmission';
    // const params2 = JSON.stringify({
    //     "task_id": item.task_id
    // });
    //
    // xhr2.open('post', url2, true);
    // xhr2.setRequestHeader('content-type', 'application/json');
    // xhr2.onreadystatechange = () => {
    //     if (xhr2.readyState === XMLHttpRequest.DONE) {
    //         if (xhr2.status === 200) {
    //             const exists = JSON.parse(xhr2.response).response.exists;
                foo = '<div class="task_content"><h3>'+item.task_name+'</h3><hr>'+item.task_description+
                    submission(item.task_accept_submission, item.task_date_to, index, item.task_id)+'</div>' + foo;
    //         } else {
    //
    //         }
    //     }
    // };
    // xhr2.send(params2);
}

function submission(validation, deadline, index, taskId) {
    var date = new Date(deadline);
    var submission_date = day(date.getDay()) + ", " + String(date.getDate()) + " " + month(date.getMonth()) + " " + String(date.getFullYear());

    if(validation === 1){
        //for some reason, use client-side validation
        if(date.getTime()<=Date.now()){
            return '<br><br><small><i class="fas fa-ghost" style="margin-right: 8px;"></i>Submission is closed. You are doomed.<i class="fas fa-ghost" style="margin-left: 8px;"></i></small><br><small>Deadline: ' + submission_date + '</small>';
        }
        // else if (!exists) {
            return '<form class="custom-form" id="form' + taskId + '" method="post" enctype="multipart/form-data" action="./api/v1/teams/dosubmission"><div class="submission">' +
                '<input id="file' + taskId + '" class="file-uploader" type="file" name="filetoupload" accept="application/zip">' +
                '<label for="file' + taskId + '"><a class="button">Browse</a></label>' +
                '<label id="label' + taskId + '" class="file-uploader-label">No file selected</label>' +
                '<button type="button" id="btn' + taskId + '" class="button" style="margin-left: 32px;">Upload</button></div>' +
                '<input name="task_id" value="' + taskId + '" hidden> </form>' +
                // '<i class="fas fa-times" style="color: red;"></i>' +
                // '<small style="margin-left: 12px;">Your team has not uploaded the file</small><br>' +
                '<br><small>Deadline: ' + submission_date + '</small>';
        }
        // } else {
        //     return '<form class="custom-form" id="form' + taskId + '" method="post" enctype="multipart/form-data" action="./api/v1/teams/dosubmission"><div class="submission">' +
        //         '<input id="file' + taskId + '" class="file-uploader" type="file" name="filetoupload" accept="application/zip">' +
        //         '<label for="file' + taskId + '"><a class="button">Browse</a></label>' +
        //         '<label class="file-uploader-label">No file selected</label>' +
        //         '<button type="button" id="btn' + taskId + '" class="button" style="margin-left: 32px;">Upload</button></div>' +
        //         '<input name="task_id" value="' + taskId + '" hidden> </form>' +
        //         '<i class="fas fa-check" style="color: green;"></i>' +
        //         '<small style="margin-left: 12px;">Your team has not uploaded the file</small><br>' +
        //         '<small>Deadline: '+submission_date+'</small>';
        // }
    // }

    // else if(validation == 2){
    // return '<div class="submission"><button class="button" style="margin-right:16px">Upload</button> Deadline: '+submission_date+'</div>';
    // }
    
    else{
        return '';
    }
}

let count = 0;
function editProfile() {
    let userName = document.querySelector("#user_name");
    userName.innerText = "mas saya lelah ngoding nya, tolong maafkan ya kalo belum bisa hehehe";

    if (count === 10) {
        userName.innerHTML = "<span style=\"color:red\">You are disqualified!!! :)</span>";
        // awas suara setan
        const linkSuara = "http://soundbible.com/grab.php?id=2019&type=mp3";
        const audio = new Audio(linkSuara).play();
        return;
    } else if (count > 5) alert("WOI JANGAN DIKLIK MULU DONG " + (10 - count));
    ++count;
}