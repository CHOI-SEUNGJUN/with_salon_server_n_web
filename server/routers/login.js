const express = require('express')
const router = express.Router()
const ResponseUtil = require('../utils/ResponseUtil')
const statusCode = require('../utils/statusCode')
const sqlUtil = require('../utils/sqlUtil')

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

// router.post('/api/v1/enterRoom', async (req, res) => {
//     console.log(req.body)
//     let roomName = req.body.roomName
//     let password = req.body.password

//     let checkSql = `SELECT salon.idx, salon.category, room.curPage FROM room 
//     LEFT JOIN salon ON room.category = salon.category
//     WHERE (room.roomName = '${roomName}')`

//     let cnt
//     await sqlUtil.sqlQueryPromise(checkSql)
//     .then((rows) => {
//         if (rows === null) {
//             res.status(statusCode.BAD_REQUEST).send(
//                 ResponseUtil(statusCode.BAD_REQUEST, "정확한 방 번호를 입력하세요.", null)
//             ).end()
//             return
//         } else {
//             cnt = rows.length
//         }
//     })
//     .catch((err) => {
//         res.status(statusCode.INTERNAL_SERVER_ERROR).send(
//             ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "Failure", null)
//         ).end()
//         return
//     })

//     await sqlUtil.sqlQueryPromise(`SELECT * FROM room WHERE roomName = '${roomName}'`)
//     .then((room) => {
//         if (room.length === 0) {
//             res.status(statusCode.BAD_REQUEST).send(
//                 ResponseUtil(statusCode.BAD_REQUEST, "정확한 방 번호를 입력하세요.", null)
//             ).end()
//             return;
//         } else if(room[0].password !== password) {
//             res.status(statusCode.BAD_REQUEST).send(
//                 ResponseUtil(statusCode.BAD_REQUEST, "비밀번호가 일치하지 않습니다.", null)
//             ).end()
//             return;
//         } else {
//             console.log("위드 살롱 입장", roomName)
//             res.status(statusCode.OK).send(
//                 ResponseUtil(statusCode.OK, "Salon Enter Success", 
//                     { curPage: room[0].curPage,
//                         maxPage: cnt
//                     }
//                 )
//             ).end()
//             return;
//         }
//     })
//     .catch((err) => {
//         res.status(statusCode.INTERNAL_SERVER_ERROR).send(
//             ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "Failure", null)
//         ).end()
//         console.error(err)
//     })
// })

router.post('/api/v1/enterRoom', async (req, res) => {
    console.log(req.body)
    let roomName = req.body.roomName
    let password = req.body.password

    let checkSql = `SELECT salon.idx, salon.category, room.curPage FROM room 
    LEFT JOIN salon ON room.category = salon.category
    WHERE (room.roomName = '${roomName}')`

    let cnt
    await sqlUtil.sqlQueryPromise(checkSql)
    .then((rows) => {
        if (rows === null) {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "정확한 방 번호를 입력하세요.", null)
            ).end()
            return
        } else {
            cnt = rows.length
        }
    })
    .catch((err) => {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(
            ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "Failure", null)
        ).end()
        return
    })

    await sqlUtil.sqlQueryPromise(`SELECT * FROM room WHERE roomName = '${roomName}'`)
    .then((room) => {
        if (room.length === 0) {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "정확한 방 번호를 입력하세요.", null)
            ).end()
            return;
        } else if(room[0].password !== password) {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "비밀번호가 일치하지 않습니다.", null)
            ).end()
            return;
        } else {
            console.log("위드 살롱 입장", roomName)

            let mainSql = `SELECT pageNum, imageUrl, isQuestion, message FROM room 
            LEFT JOIN salon ON room.category = salon.category 
            WHERE room.roomName = '${roomName}' ORDER BY pageNum ASC`

            let checkSql = `SELECT salon.idx, salon.category FROM room 
            LEFT JOIN salon ON room.category = salon.category
            WHERE (room.roomName = '${roomName}')`

            let cnt = 0;

            sqlUtil.sqlQueryPromise(checkSql)
            .then((rows) => {
                if (rows[0].idx === null) {
                    res.status(statusCode.BAD_REQUEST).send(
                        ResponseUtil(statusCode.BAD_REQUEST, "존재하지 않습니다.", null)
                    ).end()
                    return
                }
                else cnt = rows.length
            })
            .catch((err) => {
                console.log('loadPage checkSql Err', err)
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(
                    ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "Internal server error", null)
                ).end()
                return
            })


            sqlUtil.sqlQueryPromise(mainSql)
            .then((rows) => {
                if (rows.length !== 0) {
                    
                    res.status(statusCode.OK).send(
                        ResponseUtil(statusCode.OK, "Salon Enter Success", rows)
                    ).end()
                    return
                } else {
                    res.status(statusCode.BAD_REQUEST).send(
                        ResponseUtil(statusCode.BAD_REQUEST, "존재하지 않습니다.", null)
                    ).end()
                    return
                }
            }) // end of then
            .catch((err) => {
                console.log('loadPage mainsql Err', err)
                res.status(statusCode.INTERNAL_SERVER_ERROR).send(
                    ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "Internal server error", null)
                ).end()
            })
    

            // res.status(statusCode.OK).send(
            //     ResponseUtil(statusCode.OK, "Salon Enter Success", 
            //         { curPage: room[0].curPage,
            //             maxPage: cnt
            //         }
            //     )
            // ).end()
            // return;
        }
    })
    .catch((err) => {
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(
            ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "Failure", null)
        ).end()
        console.error(err)
    })
})

module.exports = router