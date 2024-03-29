const connection = require('./conn');
const response = require('./res');
const md5 = require('md5');
const randomString = require('randomstring');
const axios = require('axios');
const fs = require('fs');
const cookie = require('cookie');

exports.registerUser = (req, res) => {
    const nim = req.body.nim;
    const name = req.body.name;
    const password = req.body.password;
    const privilege = req.body.privilege;

    let sql = "SELECT * FROM `users` WHERE `user_nim` = ?";
    connection.query(sql, [nim], (e, r) => {
        if (e) {
            response.notOk(res, "Error occured. (1)");
            console.log(e);
        } else if (r.length === 0) {
            let sql1 = "INSERT INTO `users` (`user_nim`, `user_name`, `user_privilege`, `user_passhash`) VALUES (?, ?, ?, ?)";
            connection.query(sql1, [nim, name, privilege, md5(password)], (e1, r1) => {
                if (e1) {
                    response.notOk(res, "Error occured. (2)");
                    console.log(e1);
                } else {
                    response.ok(res, {"message": "User registered successfully."});
                }
            });
        } else {
            response.notOk(res, "User already registered.")
        }
    });
};

exports.login = (req, res) => {
    const nim = req.body.nim;
    const password = req.body.password;
    const sessionId = md5(randomString.generate());

    let sql = "SELECT * FROM `users` WHERE `user_nim` = ? AND `user_passhash` = ?";
    connection.query(sql, [nim, md5(password)], (e, r) => {
        if (e) {
            response.notOk(res, 'Error occured. (1)');
            console.log(e);
        } else if (r.length === 1) {
            let sql1 = "UPDATE `users` SET `user_session` = ? WHERE `user_nim` = ?";
            connection.query(sql1, [sessionId, nim], (e1, r1) => {
                if (e1) {
                    response.notOk(res, "Error occured. (2)");
                    console.log(e1);
                } else {
                    res.setHeader('Set-Cookie', cookie.serialize('session_id', sessionId, {
                        httpOnly: true,
                        maxAge: 60 * 60 * 24 * 0.5 // 1 week
                    }));
                    // if default password
                    if (password === 'IDEATHON19') {
                        // suruh ganti password
                        response.ok(res, {"session_id": sessionId, "change_password": true});
                    } else {
                        // set kuki
                        response.ok(res, {"session_id": sessionId});
                    }
                }
            });
        } else {
            response.unauthorized(res, "Username or password is invalid.");
        }
    });
};

exports.getTasks = (req, res) => {
    let cookies = cookie.parse(req.headers.cookie || '');
    let sessionId = cookies.session_id;

    let sql = "SELECT * FROM `users` WHERE `user_session` = ?";
    connection.query(sql, [sessionId], (e, r) => {
        if (e) {
            response.notOk(res, 'Error occured. (1)');
            console.log(e);
        } else if (r.length === 1) {
            let sql1 = "SELECT * FROM `tasks`";
            connection.query(sql1, [], (e1, r1) => {
                if (e1) {
                    response.notOk(res, 'Error occured. (2)');
                    console.log(e1);
                } else {
                    response.ok(res, r1);
                }
            });
        } else {
            response.unauthorized(res, 'Unauthorized.');
        }
    });
};

exports.checkFile = (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session_id;
    const taskId = req.body.task_id;
    const path = './uploads/' + taskId + '/';

    let sql = "SELECT `teams`.`team_name` FROM `teams` INNER JOIN `users` ON `users`.`user_nim` = `teams`.`team_leader_nim` WHERE `users`.`user_session` = ?";
    connection.query(sql, [sessionId], (e, r) => {
        if (e) {
            response.notOk('Error occured. (1)');
            console.log(e);
        } else if (r.length === 1) {
            const teamName = r[0].team_name;
            if (fs.existsSync(path + teamName.split(' ').join('_') + '.zip')) {
                response.ok(res, {'exists': true});
            } else {
                response.ok(res, {'exists': false});
            }
        } else {
            response.unauthorized('Session expired.');
        }
    });
};

exports.submitTask = (req, res) => {
    if (!req.file) {
        res.redirect('/dashboard');
    } else {
        const cookies = cookie.parse(req.headers.cookie || '');
        const sessionId = cookies.session_id;
        const taskId = req.body.task_id;
        const path = './uploads/' + taskId + '/';

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        let sql = "SELECT `teams`.`team_name` FROM `teams` INNER JOIN `users` ON `users`.`user_nim` = `teams`.`team_leader_nim` WHERE `users`.`user_session` = ?";
        connection.query(sql, [sessionId], (e, r) => {
            if (e) {
                response.notOk(res, 'Error occurred. (1)');
                console.log(e);
                fs.unlink('./uploads/filetoupload', function(err) {
                    if (err) throw err;
                });
                res.redirect('/dashboard?error=Something went wrong');
            } else if (r.length === 1) {
                const teamName = r[0].team_name;
                if (fs.existsSync(path + teamName.split(' ').join('_') + '.zip')) {
                    fs.unlink(path + '/' + teamName.split(' ').join('_') + '.zip', function(err) {
                        if (err) throw err;
                        if (!fs.existsSync(path)) {
                            fs.mkdirSync(path);
                        }
                        fs.rename('./uploads/filetoupload', path + teamName.split(' ').join('_') + '.zip', function(err) {
                            if (err) throw err;
                        });
                    });
                } else {
                    if (!fs.existsSync(path)) {
                        fs.mkdirSync(path);
                    }
                    fs.rename('./uploads/filetoupload', path + teamName.split(' ').join('_') + '.zip', function(err) {
                        if (err) throw err;
                    });
                }
                res.redirect('/dashboard?success=1');
            } else {
                fs.unlink('./uploads/filetoupload', function(err) {
                    if (err) throw err;
                });
                response.unauthorized(res, 'Session expired.');
                res.redirect('/dashboard?error=You are not authorized');
            }
        });
    }
};

