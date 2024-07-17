document.addEventListener('DOMContentLoaded', () => {
  const modalOpenButton = document.getElementById('modalOpenButton');
  const modalCloseButton = document.getElementById('modalCloseButton');
  const modal = document.getElementById('modalContainer');

  if (modalOpenButton) {
    modalOpenButton.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  }

  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  document.getElementById('confirmButton').addEventListener('click', function() {
    // Get all checked checkboxes
    const checkboxes = document.querySelectorAll('input[name="score"]:checked');
    // Extract values (here we assume you want to count the number of checked checkboxes)
    const score = checkboxes.length;

    // Send score to the server
    fetch('/saveScore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ score: score })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // Optionally, handle success response
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  });
});


const quest1=document.getElementById('quest1')
const quest2=document.getElementById('quest2')
const quest3=document.getElementById('quest3')

