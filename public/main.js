var connect= document.getElementsByClassName("connect");
var trash = document.getElementsByClassName("fa-trash");

Array.from(connect).forEach(function(element) {
element.addEventListener('click', function(e){
        const user = window.location.pathname.subtring(lastIndexOf('/') + 1)
             fetch('connect', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                 'user': user,
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

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const user = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[5].innerText
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'msg': msg
          })
        }).then(function (response) {
          window.location.assign("../connection/sent")
        })
      });
});
