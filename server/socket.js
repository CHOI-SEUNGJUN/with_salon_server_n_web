const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3005 ;
const sqlUtil = require('./utils/sqlUtil')

server.listen(port, () => { console.log(`Listening on port ${port}`) });

io.on('connection', (socket) => {
    console.log('사용자 접속:', socket.client.id)

    socket.on('paging', (obj) => {
        console.log(`paging: ${obj.roomName} => `, obj)
        loadInfo(obj.roomName, obj.page)
    })

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName, () => {
            console.log(`${socket.client.id}의 입장 => ${roomName}`)
        })
    })


})

const loadInfo = async(roomName, curPage) => {
    let loadSql = `SELECT salon.idx, curPage, pageNum, imageUrl, isQuestion, message FROM room 
    LEFT JOIN salon ON room.category = salon.category 
    WHERE (room.roomName = '${roomName}' AND pageNum = ${curPage})`
    await sqlUtil.sqlQueryPromise(loadSql)
    .then((res) => {
        console.log('res=====> 로드하였음')
        io.sockets.in(roomName).emit('paging', res)
    })
    .catch((err) => {
        console.log('loadinfo Err', err)
    })
}