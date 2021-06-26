console.log("this is moment", moment)
let inputElem = "Available",
    inputElem2= "Available",
    dateInput,
    timeInput,
    addButton,
    sortButton,
    tutor_id,
    todoList = [],
    calendar,
    shortlistBtn,
    changeBtn,
    todoTable;
todoMain();
async function todoMain() {
  const DEFAULT_OPTION = "Choose category";

  

  await getElements();
  await addListeners();
  await initCalendar();
  await load();
  await renderRows(todoList);

    async function getElements() {
    dateInput = document.getElementById("dateInput");
    //https://stackoverflow.com/questions/32378590/set-date-input-fields-max-date-to-today
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 

    today = yyyy+'-'+mm+'-'+dd;
    dateInput.setAttribute("min", today)
    startTimeInput = document.getElementById("startTimeInput");
    endTimeInput = document.getElementById("endTimeInput");
    addButton = document.getElementById("addBtn");
    selectElem = document.getElementById("categoryFilter");
    changeBtn = document.getElementById("changeBtn");
    todoTable = document.getElementById("todoTable");
    const request = async () => {
      const response = await fetch('/myschedule/retrievetutorid');
      const json = await response.json();
      console.log("this is testing async shit")
      console.log(json);
      tutor_id =  json;
    }
    await request()
    console.log(tutor_id)

    // toggleswitch = document.getElementById("toggleswitch")
  }
   //Adding the event to a list which isnt a persistent object i dont think.
    //Change this to a modal when a user click certain date.
  function addListeners() {
    dateInput.addEventListener("change", findTime)
    addButton.addEventListener("click", addEntry, false);

    document.getElementById("todo-modal-close-btn").addEventListener("click", closeEditModalBox, false);

    // changeBtn.addEventListener("click", commitEdit, false);

    //allmonth
    document.getElementById("allmonth").addEventListener("click", autoselectalldatesinmonth)
    //unselectallmonth
    document.getElementById("unselectallmonth").addEventListener("click", autounselectalldatesinmonth)

    document.getElementById("unavailableBtn").addEventListener("click", makeUnavailable)

    // toggleswitch.addEventListener("change", function(){
    //   if (this.checked){
    //     //if its checked change the text
    //     document.getElementById("toggleswitchlabel").innerText = 'Make Unavailable'
    //   } else {
    //     document.getElementById("toggleswitchlabel").innerText = 'Make Available'

    //   }
   
    // })

  }
  async function makeUnavailable(){
    thebutton = document.getElementById("unavailableBtn")
    id = thebutton.dataset.id
    date = document.getElementById("todo-edit-date").value
    starttime = document.getElementById("todo-edit-starttime").value
    endtime = document.getElementById("todo-edit-endtime").value
    console.log("make unavailable", id,date, starttime, endtime)

    await fetch("/myschedule/unavailable_entry/" + tutor_id,{
      method :"POST",
      credentials: "include", //include cookies
      body: JSON.stringify({id,date, starttime, endtime}),
      cache: "no-cache",
      headers: new Headers({
          "content-type": "application/json"
      })
    })
    load()



  }
  async function findTime(){
    //do a fetch request to check whether the selected date already has time booked 
  }

  async function autounselectalldatesinmonth(){
     // get all remaining dates of the month
     var currentdate = GetCalendarDateRange()
     // console.log(currentdate.getFullYear(), currentdate.getMonth())
     var lastday = new Date(currentdate.getFullYear(), currentdate.getMonth()+ 1, 0).getDate(); //https://www.w3resource.com/javascript-exercises/javascript-date-exercise-9.php
     // console.log("this is the last day now do a for loop from the current date to last date and send a post request", lastday)
     today = new Date(Date.parse(today))
     console.log(today)
     if(today.getMonth() == currentdate.getMonth()){
       //just take remaining date
       for(let i = today.getDate(); i<= lastday; i++){
         startdate = new Date(today.getFullYear(), today.getMonth(), i, 9)
         enddate = new Date(today.getFullYear(), today.getMonth(), i, 24)
         await autodeletedates(startdate,enddate)
     }
     console.log('this is after unselect', todoList)
     }else{
       console.log("future month")
       for(let i = 1; i<= lastday; i++){
         startdate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 9)
         enddate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 24)
         await autodeletedates(startdate,enddate)
        }
 
       //it means the user is looking at the future month
      }
  }
  function autoselectalldatesinmonth(){
    // get all remaining dates of the month
    var currentdate = GetCalendarDateRange()
    // console.log(currentdate.getFullYear(), currentdate.getMonth())
    var lastday = new Date(currentdate.getFullYear(), currentdate.getMonth()+ 1, 0).getDate(); //https://www.w3resource.com/javascript-exercises/javascript-date-exercise-9.php
    // console.log("this is the last day now do a for loop from the current date to last date and send a post request", lastday)
    today = new Date(Date.parse(today))
    console.log(today)
    if(today.getMonth() == currentdate.getMonth()){
      //just take remaining date
      for(let i = today.getDate(); i<= lastday; i++){
        startdate = new Date(today.getFullYear(), today.getMonth(), i, 9)
        enddate = new Date(today.getFullYear(), today.getMonth(), i, 24)
        autochangedates(startdate,enddate)
      }
    }else{
      console.log("future month")
      for(let i = 1; i<= lastday; i++){
        startdate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 9)
        enddate = new Date(currentdate.getFullYear(), currentdate.getMonth(), i, 24)
        autochangedates(startdate,enddate)
      }

      //it means the user is looking at the future month
    }
    

  }
  function autochangedates(startdate, enddate){ 
    // console.log("saving this", startdate, enddate )
    // console.log('checking whether this dates has duplicates', startdate,enddate)    //we making it available/unavailable on a full time slow 9am to 12 am
    for(let i = 0; i< todoList.length; i++){ //looping through to check whether entry exists in the todolist
      todoStartDate = new Date(Date.parse(todoList[i].startdate))
      todoEndDate = new Date(Date.parse(todoList[i].enddate))
      // console.log("++",todoStartDate ,todoEndDate)
      if((todoStartDate.getTime() == startdate.getTime() ) && (todoEndDate.getTime() == enddate.getTime() ) ){ //https://stackoverflow.com/questions/492994/compare-two-dates-with-javascript
        // console.log("there is a duplicate: ",todoList[i])
        return null
      }
    } 
    //if they never find
    let obj = {
      id : _uuid(),
      category: 'Available',
      startdate: startdate,
      enddate: enddate,
      starttime : '0900',
      endtime: '0000',
      done: false
    }
    renderRow(obj)
    todoList.push(obj)
    save()
  }
  async function autodeletedates(startdate, enddate){
    // removing from calendar object
    calendarEventList = calendar.getEvents()
    console.log("this is calendar event list", calendarEventList)
    for(let i = 0; i< calendarEventList.length; i++){
      //if the startdate and enddate is the same remove the event from the calendar
      thecurrentevent = calendarEventList[i]
      thecurrenteventstart = thecurrentevent.start
      thecurrenteventend = thecurrentevent.end

      if((thecurrenteventstart.getTime() == startdate.getTime()) && (thecurrenteventend.getTime() == enddate.getTime())){
        thecurrentevent.remove()
      }

    }

    //removing from todolist and therefore the database after
    todoList = todoList.filter(function(dateobject){ 
      // new Date(Date.parse(todoList[i].enddate)
      //basically converting the dateobject into a Date object and then comparing to our startdate function paramater
      
      return ((new Date(Date.parse(dateobject.startdate)).getTime() != startdate.getTime()) && (new Date(Date.parse(dateobject.enddate)).getTime() != enddate.getTime()))
    
    })
    await deletefromdatabase()
  }
  function GetCalendarDateRange() {
    //check if the month they are looking at is the current month or the future month, if current month just take the todays date, else take the first month
    
    var currentdate = document.getElementsByClassName("fc-toolbar-title")[0].innerText
    // console.log("currently looking at this current date", currentdate)
    var whatthe = Date.parse(currentdate)
    var therealdate = new Date(whatthe)
    console.log('Whatthe', whatthe)
    console.log('therealdate', therealdate)
    return therealdate
  }
  function addEntry(event) {

    let dateValue = dateInput.value;
    console.log("This is date:",dateValue)
    dateInput.value = ""; // reseting to empty

    let timeValue = timeInput.value;
    console.log("This is time:",timeValue)

    timeInput.value = "";
    if (dateValue ==="" || timeValue ==="") { //if statement to check if input is empty if empty alert, else save
        alert("Date or time input is empty");

    }else{
        let obj = {
              id: _uuid(),
              category: 'Available',
              date: dateValue,
              time: timeValue,
              done: false,
            };
            renderRow(obj);

            todoList.push(obj);

            save();
            console.log("This is object",obj);
            //every add entry submit to flask using the route, and then add to db

        }
  }

  function save() {
    //need bracket for the variable-key because idky but it works
    let stringified = JSON.stringify(todoList);
    localStorage.setItem("todoList", stringified);
    //before we post we check whether the data exists in our local todo list
    fetch("/myschedule/submit_entry",{
                method :"POST",
                credentials: "include", //include cookies
                body: JSON.stringify(todoList),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })

    });
  }
  function deletefromdatabase() {
    let stringified = JSON.stringify(todoList);
    localStorage.setItem("todoList", stringified);
    //before we post we check whether the data exists in our local todo list
    fetch("/myschedule/delete_entry",{
                method :"POST",
                credentials: "include", //include cookies
                body: JSON.stringify(todoList),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })

    }).then(function(response){
      // console.log("response:",response.clone().json())
      return response.clone().json()
    }).then(function(data){
      // console.log("data",data)
      //    let retrieved = localStorage.getItem("todoList");
      //    todoList = JSON.parse(retrieved);
      todoList = data
      // console.log("list from local",todoList)
      //console.log(typeof todoList)
      // console.log("this is the current todoList",todoList)
      })
  }

  function load() {
  //add a code here where retrieve todolist from flask and set inside local storage
  //https://www.youtube.com/watch?v=Oive66jrwBs
  console.log("==== Loading ====")
    fetch("/myschedule/fetch/"+tutor_id)
    .then(function(response){
        console.log("response:",response.clone().json())
        return response.clone().json()
    })
    .then(function(data){
    // console.log("data",data)
    //    let retrieved = localStorage.getItem("todoList");
    //    todoList = JSON.parse(retrieved);
    todoList = data
    // console.log("list from local",todoList)
    //console.log(typeof todoList)
    // console.log("this is the current todoList",todoList)
    renderRows(todoList);
    })
   console.log("==== FInished ====")

  }

  function renderRows(arr) {
    arr.forEach(todoObj => {
        // console.log("rendering",todoObj);
      renderRow(todoObj);
    })
  }

  function renderRow({category: inputValue2, id, startdate, enddate, starttime,endtime, done }) {
    // add a new row

    let table = document.getElementById("todoTable");

    let trElem = document.createElement("tr");
    table.appendChild(trElem);

    // date cell
    let dateElem = document.createElement("td");

    dateElem.innerText = formatDate(startdate);
    trElem.appendChild(dateElem);

    // start time cell
    let startTimeElem = document.createElement("td");
    startTimeElem.innerText = starttime;
    trElem.appendChild(startTimeElem);
    // end time cell
    let endTimeElem = document.createElement("td");
    endTimeElem.innerText = endtime;
    trElem.appendChild(endTimeElem);

    // category cell
    let tdElem3 = document.createElement("td");
    tdElem3.innerText = inputValue2;
    tdElem3.className = "categoryCell";
    trElem.appendChild(tdElem3);

    // edit cell
    let editSpan = document.createElement("span");
    editSpan.innerText = "edit";
    editSpan.className = "material-icons";
    editSpan.addEventListener("click", toEditItem, false);
    editSpan.dataset.id = id;
    let editTd = document.createElement("td");
    editTd.appendChild(editSpan);
    trElem.appendChild(editTd);


    // delete cell
    let spanElem = document.createElement("span");
    spanElem.innerText = "delete";
    spanElem.className = "material-icons";
    spanElem.addEventListener("click", deleteItem, false);
    spanElem.dataset.id = id;
    let tdElem4 = document.createElement("td");
    tdElem4.appendChild(spanElem);
    trElem.appendChild(tdElem4);
    //add to calendar
    addEvent({
      id: id,
      title: inputValue2,
      start: startdate,
      end: enddate
    });

    dateElem.dataset.type = "date";
    dateElem.dataset.value = startdate;
    startTimeElem.dataset.type = "time";
    startTimeElem.dataset.value = starttime
    endTimeElem.dataset.type = "time"
    endTimeElem.dataset.value = endtime

    dateElem.dataset.id = id;
    startTimeElem.dataset.id = id;
    endTimeElem.dataset.id = id;
    // console.log("checking what dataset is",startTimeElem)

    function deleteItem() {
      trElem.remove();

      for (let i = 0; i < todoList.length; i++) {
        if (todoList[i].id == this.dataset.id)
          todoList.splice(i, 1);
      }
      save();

      // remove from calendar
      calendar.getEventById( this.dataset.id ).remove();
    }

    function checkboxClickCallback() {
      trElem.classList.toggle("strike");
      for (let i = 0; i < todoList.length; i++) {
        if (todoList[i].id == this.dataset.id)
          todoList[i]["done"] = this.checked;
      }
      save();
    }

  }

  function _uuid() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function sortEntry() {
    todoList.sort((a, b) => {
      let aDate = Date.parse(a.date);
      let bDate = Date.parse(b.date);
      return aDate - bDate;
    });

    save();

    clearTable();

    renderRows(todoList);
  }
  var today = new Date().toISOString().slice(0,10);
  console.log('this is today lol', today)

  function initCalendar() {
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
      // Other Calendar Options go here
      // viewDisplay: function(view){
      //   $('.fc-day').filter(
      //     function(index){
      //     return moment( $(this).data('date') ).isBefore(moment(),'day') 
      //   }).addClass('fc-other-month');
      // },
      selectable: true,
      // select: function(start, end) {
      //   if(start.isBefore(moment())) {
      //       $('#calendar').fullCalendar('unselect');
      //       return false;
      //   }},
    
      initialView: 'dayGridMonth',
      validRange:{
        start : today
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: [],
      eventClick: function(info) {
        toEditItem(info.event);
      },
      eventBackgroundColor: "#378006",
      eventBorderColor: "#378006",
    });

    calendar.render();
  }

  function addEvent(event){
    calendar.addEvent( event );

  }

  function clearTable(){
    // Empty the table, keeping the first row
    let trElems = document.getElementsByTagName("tr");
    for (let i = trElems.length - 1; i > 0; i--) {
      trElems[i].remove();
    }

    calendar.getEvents().forEach(event=>event.remove());
  }


  function onTableClicked(event){
    if(event.target.matches("td") && event.target.dataset.editable == "true"){
      let tempInputElem;
      switch(event.target.dataset.type){
        case "date" :
          tempInputElem = document.createElement("input");
          tempInputElem.type = "date";
          tempInputElem.value = event.target.dataset.value;
          break;
        case "time" :
          tempInputElem = document.createElement("input");
          tempInputElem.type = "time";
          tempInputElem.value = event.target.innerText;
          break;
        case "category" :
          tempInputElem = document.createElement("input");
          tempInputElem.value = event.target.innerText;

          break;
        default:
      }
      event.target.innerText = "";
      event.target.appendChild(tempInputElem);

      tempInputElem.addEventListener("change", onChange, false);


    }

    function onChange(event){
      let changedValue = event.target.value;
      let id = event.target.parentNode.dataset.id;
      let type = event.target.parentNode.dataset.type;

      // remove from calendar
      calendar.getEventById( id ).remove();

      todoList.forEach( todoObj => {
        if(todoObj.id == id){
          //todoObj.todo = changedValue;
          todoObj[type] = changedValue;

          addEvent({
            id: id,
            title: changedValue,
            start: todoObj.date,
          });
        }
      });
      save();

      if(type == "date"){
        event.target.parentNode.innerText = formatDate(changedValue);
      }else{
        event.target.parentNode.innerText = changedValue;
      }

    }
  }

  function formatDate(date){
    let dateObj = new Date(date);
    let formattedDate = dateObj.toLocaleString("en-GB", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return formattedDate;
  }

  function showEditModalBox(event){
    document.getElementById("todo-overlay").classList.add("slidedIntoView");
  }

  function closeEditModalBox(event){
    document.getElementById("todo-edit-starttime").innerHTML = ""
    document.getElementById("todo-edit-endtime").innerHTML = ""
    document.getElementById("todo-edit-endtime").disabled = true;

    document.getElementById("todo-overlay").classList.remove("slidedIntoView");
  }

  function commitEdit(event){
    closeEditModalBox();

    let id = event.target.dataset.id;
    let category = document.getElementById("todo-edit-category").value;
    let date = document.getElementById("todo-edit-startdate").value;
    let starttime = document.getElementById("todo-edit-starttime").value;
    let endtime = document.getElementById("todo-edit-endtime").value

    // remove from calendar
    calendar.getEventById( id ).remove();

    for( let i = 0; i < todoList.length; i++){
      if(todoList[i].id == id){
        todoList[i] = {
          id  : id,
          category : category,
          date : date,
          time : time
        };

        addEvent({
          id: id,
          title: category,
          start: todoList[i].date,
        });
      }
    }

    save();

    // // Update the table
    // let tdNodeList = todoTable.querySelectorAll("td");
    // for(let i = 0; i < tdNodeList.length; i++){
    //   if(tdNodeList[i].dataset.id == id){
    //     let type = tdNodeList[i].dataset.type;
    //     switch(type){
    //       case "date" :
    //         tdNodeList[i].innerText = formatDate(date);
    //         break;
    //       case "time" :
    //         tdNodeList[i].innerText = time;
    //         break;
    //       case "category" :
    //         tdNodeList[i].innerText = category;
    //         break;
    //     }
    //   }
    // }
  }

  function toEditItem(event){
    showEditModalBox();

    let id;

    if(event.target) // mouse event
      id = event.target.dataset.id;
    else // calendar event
      id = event.id;

    preFillEditForm(id);
  }

  function preFillEditForm(id){
    let result = todoList.find(todoObj => todoObj.id == id);
    let {category, startdate,enddate, starttime, endtime} = result;
    startDateParsed = new Date(Date.parse(startdate))
    endDateParsed = new Date(Date.parse(enddate))

    console.log("prefill this is date", startDateParsed)
    console.log(starttime)
    console.log(endtime)

    document.getElementById("todo-edit-category").value = category;
    document.getElementById("todo-edit-date").value = `${startDateParsed.toISOString().slice(0,10)}`;
    startTimeInput = document.getElementById("todo-edit-starttime")
    startTimeInput.addEventListener("change",updateEndInput)
    // console.log("this is start time input", startTimeInput)
    // console.log("<option value='" + startDateParsed.getHours()  + "'>" + formatAMPM(startDateParsed)  + "</option>")
    var startOption = document.createElement("option")
    startOption.text = formatAMPM(startDateParsed)
    startOption.value = startDateParsed.getHours()
    startTimeInput.add(startOption)

    startArray = range(14, startAt = startDateParsed.getHours()+1)
    console.log(startArray)
    for (let index in startArray){
      time = startArray[index]
      option = document.createElement("option")
      option.text = timeToFormat(time)
      option.value = time
      startTimeInput.add(option)
    }
    // startTimeInput.innerHTMl = "<option value='" + startDateParsed.getHours  + "'>" + formatAMPM(startDateParsed)  + "</option>"
    endTimeInput = document.getElementById("todo-edit-endtime")
    var endOption = document.createElement("option")
    endOption.text = formatAMPM(endDateParsed)
    endOption.value =endDateParsed.getHours()
    endTimeInput.add(endOption)


    unavailableBtn.dataset.id = id;
    availableBtn.dataset.id = id;
  }
  function updateEndInput(){
    //emptying end time input box
    endTimeInput = document.getElementById("todo-edit-endtime")
    endTimeInput.disabled = false;
    endTimeInput.innerHTML = ""
    startTimeInput = document.getElementById("todo-edit-starttime")
    startValue = startTimeInput.value
    endTimeInput = document.getElementById("todo-edit-endtime")
    endArray = range(24-parseInt(startValue), startAt = parseInt(startValue)+1)
    console.log(endArray)
    for (let index in endArray){
      time = endArray[index]
      option = document.createElement("option")
      option.text = timeToFormat(time)
      option.value = time
      endTimeInput.add(option)
    }


  }
  //to format date to a 12 hour formate
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
  function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
  }

  function timeToFormat(hour){
    if (hour <=11){
      strTime = hour + ":" + '00' + " am"
    }else if (hour == 12){
      strTime = hour + ":" + '00' + " pm"
    }else if(hour <=23){
      strTime = hour%12 + ":" + '00' + " pm"
    }else if(hour ==24){
      strTime = "12"+ ":" + '00' + " am"
    }
    return strTime
  }

}