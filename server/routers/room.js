const express = require('express')
const router = express.Router()
const ResponseMessage = require('../utils/ResponseMessage')
const ResponseUtil = require('../utils/ResponseUtil')
const statusCode = require('../utils/statusCode')
const sqlUtil = require('../utils/sqlUtil')



router.get('/api/v1/loadPage', async(req, res) => {
    let mainSql = `SELECT pageNum, imageUrl, isQuestion, message FROM room 
    LEFT JOIN salon ON room.category = salon.category 
    WHERE room.roomName = '${req.body.roomName}' ORDER BY pageNum ASC`

    let checkSql = `SELECT salon.idx, salon.category FROM room 
    LEFT JOIN salon ON room.category = salon.category
    WHERE (room.roomName = '${req.body.roomName}')`

    let cnt = 0;

    await sqlUtil.sqlQueryPromise(checkSql)
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


    await sqlUtil.sqlQueryPromise(mainSql)
    .then((rows) => {
        if (rows.length !== 0) {
            
            res.status(statusCode.OK).send(
                ResponseUtil(statusCode.OK, ResponseMessage.ROOM_PAGE_LOAD_SUCCESS, rows)
            )
        } else {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "존재하지 않습니다.", null)
            )
        }
    }) // end of then
    .catch((err) => {
        console.log('loadPage mainsql Err', err)
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(
            ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "Internal server error", null)
        ).end()
    })
    
})

// router.get('/api/getMaxPage/:roomName', async(req, res) => {
//     let checkSql = `SELECT salon.idx, salon.category, room.curPage FROM room 
//     LEFT JOIN salon ON room.category = salon.category
//     WHERE (room.roomName = '${req.params.roomName}')`

//     await sqlUtil.sqlQueryPromise(checkSql)
//     .then((rows) => {
//         if (rows[0].idx === null) res.send(ResponseMessage.ROOM_ERROR)
//         else {
//             const cnt = rows.length
//             res.status(statusCode.OK).send(
//                 ResponseUtil(statusCode.OK, ResponseMessage.OK, cnt)
//             )
//         }
//     })
//     .catch((err) => {
//         console.log('getMaxPage err', err)
//         res.send(ResponseMessage.ROOM_ERROR)
//     })
// })

// router.get('/api/v1/getCurPage', async(req, res) => {
//     let checkSql = `SELECT idx, curPage FROM room WHERE roomName = '${req.body.roomName}'`

//     await sqlUtil.sqlQueryPromise(checkSql)
//     .then((rows) => {
//         if (rows[0].idx === null) res.send(ResponseMessage.ROOM_ERROR)
//         else {
//             res.status(statusCode.OK).send(
//                 ResponseUtil(statusCode.OK, ResponseMessage.OK, rows)
//             )
//         }
//     })
//     .catch((err) => {
//         console.log('getMaxPage err', err)
//         res.send(ResponseMessage.ROOM_ERROR)
//     })
// })

router.put('/api/v1/curPage', async(req, res) => {
    let sql = `UPDATE room SET curPage = '${req.body.curPage}' WHERE roomName = '${req.body.roomName}'`

    let checkSql = `SELECT salon.idx, salon.category, room.curPage FROM room 
    LEFT JOIN salon ON room.category = salon.category
    WHERE (room.roomName = '${req.body.roomName}')`

    let cnt;

    await sqlUtil.sqlQueryPromise(checkSql)
    .then((rows) => {
        if (rows[0].idx === null) {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "넘기지 못하였습니다.", null)
            ).end()
            return
        }
        else {
            cnt = rows.length
        }
    })
    .catch((err) => {
        console.log('getMaxPage err', err)
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(
            ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "넘기지 못하였습니다.", null)
        ).end()
        return
    })


    if (req.body.curPage <= 0) {
        res.status(statusCode.BAD_REQUEST).send(
            ResponseUtil(statusCode.BAD_REQUEST, "첫 페이지입니다.", null)
        ).end()
        return
    }

    if (req.body.curPage >= cnt+1) {
        res.status(statusCode.BAD_REQUEST).send(
            ResponseUtil(statusCode.BAD_REQUEST, "페이지 초과", null)
        ).end()
        return
    }

    await sqlUtil.sqlQueryPromise(sql)
    .then((result) => {
        if (result.affectedRows === 1) {
            res.status(statusCode.OK).send(
                ResponseUtil(statusCode.OK, "Change Success", null)
            )
        } else {
            res.status(statusCode.BAD_REQUEST).send(
                ResponseUtil(statusCode.BAD_REQUEST, "넘기지 못하였습니다.", null)
            )
        }
    })
    .catch((err) => {
        console.log('postCurPage', err)
        res.status(statusCode.INTERNAL_SERVER_ERROR).send(
            ResponseUtil(statusCode.INTERNAL_SERVER_ERROR, "넘기지 못하였습니다.", null)
        )
    })
})



module.exports = router