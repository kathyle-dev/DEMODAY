var connect= document.querySelectorAll(".connect-btn");
var accept = document.querySelectorAll(".accept-btn");
var decline = document.querySelectorAll(".decline-btn");


var sendMsg = document.getElementById('msg-btn')


// SEND CONNECTION REQUEST //
connect.forEach(function(element) {
element.addEventListener('click', function(e){
        const index = window.location.pathname.lastIndexOf("/")
        const email= window.location.pathname.slice(index+1)
             fetch('/connect', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                 'username': email,
                  })
             })
             .then(response => {
               if (response.ok) return response.json()
             })
             .then(data => {
               window.location.reload(true)
             })
      })
});

// ACCEPT CONNECTION REQUEST //
accept.forEach(function(element) {
element.addEventListener('click', function(e){
        const email= e.target.getAttribute("data-email")
        const name = e.target.getAttribute("data-name")
        const aceptee = e.target.getAttribute("data-aceptee")
             fetch('/accept', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                 'username': email,
                 'name': name,
                 'aceptee': aceptee
                  })
             })
             .then(response => {
               if (response.ok) return response.json()
             })
             .then(data => {
               window.location.reload(true)

             })
      });
});
// DECLINE CONNECTION REQUEST //
decline.forEach(function(element) {
element.addEventListener('click', function(e){
        const email= e.target.getAttribute("data-email")
             fetch('/decline', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                 'username': email,
                  })
             })
             .then(response => {
               if (response.ok) return response.json()
             })
             .then(data => {
               window.location.reload(true)

             })
      });
});

//SEND MESSAGE TO USER //

sendMsg.addEventListener('click', function(e){
e.preventDefault()
let otherUser = document.getElementById('otherUser')
let msg = otherUser.value
let otherUserEmail = e.target.getAttribute("data-email")
fetch('/messages',{
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      messages:
      {receiver: otherUserEmail,
        msg: msg
      }
    }) })
    .then(response =>
          {if (response.ok)
                return response.json()})
    .then(data =>{
      console.log(data)
        window.location.reload(true)
    })
})
