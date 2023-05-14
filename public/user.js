var cal1=0;
const limit=2100;

// Get form elements
const form = document.querySelector('form');
const dateInput = document.getElementById('date');
const foodInput = document.getElementById('food');
const caloriesInput = document.getElementById('calories');
const mealInput = document.getElementById('meal');

// Get entries body element
const entriesBody = document.getElementById('entries-body');

// Define max number of entries per meal
const maxEntriesPerMeal = {
    breakfast: 3,
    lunch: 5,
    dinner: 2
};

// Define meals array
const meals = [
    {
        name: 'breakfast',
        maxEntries: maxEntriesPerMeal.breakfast,
        entriesCount: 0
    },
    {
        name: 'lunch',
        maxEntries: maxEntriesPerMeal.lunch,
        entriesCount: 0
    },
    {
        name: 'dinner',
        maxEntries: maxEntriesPerMeal.dinner,
        entriesCount: 0
    }
];

// // Define function to add new entry to entries array
// function addEntry(date, food, calories, meal) {
//     fetch('/api/foodEntries', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             date: date,
//             food: food,
//             calories: calories,
//             meal: meal
//         })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(response.statusText);
//         }
//         return response.json();
//     })
//     .then(entry => {
//         entries.push(entry);
//         updateEntriesTable();
//     })
//     .catch(error => {
//         console.error('Error adding food entry:', error);
//     });
// }

// Define function to update entries table
// function updateEntriesTable() {
//     // Clear entries table body
//     entriesBody.innerHTML = '';

//     // Loop through entries array and append rows to table body
//     entries.sort((a, b) => b.date - a.date)
//     console.log(entries)
//     entries.forEach(entry => {

//         const row = document.createElement('tr');
//         const dateObject = new Date(entry.date);
//         dateObject.setDate(dateObject.getDate()+1);

//         const newDateObject = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate());
//         const newDateString = newDateObject.toISOString().split('T')[0];
       
//         fetch('/api/getDayCalories/' + newDateString)
//           .then(response => {
//             if (!response.ok) {
//               throw new Error(response.statusText);
//             }

//             return response.json();

//           })
//           .then(data => {
//             row.innerHTML = `
//               <td>${newDateString}</td>
//               <td>${entry.name}</td>
//               <td>${entry.Calorie}</td>
//               <td>${entry.meal}</td>
//               <td>${data.CalorieOftheDay !== "null" ? data.CalorieOftheDay : ''}</td>
//             `;
//             entriesBody.appendChild(row);
//           });
//       });
      

//     // Update meals array entries count
//     meals.forEach(meal => meal.entriesCount = 0);
//     entries.forEach(entry => {
//         const mealIndex = meals.findIndex(meal => meal.name === entry.meal);
//         meals[mealIndex].entriesCount++;
//     });

//     // Check if meals have reached max entries
//     meals.forEach(meal => {
//         if (meal.entriesCount >= meal.maxEntries) {
//             mealInput.querySelector(`option[value='${meal.name}']`).disabled = true;
//         } else {
//             mealInput.querySelector(`option[value='${meal.name}']`).disabled = false;
//         }
//     });
// }

function updateEntriesTable() {
    // Clear entries table body
    entriesBody.innerHTML = '';
  
    // Loop through entries array 
    const fetchRequests = entries.map(entry => {
      const dateObject = new Date(entry.date);
      dateObject.setDate(dateObject.getDate() + 1);
      const newDateObject = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate());
      const newDateString = newDateObject.toISOString().split('T')[0];
      return fetch('/api/getDayCalories/' + newDateString)
        .then(response => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then(data => ({ entry, data }));
    });
  
    // Wait for all fetch requests to complete and then sort entries
    Promise.all(fetchRequests)
      .then(results => {
        entries = results.map(({ entry }) => entry);
        entries.sort((a, b) => a.date - b.date);
  
        // Append rows to table body in sorted order
        entries.forEach(entry => {
          const row = document.createElement('tr');
          const dateObject = new Date(entry.date);
          dateObject.setDate(dateObject.getDate() + 1);
          const newDateObject = new Date(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate());
          const newDateString = newDateObject.toISOString().split('T')[0];
  
          const { data } = results.find(result => result.entry === entry);
  
          row.innerHTML = `
            <td>${newDateString}</td>
            <td>${entry.name}</td>
            <td>${entry.Calorie}</td>
            <td>${entry.meal}</td>
            <td>${data.CalorieOftheDay !== "null" ? data.CalorieOftheDay : ''}</td>
          `;
          entriesBody.appendChild(row);
        });
  
        meals.forEach(meal => meal.entriesCount = 0);
        entries.forEach(entry => {
          const mealIndex = meals.findIndex(meal => meal.name === entry.meal);
          meals[mealIndex].entriesCount++;
        });
  
        // Check if meals have reached max entries
        meals.forEach(meal => {
          if (meal.entriesCount >= meal.maxEntries) {
            mealInput.querySelector(`option[value='${meal.name}']`).disabled = true;
          } else {
            mealInput.querySelector(`option[value='${meal.name}']`).disabled = false;
          }
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
// Load entries from server and update table
window.onload = (event) => {
    fetch('/api/foodEntries')
.then(response => {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
})
.then(data => {

    entries = data;
    entries.sort((a, b) => b.date - a.date)

    // alert(data)
    updateEntriesTable();
   
})
.catch(error => {
    console.error('Error loading food entries:', error);
});

    console.log("page is fully loaded");
  };
  
// fetch('/api/foodEntries')
// .then(response => {
//     if (!response.ok) {
//         throw new Error(response.statusText);
//     }
//     return response.json();
// })
// .then(data => {
//     entries = data;
//     updateEntriesTable();
// })
// .catch(error => {
//     console.error('Error loading food entries:', error);
// });



const submitButton=document.getElementById('submit');
submitButton.addEventListener("click", function(){

    const date = document.getElementById("date").value;
    const food = document.getElementById("food").value;
    const calories = document.getElementById("calories").value;
    const meal = document.getElementById("meal").value;
    const id = document.getElementById("userid").value;
    // const cal= getDayCalories(date)+calories;
    
    // fetch('/api/getDayCalories/'+date)
    // .then(response => {
    //     if (!response.ok) {
    //         throw new Error(response.statusText);
    //     }
    //     return response.json();
    // })
    // .then(data => {
        // if(data==="null"){
        //     const formData = {
        //         date: date,
        //         name: food,
        //         Calorie: calories,
        //         meal: meal
        //     };
        //     fetch('/addEntries/'+id, {
        //       method: 'POST',
        //       body: JSON.stringify(formData),
        //       headers: {
        //         'Content-Type': 'application/json'
        //       }
        //     })
           
            
        //     updateEntriesTable();
        // }
        // else{
            // const calories1 = Number(data.CalorieOftheDay)+calories;
            // if(calories1 > limit){
            //     alert("you reached the limit for this day")
            // }
            // else{
                const formData = {
                    date: date,
                    name: food,
                    Calorie: calories,
                    meal: meal
                };
                fetch('/addEntries/'+id, {
                  method: 'POST',
                  body: JSON.stringify(formData),
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })
               
                
                updateEntriesTable();
            // }  
        // }
       
    // })
    // .catch(error => {
    //     alert( error);
    // });
    
    
     });


   
