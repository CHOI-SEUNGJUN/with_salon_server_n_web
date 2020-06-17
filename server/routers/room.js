const express = require('express')
const router = express.Router()
const ResponseMessage = require('../utils/ResponseMessage')
const ResponseUtil = require('../utils/ResponseUtil')
const statusCode = require('../utils/statusCode')
const sqlUtil = require('../utils/sqlUtil')



router.get('/api/loadPage/:curPage/:roomName', async(req, res) => {
    let mainSql = `SELECT salon.idx, curPage, pageNum, imageUrl, isQuestion, message FROM room 
    LEFT JOIN salon ON room.category = salon.category 
    WHERE (room.roomName = '${req.params.roomName}' AND pageNum = ${req.params.curPage})`

    let checkSql = `SELECT salon.idx, salon.category FROM room 
    LEFT JOIN salon ON room.category = salon.category
    WHERE (room.roomName = '${req.params.roomName}')`

    let cnt = 0;

    await sqlUtil.sqlQueryPromise(checkSql)
    .then((rows) => {
        if (rows[0].idx === null) res.send(ResponseMessage.ROOM_ERROR)
        else cnt = rows.length
    })
    .catch((err) => {
        console.log('loadPage checkSql Err', err)
        res.send(ResponseMessage.ROOM_ERROR)
    })

    if (cnt >= req.params.curPage && req.params.curPage > 0) {
        await sqlUtil.sqlQueryPromise(mainSql)
        .then((rows) => {
            if (rows.length !== 0) {
                res.status(statusCode.OK).send(
                    ResponseUtil(statusCode.OK, ResponseMessage.ROOM_PAGE_LOAD_SUCCESS, rows[0])
                )
            } else {
                res.status(statusCode.BAD_REQUEST).send(
                    ResponseMessage.ROOM_ERROR
                )
            }
        }) // end of then
        .catch((err) => {
            console.log('loadPage mainsql Err', err)
            res.status(statusCode.INTERNAL_SERVER_ERROR).send(ResponseMessage.ROOM_ERROR)
        })
    } else {
        res.status(statusCode.BAD_REQUEST).send(
            ResponseMessage.ROOM_PAGE_EXCESS
        )
    }
})

router.get('/api/getMaxPage/:roomName', async(req, res) => {
    let checkSql = `SELECT salon.idx, salon.category, room.curPage FROM room 
    LEFT JOIN salon ON room.category = salon.category
    WHERE (room.roomName = '${req.params.roomName}')`

    await sqlUtil.sqlQueryPromise(checkSql)
    .then((rows) => {
        if (rows[0].idx === null) res.send(ResponseMessage.ROOM_ERROR)
        else {
            const cnt = rows.length
            res.status(statusCode.OK).send(
                ResponseUtil(statusCode.OK, ResponseMessage.OK, cnt)
            )
        }
    })
    .catch((err) => {
        console.log('getMaxPage err', err)
        res.send(ResponseMessage.ROOM_ERROR)
    })
})

router.get('/api/getCurPage/:roomName', async(req, res) => {
    let checkSql = `SELECT idx, curPage FROM room WHERE roomName = '${req.params.roomName}'`

    await sqlUtil.sqlQueryPromise(checkSql)
    .then((rows) => {
        if (rows[0].idx === null) res.send(ResponseMessage.ROOM_ERROR)
        else {
            res.status(statusCode.OK).send(
                ResponseUtil(statusCode.OK, ResponseMessage.OK, rows)
            )
        }
    })
    .catch((err) => {
        console.log('getMaxPage err', err)
        res.send(ResponseMessage.ROOM_ERROR)
    })
})

router.post('/api/postCurPage', async(req, res) => {
    let sql = `UPDATE room SET curPage = '${req.body.curPage}' WHERE roomName = '${req.body.roomName}'`
    
    await sqlUtil.sqlQueryPromise(sql)
    .then((result) => {
        if (result.affectedRows === 1) {
            res.status(statusCode.OK).send(ResponseMessage.OK)
        } else {
            res.status(statusCode.BAD_REQUEST).send(ResponseMessage.ROOM_ERROR)
        }
    })
    .catch((err) => {
        console.log('postCurPage', err)
        res.send(ResponseMessage.ROOM_ERROR)
    })
})



module.exports = router