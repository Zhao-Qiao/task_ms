const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: "root",
    password: "Dd20020429",
    database: "task_management_system"
})

app.post('/api/submit_content', (req, res) => {
    const username = req.body.username
    const time = req.body.time
    const content = req.body.content
    console.log("content", content)
    const title = req.body.title
    const sqlInsert = "INSERT INTO POSTS (time,username, title,content) VALUES (?, ?,?,?)"
    db.query(sqlInsert, [time, username, title, content], (err, result) => {
        console.log(err)
    })
})

// localhost:4000/api/register
app.post('/api/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const sqlInsert = "INSERT INTO USER (username, password) VALUES (?, ?)"
    db.query(sqlInsert, [username, password], (err, result) => {
        console.log(err)
    })
})


// localhost:4000/api/login
app.post('/api/login', (req, res) => {
    // query username and password from database, returns query result
    const username = req.body.username
    const password = req.body.password
    const sqlInsert = "SELECT * FROM USER WHERE username = ? AND password = ?"
    db.query(sqlInsert, [username, password], (err, result) => {
        console.log(err)
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({ message: "Wrong username/password combination!" })
        }
    })
})

app.post('/api/fetch_user', (req, res) => {
    // query username and password from database, returns query result
    const sqlInsert = "SELECT * FROM USER"
    db.query(sqlInsert, (err, result) => {
        console.log(err)
        console.log(result)
        if (result.length > 0) {
            console.log(result)
            res.send(result)
        } else {
            res.send({ message: "No user exists!" })
        }
    })
})

app.post('/api/fetch_friends', (req, res) => {
    const username = req.body.username
    console.log('username', username)
    const sqlInsert = "SELECT distinct followee FROM FOLLOW WHERE follower = ?"
    db.query(sqlInsert, [username], (err, result) => {
        if (result.length > 0) {
            const followees = result.map((item) => item.followee)
            console.log(followees)
            console.log(result)
            res.send(followees)
        }
        else{
            res.send({message: "You have no friends!"})
        }
    })
})

app.post('/api/search_user', (req, res) => {
    // query username and password from database, returns query result
    const searchStr = req.body.searchstr
    const sqlInsert = "SELECT * FROM USER WHERE username LIKE ?"
    db.query(sqlInsert, [`%${searchStr}%`], (err, result) => {
        console.log(err)
        console.log(result)
        if (result.length > 0) {
            console.log(result)
            res.send(result)
        } else {
            res.send({ message: "No user exists!" })
        }
    })
})

app.post('/api/change_user_type', (req, res) => {
    const username = req.body.username
    const type = req.body.type

    let newtype = "user"
    if (type == "user") newtype = "admin"
    const sqlInsert = "UPDATE USER SET type = ? WHERE username = ?"
    db.query(sqlInsert, [newtype, username], (err, result) => {
        console.log(err)
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({ message: "No user exists!" })
        }
    })
})

app.post('/api/check_follow', (req, res) => {
    const follower = req.body.follower
    const followee = req.body.followee
    const sqlInsert = "SELECT * FROM FOLLOW WHERE follower = ? AND followee = ?"
    db.query(sqlInsert, [follower, followee], (err, result) => {
        console.log(err)
        if (result.length > 0) {
            res.send(true)
        } else {
            res.send(false)
        }
    })
})

app.post('/api/set_follow', (req, res) => {
    const follower = req.body.follower
    const followee = req.body.followee
    const sqlInsert = "INSERT INTO FOLLOW (follower,followee) VALUES (?, ?)"
    db.query(sqlInsert, [follower, followee], (err, result) => {
        console.log(err)
    })
})

app.post('/api/rm_user', (req, res) => {
    //      This function is used by admin to remove user from database
    const username = req.body.username
    const sqlInsert = "DELETE FROM USER WHERE username = ?"
    db.query(sqlInsert, [username], (err, result) => {
        console.log(err)
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({ message: "No user exists!" })
        }
    })
})

app.post('/api/post_task', (req, res) => {
    //     this function is used by regular user to upload a task
    // task Content: task_name, task_description, task_deadline, task_status, task_priority, task_assignee, task_assigner
    const username = req.body.username
    const task_name = req.body.task_name
    const task_description = req.body.task_description
    const task_deadline = req.body.task_deadline
    const task_status = req.body.task_status
    const task_priority = req.body.task_priority
    const task_assignee = req.body.task_assignee
    const task_assigner = req.body.task_assigner
    const sqlInsert = "INSERT INTO TASK (task_name, task_description, task_deadline, task_status, task_priority, task_assignee, task_assigner) VALUES (?, ?, ?, ?, ?, ?, ?)"
    db.query(sqlInsert, [task_name, task_description, task_deadline, task_status, task_priority, task_assignee, task_assigner], (err, result) => {
        console.log(err)
        if (result.length > 0) {
            res.send(result)
        }
        else {
            res.send({ message: "No user exists!" })
        }
    })
})

app.post('/api/rm_task', (req, res) => {
    //     this function is used by regular user to remove a task, authentication and validation is done by previously defined database triggers.
    const task_name = req.body.task_name
    const sqlInsert = "DELETE FROM TASK WHERE task_name = ?"
    db.query(sqlInsert, [task_name], (err, result) => {
        console.log(err)
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({ message: "No task exists!" })
        }
    })
})


app.post('/api/update_task', (req, res) => {
    //     update some of the task content, authentication and validation is done by previously defined database triggers.
    //     the content to be modified is given by a json object, which contains the task_name and the content to be modified.
    //     task_name is
})

app.post('/api/fetch_content', (req, res) => {
  //fetch content by usernames
    const userlist = req.body.userlist
    // userlist cannot be resolved properly

    const sqlInsert = "SELECT * FROM posts WHERE username IN (?)"
    console.log('userlist', userlist)
    db.query(sqlInsert, [userlist], (err, result) => {
        console.log(err)
        console.log(result)
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({ message: "No user exists!" })
        }
    })
})

app.get('/api', (req, res) => {
    //  a demo function to test if server is running
    res.json({ message: 'Hello from server!' });
})
console.log(port)
app.listen(port, () => console.log(`Listening on port ${port}`))