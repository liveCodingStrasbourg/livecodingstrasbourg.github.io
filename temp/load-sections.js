// Function to load HTML content from external files
function loadHTML(containerId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML = html;
        })
        .catch(error => console.error('Error loading ' + filePath + ': ', error));
}

// Load all sections when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadHTML('header-container', 'sections/header.html');
    loadHTML('hero-container', 'sections/hero.html');
    loadHTML('ateliers-container', 'sections/ateliers.html');
    loadHTML('register-container', 'sections/register.html');
    loadHTML('outils-container', 'sections/outils.html');
    loadHTML('amis-container', 'sections/amis.html');
    loadHTML('faq-container', 'sections/faq.html');
    loadHTML('archives-container', 'sections/archives.html');
    loadHTML('footer-container', 'sections/footer.html');
});