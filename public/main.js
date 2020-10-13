var connect= document.querySelectorAll(".connect-btn");
var accept = document.querySelectorAll(".accept-btn");
var decline = document.querySelectorAll(".decline-btn");

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


accept.forEach(function(element) {
element.addEventListener('click', function(e){
        const email= e.target.getAttribute("data-email")
             fetch('/accept', {
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

accept.forEach(function(element) {
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
