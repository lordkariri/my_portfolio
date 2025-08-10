const wrapper = document.querySelector('.wrapper');
const scrollArea = document.querySelector('.scroll-area');
const labels = document.querySelectorAll('.label'); 
const homeLabel = labels[2]; // "home"
const scrollWidth = scrollArea.scrollWidth;

// Function to scroll and center a section
function scrollToSection(labelIndex) {
  const targetLeftPercent = parseFloat(labels[labelIndex].style.left);
  const targetOffset = (targetLeftPercent / 100) * scrollWidth - (window.innerWidth / 2);
  wrapper.scrollTo({
    left: targetOffset,
    behavior: 'smooth'
  });
}

// ✅ Initial scroll to "home"
window.addEventListener('load', () => {
  scrollToSection(2);
});

// ✅ Button → Section Mapping
document.getElementById('btn-code').addEventListener('click', () => scrollToSection(1));
document.getElementById('btn-home').addEventListener('click', () => scrollToSection(2));
document.getElementById('btn-music').addEventListener('click', () => scrollToSection(3));
document.getElementById('btn-contact').addEventListener('click', () => scrollToSection(4));
