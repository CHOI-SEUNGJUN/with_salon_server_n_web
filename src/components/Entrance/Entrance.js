import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Entrance.css'
import Urls from '../../utils/Urls'
import { useHistory, withRouter } from 'react-router-dom';

function Entrance() {
    const [isLoading, setIsLoading] = useState(false)

    let history = useHistory()
    
    const checkRoom = async (inputName, _password) => {
        setIsLoading(true)
        await axios.post(`${Urls.BASE_URL}${Urls.END_CHECK_ROOM}`, {
            roomName: inputName,
            password: _password
        })
        .then((res) => {
            alert(`Access Confirm: ${res.data.data[0].roomName}`)
            let data = res.data.data[0]
            history.push({
                pathname: '/room',
                state: {roomName: data.roomName, curPage: data.curPage}
            })
            setIsLoading(false)
        })
        .catch((err) => {
            if (err.response) {
                alert(err.response.data.message)
            } else {
                alert('Error: Call me(010-4568-7179)')
            }
        })
        setIsLoading(false)
    }

 

    useEffect(() => {
        return () => setIsLoading(false)
    })

    return(
        <main>
            {isLoading ? "loading..." : (
                <div id="loginform">
                    <form 
                        method="post"
                        onSubmit={(e) => {
                            e.preventDefault();
                            checkRoom(e.target.roomName.value, e.target.password.value)
                        }}>
                        <p><input name="roomName" type="text" placeholder="방 번호 입력" autoComplete="off"></input></p>
                        <p><input name="password" type="password" placeholder="비밀번호 입력"></input></p>
                        <p><input type="submit" value="입장"></input></p>
                    </form>
            </div>
            )}
        </main>
    )
}

export default withRouter(Entrance)