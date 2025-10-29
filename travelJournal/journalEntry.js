const port = 5000;

document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('SubmitButton');

    submitButton.addEventListener('click', async() => {
        const country = document.getElementById('country').value;
        const date = document.getElementById('date').value;
        const image = document.getElementById('image').value;
        const content = document.getElementById('paragraph').value; 

        if (!country || !date || !content) {
            alert('Please fill out all required fields.');
            return;
        }

        const entry = {
            title: `Trip to ${country}`,
            location: country,
            date: date,
            content: content
        };

        /* 
        try {
            const response = await fetch(`http://localhost:${port}`), {
                method: 'POST', 
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(entry)
            }
        } */
    });
})