const DeleteButton=document.querySelectorAll('.delete');
DeleteButton.forEach((button) => {
  button.addEventListener('click', (event) => {
    // Handle button click 
    alert(`Button  was clicked!`+button.value);
    const id = button.value;
    fetch('/deleteFood/'+id, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })


   
  });
});