exports.newTeam = (req, res) => {
    const leaderNim = req.body.leader_nim;
    const memberOneNim = req.body.member_one_nim;
    const memberTwoNim = req.body.member_two_nim;
    const teamName = req.body.team_name;

    if (memberOneNim.length !== 10 || memberTwoNim.length !== 10 || leaderNim.length !== 10) {
        response.notOk(res, "Invalid NIM.");
    }

    let sql = "SELECT * FROM `users` WHERE `user_nim` = ? OR `user_nim` = ? OR `user_nim` = ?";
    connection.query(sql, [leaderNim, memberOneNim, memberTwoNim], (e, r) => {
        if (e) {
            response.notOk(res, 'Error occured. (1)');
            console.log(e);
        } else if (r.length === 3) {
            let sql1 = "INSERT INTO `teams` (`team_name`, `team_status`, `team_leader`, `team_member1`, `team_member2`) VALUES (?, 1, ?, ?, ?)";
            connection.query(sql1, [teamName, leaderNim, memberOneNim, memberTwoNim], (e1, r1) => {
                if (e1) {
                    response.notOk(res, 'Error occured. (2)');
                    console.log(e1);
                } else {
                    response.ok(res, {"message": ("Team " + teamName + " created")});
                }
            });
        } else {
            response.notOk(res, 'User not available.');
        }
    });
};

exports.getTeamProfile = (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session_id;

    let sql = "SELECT b.`team_name`, b.`team_status`, b.`team_leader`, b.`team_member1`, b.`team_member2`, b.`mentor` FROM (`users` as a INNER JOIN `teams` as b ON a.`user_nim` = b.`team_leader_nim`) WHERE a.`user_session` = ?";
    connection.query(sql, [sessionId], (e, r) => {
        if (e) {
            response.unauthorized(res, 'Error occurred. (1)');
            console.log(e);
        } else if (r.length === 1) {
            response.ok(res, r[0]);
        } else {
            response.unauthorized(res, 'Unauthorized.');
        }
    });
};

exports.setNewPassword = (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session_id;
    const password = req.body.password;

    let sql = 'UPDATE `users` SET `user_passhash` = ? WHERE `user_session` = ?';
    connection.query(sql, [md5(password), sessionId], (e, r) => {
        if (e) {
            response.unauthorized(res, 'Error occurred. (1)');
            console.log(e);
        } else {
            response.ok(res, {"message": "Password set."})
        }
    });
};

exports.getName = (req, res) => {
    const NIM = req.body.nim;
    axios.post('http://passthrough.mtcbin.us:3001/extractBinusian', {
        nim: NIM
    })
        .then((res1) => {
            response.ok(res, res1.data.response);
        })
        .catch((error) => {
            console.error(error);
            response.notOk(res, error.message);
        })
};

exports.tempSubmitProposal = (req, res) => {
    if (!req.file) {
        res.redirect("/proposalupload?error=Please select a file to upload");
    } else {
        const teamName = req.body.team_name;
        const leaderNim = req.body.leader_nim;
        const leaderName = req.body.leader_name;
        const member1Nim = req.body.member1_nim;
        const member1Name = req.body.member1_name;
        const member2Nim = req.body.member2_nim;
        const member2Name = req.body.member2_name;

        fs.rename('./uploads/filetoupload', './uploads/' + teamName.split(' ').join('_') + '.pdf', function (err) {
            if (err) throw err;
        });

        let sql = 'INSERT INTO `temp_proposal_submit` (`team_name`, `leader_nim`, `leader_name`, `member1_nim`, `member1_name`, `member2_nim`, `member2_name`, `submission`) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)';
        connection.query(sql, [teamName, leaderNim, leaderName, member1Nim, member1Name, member2Nim, member2Name], (e, r) => {
            if (e) {
                res.redirect("/proposalupload?error=An error occured");
                console.log(e);
                fs.unlink('./uploads/' + teamName.split(' ').join('_') + '.pdf', function(err) {
                    if (err) throw err;
                });
            } else {
                res.redirect("/proposalupload?success=1");
            }
        });
    }
};

exports.checkNim = (req, res) => {
    const nim = req.body.nim;

    let sql = 'SELECT * FROM `temp_proposal_submit` WHERE `leader_nim` = ? OR `member1_nim` = ? OR `member2_nim` = ?';
    connection.query(sql, [nim, nim, nim], (e, r) => {
        if (e) {
            response.notOk(res, 'Error occured. (1)');
            console.log(e);
        } else if (r.length === 0) {
            response.ok(res, {"message": 'ok'});
        } else {
            response.ok(res, {"message": "not ok"});
        }
    });
};