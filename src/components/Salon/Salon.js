import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Salon.css'
import Urls from '../../utils/Urls'
import { withRouter, useLocation } from 'react-router-dom';
import socketio from 'socket.io-client'

function Salon() {

    const [isLoading, setIsLoading] = useState(false)
    const [imageUrl, setImageUrl] = useState(null)

    const [roomName, setRoomName] = useState(null)
    const [curPage, setCurPage] = useState(null)
    const [maxCount, setMaxCount] = useState(1)
    const [isQuestion, setIsQuestion] = useState(false)
    const [message, setMessage] = useState(null)

    const [socket, setSocket] = useState(null)

    const location = useLocation()
    
    useEffect(() => {
        if (socket !== null) {
            socket.emit('joinRoom', roomName)

            socket.on('paging', (obj) => {
                console.log("obj", obj[0].imageUrl)
                
                setCurPage(obj[0].pageNum)
                setImageUrl(obj[0].imageUrl)

                if (obj[0].isQuestion === 1) {
                    setIsQuestion(true)
                } else if (isQuestion !== 0 && obj[0].isQuestion === 0) {
                    setIsQuestion(false)
                }
    
                if (obj[0].message !== null) {
                    setMessage(obj[0].message)
                } else {
                    setMessage(null)
                }
            })
        }
        
    }, [socket])

    useEffect(() => {
        setRoomName(location.state.roomName)
        //setCurPage(location.state.curPage)
    }, [location])

    useEffect(() => {
        if(roomName !== null) {
            console.log('room not null', roomName)
            getMaxPage()
            getCurPage(roomName)
            setSocket(socketio.connect(`${Urls.SOCKET_URL}`))

        }
    }, [roomName])

    useEffect(() => {
        if (curPage !== null) {
            loadPage(roomName, curPage)
        }
    }, [curPage])

    useEffect(() => {
        return () => setIsLoading(false)
    })

    const loadPage = async (_roomName, _curPage) => {
        setIsLoading(true)
        await axios.get(`${Urls.BASE_URL}${Urls.END_LOAD_PAGE}/${_curPage}/${_roomName}`)
        .then((res) => {
            setImageUrl(res.data.data.imageUrl)

            if (res.data.data.isQuestion === 1) {
                setIsQuestion(true)
            } else if (isQuestion !== 0 && res.data.data.isQuestion === 0) {
                setIsQuestion(false)
            }

            if (res.data.data.message !== null) {
                setMessage(res.data.data.message)
            } else {
                setMessage(null)
            }
        })
        .catch((err) => {
            alert('Error: Call me(010-4568-7179)')
        })
        setIsLoading(false)
    }

    const getMaxPage = async () => {
        await axios.get(`${Urls.BASE_URL}${Urls.END_MAX_PAGE}/${roomName}`)
        .then((res) => {
            if (res.status === 200) {
                setMaxCount(res.data.data)
            } else {
                alert(`error`)
            }
        })
        .catch((err) => {
            alert(`error`)
        })
    }

    const getCurPage = async (_reqRoom) => {
        await axios.get(`${Urls.BASE_URL}${Urls.END_GET_CURPAGE}/${_reqRoom}`)
        .then((res) => {
            if (res.status === 200) {
                console.log('****curpage', res.data.data[0].curPage)
                setCurPage(res.data.data[0].curPage)
            }
        })
        .catch((err) => {
            console.log('getCurPage err', err)
            alert(`error`)
        })
    }

    const leftClick = () => {
        if (curPage !== 1) {
            console.log('curpage-1**', curPage-1)
            socket.emit('paging', {roomName: roomName, page: `${curPage-1}`})
            postCurPage(curPage-1)
            setCurPage(curPage-1)
        } else {
            alert(`첫 페이지입니다!`)
        }
    }

    const rightClick = () => {
        if (curPage !== maxCount) {
            socket.emit('paging', {roomName: roomName, page: `${curPage+1}`})
            postCurPage(curPage+1)
            setCurPage(curPage+1)
        } else {
            alert(`수고하셨습니다!`)
        }
    }

    const postCurPage = async(_reqPage) => {

        await axios.post(`${Urls.BASE_URL}${Urls.END_POST_PAGE}`, {
            roomName: roomName, curPage: _reqPage
        })
        .then((res) => {
            if (res.status === 200) {
                console.log("OK")
            } else {
                alert(`통신오류. 페이지 불일치시 전원 새로고침 요망`)
            }
        })
        .catch((err) => {
            console.log('postCurPage err', err)
            alert(`통신오류. 페이지 불일치시 전원 새로고침 요망`)
        })
    }

    const mainPart = (() => {
        if (isLoading) return "loading..."
        else {
            return (
            <div>
            <button type="button" onClick={leftClick}>LEFT</button>
            <img src={imageUrl} alt=""></img>
            <button type="button" onClick={rightClick}>RIGHT</button>
            </div>
            )}
    })

    const questionPart = (() => {
        if (isQuestion) {
            return (
                <div>
                    <p><textarea input="text"></textarea></p>
                </div>
            )
        } else {
            return ""
        }
        
    })

    const messagePart = (() => {
        if (message !== null) {
            return <p>메시지 - {message}</p>
        } else {
            return ""
        }
    })

    return(
        <div>
            {mainPart()}
            <div>
                {questionPart()}
            </div>
            <div>
                {messagePart()}
            </div>
        </div>
    )
}

export default withRouter(Salon)