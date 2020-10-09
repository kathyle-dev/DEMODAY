var send= document.getElementById("send-btn");
var trash = document.getElementsByClassName("fa-trash");


send.addEventListener('click', function(e){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const src = this.parentNode.parentNode.childNodes[3].getAttribute("src")
        const msg = this.parentNode.parentNode.childNodes[5].innerText
        const value = parseFloat(this.parentNode.parentNode.childNodes[7].innerText)
        if(e.target.classList.contains("fa-arrow-up")){
             fetch('messages', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                 'name': name,
                 'src': src,
                 'msg': msg,
                 'value':value,
                 'arrowUp': "yes",
                 'arrowDown': ""
                  })
             })
             .then(response => {
               if (response.ok) return response.json()
             })
             .then(data => {
               window.location.reload(true)
             })
      }else if (e.target.classList.contains("fa-arrow-down")){
            fetch('messages', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  'name': name,
                  'src': src,
                  'msg': msg,
                  'value':value,
                  'arrowUp': "",
                  'arrowDown': "yes"
                  })
            })
            .then(response => {
              if (response.ok) return response.json()
            })
            .then(data => {
              window.location.reload(true)
            })
      }

      });
});

Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
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
          window.location.reload()
        })
      });
});
