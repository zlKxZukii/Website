// Wave Effect

function wave() {
  document.querySelectorAll('.wave').forEach(element => {
    const text = element.textContent;
    element.textContent = ''; // Originaltext leeren

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      // Leerzeichen erhalten, damit der Fluss stimmt
      span.textContent = char === ' ' ? '\u00A0' : char;
      // Verzögerung basierend auf der Position des Buchstabens
      span.style.animationDelay = `${index * 0.1}s`;
      element.appendChild(span);
    });
  });
}
// Glitch Effect

function glitch() {
  document.querySelectorAll('.glitch').forEach(el => {
  el.setAttribute('data-text', el.textContent);
}); 
}

// Stair

function staircase() {
  document.querySelectorAll('.staircase').forEach(el => {
  const chars = el.textContent.split("");
  el.textContent = "";
  chars.forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    span.style.animation = `staircase-anim 2s forwards ${i * 0.05}s infinite`;
    span.style.opacity = "0";
    el.appendChild(span);
  });
});
}