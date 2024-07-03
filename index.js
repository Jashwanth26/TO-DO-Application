import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://playground-bc077-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const todoListRef = ref(database, "todoList") // Updated reference

const inputFieldEl = document.getElementById("input-field")
const timeFieldEl = document.getElementById("time-field")
const addButtonEl = document.getElementById("add-button")
const todoListEl = document.getElementById("todo-list") // Updated reference

addButtonEl.addEventListener("click", function() {
    let inputValue = inputFieldEl.value
    let inputTime = timeFieldEl.value
    
    if (!inputValue || !inputTime) {
        alert("Please enter both task and time.")
        return
    }
    
    push(todoListRef, {
        task: inputValue,
        time: inputTime
    })
    
    clearInputFieldEl()
})

onValue(todoListRef, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        clearTodoListEl()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendItemToTodoListEl(currentItem)
        }    
    } else {
        todoListEl.innerHTML = "No items here... yet"
    }
})

function clearTodoListEl() {
    todoListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
    timeFieldEl.value = "" // Clear time input field as well
}

function appendItemToTodoListEl(item) {
    let itemID = item[0]
    let itemValue = item[1].task
    let itemTime = item[1].time
    
    let newEl = document.createElement("li")
    newEl.textContent = `${itemValue} (${itemTime})`
    
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `todoList/${itemID}`)
        
        remove(exactLocationOfItemInDB)
    })
    
    todoListEl.append(newEl)
    
    // Set notification for the item's time
    setNotification(itemID, itemValue, itemTime)
}

function setNotification(itemID, task, time) {
    // Parse time into hours and minutes
    let [hours, minutes] = time.split(":")
    
    // Calculate notification time
    let notificationTime = new Date()
    notificationTime.setHours(hours)
    notificationTime.setMinutes(minutes)
    notificationTime.setSeconds(0)
    
    // Check if notification time is in the future
    if (notificationTime > new Date()) {
        // Schedule notification
        setTimeout(() => {
            showNotification(task)
        }, notificationTime - new Date())
    }
}

function showNotification(task) {
    if (Notification.permission === "granted") {
        new Notification(`Reminder: ${task}`, {
            body: "It's time to complete this task!",
            icon: "assets/cat.png"
        })
    } else {
        Notification.requestPermission().then(function(permission) {
            if (permission === "granted") {
                showNotification(task)
            }
        })
    }
}
