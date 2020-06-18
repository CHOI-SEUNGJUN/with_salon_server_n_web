const express = require('express')
const router = express.Router()
const ResponseUtil = require('../utils/ResponseUtil')
const statusCode = require('../utils/statusCode')
const sqlUtil = require('../utils/sqlUtil')


router.get('/api/getRoom', async (req, res) => {
    await sqlUtil.sqlQueryPromise('SELECT * FROM room')
    .then((rows) => {
        res.send(rows)
    })
    .catch((err) => {
        res.send("error")
        console.error(err)
    })
})

router.post('/api/checkRoom', async (req, res) => {
    var roomName = req.body.roomName
    var password = req.body.password
    await sqlUtil.sqlQueryPromise(`SELECT * FROM room WHERE roomName = '${roomName}'`)
    .then((room) => {
        console.log(`위드살롱 :: ${roomName}에 누군가가 로그인 시도 중`)
        if (room.length === 0) {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "Input the correct roomname.", "")
            )
        } else if(room[0].password !== password) {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "Wrong Password", "")
            )
        } else {
            res.status(statusCode.OK).send(
                ResponseUtil(statusCode.OK, "Look up Success", room)
            )
        }
    })
    .catch((err) => {
        res.send("error")
        console.error(err)
    })
})

module.exports = router