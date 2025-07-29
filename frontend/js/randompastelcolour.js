 // -------------------------- Get Random Pastel Color --------------------------
// This function generates a random pastel color in HSL format.
 function getRandomPastelColor() {
    // Hue (0-360) can be random for different colors
    const hue = Math.floor(Math.random() * 360);
    // Saturation (e.g., 70-90%) for pastel effect
    const saturation = Math.floor(Math.random() * 20) + 70; // 70% to 89%
    // Lightness (e.g., 80-95%) for pastel effect
    const lightness = Math.floor(Math.random() * 15) + 80; // 80% to 94%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Get the button element
const changeColorBtn = document.getElementById('changeColorBtn');

// Add event listener to change background on click
changeColorBtn.addEventListener('click', () => {
    document.body.style.backgroundColor = getRandomPastelColor();
});

// Set an initial random pastel background on page load
document.body.style.backgroundColor = getRandomPastelColor();