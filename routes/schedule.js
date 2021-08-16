const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Calendar = require('../models/Calendar');
const User = require('../models/User');


//todo 
//try to see whether its possible to implement angular scheduler system
// tutor no need to select time
// they just select the date, course and session
// because they already indicate the time on the session
// they only need to indicate start time
router.post('/submit_entry', async (req,res)=>{
    //check whether entry exists already inside our database the date and the time. 
    todoList = req.body

    await Calendar.findAll({where:{userUserId:req.user.user_id}, raw:true})
    .then(calendar => {
        // console.log("this is from sql",calendar)
        //looping through our database to check whether we have the same entries, datee and time dont matter the id lol 
        for(let i = 0; i< todoList.length;i++){
            let gotduplicate = false
            for(let j = 0; j< calendar.length; j++){
                calendarStartDate = new Date(Date.parse(calendar[j].startdate)) 
                calendarEndDate = new Date(Date.parse(calendar[j].enddate))
                todoStartDate = new Date(Date.parse(todoList[i].startdate))
                todoEndDate = new Date(Date.parse(todoList[i].enddate))
                //if similar date but time is different, 
                if((calendarStartDate.getTime() == todoStartDate.getTime()) && (calendarEndDate.getTime() == todoEndDate.getTime())){
                    gotduplicate = true
                    break;
                }
            }
            if (gotduplicate != true){
                Calendar.create({id:todoList[i].id , category: todoList[i].category, startdate: todoList[i].startdate, enddate: todoList[i].enddate, starttime: todoList[i].starttime, endtime: todoList[i].endtime, userUserId: req.user.user_id }).catch(err => console.log(err));
            }


        }
        
    })
    
    res.send(req.body)
})
router.post('/delete_entry', async(req,res)=>{
    console.log("this is delete entry req body", req.body)
    todoList = req.body
    await Calendar.findAll({where:{userUserId:req.user.user_id}, raw:true})
    .then(calendar => {
        console.log("This is delete entry calendar", calendar)
        // console.log("this is from sql",calendar)
        //so basically we are comparing our database and our todolist, since we deleted an entry from todolist it will be shorter than the calendar. we check which is the one that is delete from todolist and delete it from calendar
        for(let i = 0; i< calendar.length;i++){
            calendarStartDate = new Date(Date.parse(calendar[i].startdate)) 
            calendarEndDate = new Date(Date.parse(calendar[i].enddate))
            let dateExist = false
            for(let j = 0; j< todoList.length; j++){
                todoStartDate = new Date(Date.parse(todoList[j].startdate))
                todoEndDate = new Date(Date.parse(todoList[j].enddate))
                //if similar date but time is different, 
                if((calendarStartDate.getTime() == todoStartDate.getTime()) && (calendarEndDate.getTime() == todoEndDate.getTime())){
                    dateExist = true
                }
            }
            if (dateExist == false){
                console.log("to be deleted since it doesnt exist inside todolist",calendar[i])
                // destroy it
                Calendar.destroy({where:{id:calendar[i].id}})
                // Calendar.create({id:todoList[i].id , category: todoList[i].category, startdate: todoList[i].startdate, enddate: todoList[i].enddate, starttime: todoList[i].starttime, endtime: todoList[i].endtime, userUserId: req.user.user_id }).catch(err => console.log(err));
            }else{
                console.log("there are no duplicate")
            }
        }
    })
    res.send(req.body)
})

router.post("/unavailable_entry/:tutorid", async(req, res)=>{
    calendarId = req.body.id
    console.log(calendarId)
    date = req.body.date
    dateParsed = new Date(Date.parse(date))
    starttime = req.body.starttime
    endtime = req.body.endtime
    console.log("checking date parsed sethours", dateParsed.setHours(starttime))
    console.log(new Date(dateParsed.setHours(starttime)).toISOString().slice(0, 19).replace('T', ' '))
    sqlFormstartdate = new Date(dateParsed.setHours(starttime)).toISOString().slice(0, 19).replace('T', ' ')
    sqlFormenddate = new Date(dateParsed.setHours(endtime)).toISOString().slice(0,19).replace('T',' ')
    console.log(req.params.tutorid,"this is unavailable",calendarId, starttime, endtime)

    if(starttime==9 && endtime ==0){
        Calendar.destroy({where: {id: calendarId}})
    }else{                //the date format isnt the same as mysql
        //check whether the time range exist inside already if so we make that unavailable
        Calendar.findOne({where: {userUserId: JSON.parse(req.params.tutorid), startdate: sqlFormstartdate, enddate: sqlFormenddate}})
        .then(calendar=>{
            console.log("finding wghether calendar exists", calendar)
            if (calendar == null || calendar ==undefined){
                //finding the original date and changing it
                Calendar.findOne({where:{id: calendarId }}).then(calendar =>{
                    calendar.update({enddate: sqlFormstartdate,endtime: starttime})
                    Calendar.create({category:"Available",startdate: sqlFormenddate,enddate: new Date(dateParsed.setHours(24)).toISOString().slice(0,19).replace('T',' '), userUserId: JSON.parse(req.params.tutorid)})

                })
            }else{
                //it means we found the same un-fullday event which means we need to delete it
                console.log(calendar, 'calendar deleted')
                calendar.destroy()
            }
        })                                                                           
    }

})

router.get('/fetch/:tutorid', (req,res)=>{
    console.log("fetching calendar")
    console.log(req.user.user_id)
    console.log(JSON.parse(req.params.tutorid))
    if(req.user.user_id == JSON.parse(req.params.tutorid)){ 
        Calendar.findAll({where: {userUserId: JSON.parse(req.params.tutorid)}, raw:true})
        .then(calendar => {
            // console.log(calendar)
            res.send(calendar)
        }).catch(err => console.log(err));
    }
})
router.get("/retrievetutorid",(req,res)=>{
    res.json(JSON.stringify(req.user.user_id))
})
router.get("/:tutorid", (req,res)=>{
    if (req.user != null){
        User.findOne({where: {user_id: req.params.tutorid}})
        .then(tutor =>{
            if(tutor.user_id == req.user.user_id){
                res.render("schedule/myschedule",{
                    tutor_id: req.params.tutorid,
                    user: req.user.dataValues,

                })
            }else{
                res.redirect("/")
            }
        })
    }else{
        res.redirect("/")
    }
    //validate whether req iser is the same
})
module.exports = router;